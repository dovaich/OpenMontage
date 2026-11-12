"""Image generation via Cloudflare Workers AI (free daily allowance).

A free Cloudflare account includes 10,000 "neurons" a day, enough for
hundreds of FLUX.1 schnell / SDXL Lightning images, and the allowance resets
every day.

Auth: an API token with the "Workers AI" permission, from
``CLOUDFLARE_API_TOKEN`` or injected by the network proxy for
api.cloudflare.com. The account id comes from ``CLOUDFLARE_ACCOUNT_ID`` or
is looked up with the token.
"""

from __future__ import annotations

import base64
import os
import random
import time
from pathlib import Path
from typing import Any

from tools.base_tool import (
    BaseTool,
    Determinism,
    ExecutionMode,
    ResourceProfile,
    RetryPolicy,
    ToolResult,
    ToolRuntime,
    ToolStability,
    ToolStatus,
    ToolTier,
)

API = "https://api.cloudflare.com/client/v4"

MODELS = {
    "flux-schnell": "@cf/black-forest-labs/flux-1-schnell",
    "sdxl-lightning": "@cf/bytedance/stable-diffusion-xl-lightning",
    "sdxl": "@cf/stabilityai/stable-diffusion-xl-base-1.0",
    "dreamshaper": "@cf/lykon/dreamshaper-8-lcm",
}

ASPECT_SIZES = {
    "1:1": (1024, 1024),
    "16:9": (1344, 768),
    "9:16": (768, 1344),
    "4:3": (1152, 896),
    "3:4": (896, 1152),
}


class CloudflareImage(BaseTool):
    name = "cloudflare_image"
    version = "0.1.0"
    tier = ToolTier.GENERATE
    capability = "image_generation"
    provider = "cloudflare_workers_ai"
    stability = ToolStability.EXPERIMENTAL
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.SEEDED
    runtime = ToolRuntime.API

    dependencies = []
    install_instructions = (
        "1. Create a free account at https://dash.cloudflare.com\n"
        "2. Create an API token with the 'Workers AI' permission "
        "(My Profile > API Tokens > Create Token > 'Workers AI' template).\n"
        "3. Set CLOUDFLARE_API_TOKEN (or save it as a network secret for api.cloudflare.com) "
        "and CLOUDFLARE_ACCOUNT_ID."
    )
    agent_skills = ["flux-best-practices"]

    capabilities = ["generate_image", "text_to_image"]
    supports = {"free": True, "seed": True, "aspect_ratio": True, "daily_free_allowance": True}
    best_for = [
        "reliable free image generation (hundreds per day)",
        "fast FLUX.1 schnell drafts with steady turnaround",
    ]
    not_good_for = ["readable text inside images", "photoreal hero shots"]

    input_schema = {
        "type": "object",
        "required": ["prompt"],
        "properties": {
            "prompt": {"type": "string"},
            "model": {"type": "string", "enum": list(MODELS.keys()), "default": "flux-schnell"},
            "aspect_ratio": {
                "type": "string",
                "enum": list(ASPECT_SIZES.keys()),
                "default": "16:9",
                "description": "Applies to SDXL models; flux-schnell always returns 1024x1024.",
            },
            "steps": {"type": "integer", "description": "flux-schnell max 8 (default 4)."},
            "seed": {"type": "integer"},
            "output_path": {"type": "string"},
        },
    }

    resource_profile = ResourceProfile(cpu_cores=1, ram_mb=256, vram_mb=0, disk_mb=20, network_required=True)
    retry_policy = RetryPolicy(max_retries=2, backoff_seconds=5.0, retryable_errors=["429", "timeout"])
    idempotency_key_fields = ["prompt", "model", "aspect_ratio", "steps", "seed"]
    side_effects = ["writes image file to output_path", "calls Cloudflare Workers AI"]
    user_visible_verification = ["Inspect generated image for prompt adherence"]

    _account_cache: str | None = None

    @staticmethod
    def _headers() -> dict[str, str]:
        token = os.environ.get("CLOUDFLARE_API_TOKEN", "").strip()
        # With no local token the proxy injects the saved network secret.
        return {"Authorization": f"Bearer {token}"} if token else {}

    def get_status(self) -> ToolStatus:
        if os.environ.get("CLOUDFLARE_API_TOKEN", "").strip() or os.environ.get("CLOUDFLARE_ACCOUNT_ID", "").strip():
            return ToolStatus.AVAILABLE
        return ToolStatus.UNAVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        return 0.0

    def estimate_runtime(self, inputs: dict[str, Any]) -> float:
        return 8.0

    def _account_id(self) -> str:
        env_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "").strip()
        if env_id:
            return env_id
        if CloudflareImage._account_cache:
            return CloudflareImage._account_cache
        import requests

        resp = requests.get(f"{API}/accounts", headers=self._headers(), timeout=30)
        resp.raise_for_status()
        accounts = resp.json().get("result") or []
        if not accounts:
            raise RuntimeError("token sees no Cloudflare accounts; set CLOUDFLARE_ACCOUNT_ID")
        CloudflareImage._account_cache = accounts[0]["id"]
        return CloudflareImage._account_cache

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        import requests

        start = time.time()
        prompt = inputs["prompt"]
        model_key = inputs.get("model", "flux-schnell")
        if model_key not in MODELS:
            return ToolResult(success=False, error=f"Unknown model '{model_key}'. Options: {list(MODELS)}")
        model = MODELS[model_key]
        seed = int(inputs["seed"]) if inputs.get("seed") is not None else random.randint(0, 2**31 - 1)

        payload: dict[str, Any] = {"prompt": prompt, "seed": seed}
        if model_key == "flux-schnell":
            payload["steps"] = min(8, int(inputs.get("steps") or 4))
        else:
            width, height = ASPECT_SIZES.get(inputs.get("aspect_ratio", "16:9"), ASPECT_SIZES["16:9"])
            payload.update({"width": width, "height": height})
            if inputs.get("steps"):
                payload["num_steps"] = min(20, int(inputs["steps"]))

        try:
            account = self._account_id()
            resp = requests.post(
                f"{API}/accounts/{account}/ai/run/{model}",
                headers=self._headers(),
                json=payload,
                timeout=120,
            )
            if not resp.ok:
                return ToolResult(
                    success=False,
                    error=f"Cloudflare Workers AI HTTP {resp.status_code}: {resp.text[:300]}",
                )
            ctype = resp.headers.get("content-type", "")
            if ctype.startswith("image/"):
                content = resp.content
            else:
                body = resp.json()
                image_b64 = (body.get("result") or {}).get("image")
                if not image_b64:
                    return ToolResult(success=False, error=f"No image in response: {str(body)[:300]}")
                content = base64.b64decode(image_b64)
        except Exception as exc:
            return ToolResult(success=False, error=f"Cloudflare Workers AI failed: {exc}")

        ext = ".png" if content[:4] == b"\x89PNG" else ".jpg"
        output_path = Path(inputs.get("output_path") or f"generated_image{ext}")
        if not output_path.suffix:
            output_path = output_path.with_suffix(ext)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(content)

        return ToolResult(
            success=True,
            data={"provider": "cloudflare_workers_ai", "model": model, "prompt": prompt, "output": str(output_path)},
            artifacts=[str(output_path)],
            cost_usd=0.0,
            duration_seconds=round(time.time() - start, 2),
            seed=seed,
            model=model,
        )
