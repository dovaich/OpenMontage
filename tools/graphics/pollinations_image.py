"""Free image generation via Pollinations.ai.

Two paths, tried in order:
1. ``gen.pollinations.ai`` (needs a free key from https://enter.pollinations.ai):
   free models such as FLUX.1 schnell, FLUX.2 klein and Z-Image Turbo, no
   watermark, drawn from a daily free "pollen" allowance. The key comes from
   ``POLLINATIONS_API_KEY`` or is injected by the network proxy.
2. ``image.pollinations.ai`` (no key at all): unlimited per day but one
   request at a time per IP, a small watermark, and a basic model.

Any failure on path 1 (no key, allowance used up) falls through to path 2,
so the tool always has a free route.
"""

from __future__ import annotations

import os
import random
import time
from pathlib import Path
from typing import Any
from urllib.parse import quote

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

GEN_BASE = "https://gen.pollinations.ai/image/"
LEGACY_BASE = "https://image.pollinations.ai/prompt/"

ASPECT_SIZES = {
    "1:1": (1024, 1024),
    "16:9": (1280, 720),
    "9:16": (720, 1280),
    "4:3": (1152, 864),
    "3:4": (864, 1152),
}

FREE_MODELS = ["flux", "zimage", "klein"]


class PollinationsImage(BaseTool):
    name = "pollinations_image"
    version = "0.1.0"
    tier = ToolTier.GENERATE
    capability = "image_generation"
    provider = "pollinations"
    stability = ToolStability.EXPERIMENTAL
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.SEEDED
    runtime = ToolRuntime.API

    dependencies = []
    install_instructions = (
        "Works with no key. For better models and no watermark, get a free key at "
        "https://enter.pollinations.ai and set POLLINATIONS_API_KEY."
    )
    agent_skills = ["flux-best-practices"]

    capabilities = ["generate_image", "text_to_image"]
    supports = {"free": True, "seed": True, "aspect_ratio": True, "no_key_mode": True}
    best_for = [
        "free image generation that always has a route (no key needed)",
        "storyboards, drafts, thumbnails, backgrounds on a zero budget",
    ]
    not_good_for = [
        "readable text inside images",
        "parallel batches without a key (one request at a time per IP)",
    ]

    input_schema = {
        "type": "object",
        "required": ["prompt"],
        "properties": {
            "prompt": {"type": "string"},
            "model": {
                "type": "string",
                "enum": FREE_MODELS,
                "default": "flux",
                "description": "Model on the keyed path. The no-key path uses Pollinations' default model.",
            },
            "aspect_ratio": {"type": "string", "enum": list(ASPECT_SIZES.keys()), "default": "16:9"},
            "width": {"type": "integer"},
            "height": {"type": "integer"},
            "seed": {"type": "integer"},
            "enhance": {"type": "boolean", "default": False, "description": "Let Pollinations rewrite the prompt."},
            "output_path": {"type": "string"},
        },
    }

    resource_profile = ResourceProfile(cpu_cores=1, ram_mb=256, vram_mb=0, disk_mb=20, network_required=True)
    retry_policy = RetryPolicy(max_retries=3, backoff_seconds=10.0, retryable_errors=["429", "timeout"])
    idempotency_key_fields = ["prompt", "model", "aspect_ratio", "width", "height", "seed"]
    side_effects = ["writes image file to output_path", "calls pollinations.ai"]
    user_visible_verification = ["Inspect generated image for prompt adherence"]

    def get_status(self) -> ToolStatus:
        return ToolStatus.AVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        return 0.0

    def estimate_runtime(self, inputs: dict[str, Any]) -> float:
        return 20.0

    @staticmethod
    def _fetch(url: str, params: dict[str, Any], headers: dict[str, str], attempts: int) -> "Any":
        import requests

        last = None
        for attempt in range(attempts):
            resp = requests.get(url, params=params, headers=headers, timeout=180)
            if resp.status_code == 429 and attempt < attempts - 1:
                time.sleep(8 * (attempt + 1))
                last = resp
                continue
            return resp
        return last

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        start = time.time()
        prompt = inputs["prompt"]
        width, height = ASPECT_SIZES.get(inputs.get("aspect_ratio", "16:9"), ASPECT_SIZES["16:9"])
        width = int(inputs.get("width") or width)
        height = int(inputs.get("height") or height)
        seed = int(inputs["seed"]) if inputs.get("seed") is not None else random.randint(0, 2**31 - 1)
        model = inputs.get("model", "flux")
        params: dict[str, Any] = {
            "width": width,
            "height": height,
            "seed": seed,
            "nologo": "true",
            "enhance": "true" if inputs.get("enhance") else "false",
        }

        notes: list[str] = []
        content: bytes | None = None
        used = ""
        key = os.environ.get("POLLINATIONS_API_KEY", "").strip()
        headers = {"Authorization": f"Bearer {key}"} if key else {}
        try:
            resp = self._fetch(GEN_BASE + quote(prompt, safe=""), {**params, "model": model}, headers, 2)
            if resp is not None and resp.ok and resp.headers.get("content-type", "").startswith("image/"):
                content, used = resp.content, f"gen.pollinations.ai/{model}"
            elif resp is not None:
                notes.append(f"keyed path skipped: HTTP {resp.status_code} {resp.text[:160]}")
        except Exception as exc:  # noqa: BLE001
            notes.append(f"keyed path skipped: {exc}")

        if content is None:
            try:
                resp = self._fetch(LEGACY_BASE + quote(prompt, safe=""), params, {}, 4)
                if resp is None or not resp.ok or not resp.headers.get("content-type", "").startswith("image/"):
                    detail = f"HTTP {resp.status_code} {resp.text[:200]}" if resp is not None else "no response"
                    return ToolResult(success=False, error=f"Pollinations failed: {detail}; " + "; ".join(notes))
                content, used = resp.content, "image.pollinations.ai (no key)"
            except Exception as exc:
                return ToolResult(success=False, error=f"Pollinations failed: {exc}; " + "; ".join(notes))

        ext = ".png" if content[:4] == b"\x89PNG" else ".jpg"
        output_path = Path(inputs.get("output_path") or f"generated_image{ext}")
        if not output_path.suffix:
            output_path = output_path.with_suffix(ext)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(content)

        return ToolResult(
            success=True,
            data={
                "provider": "pollinations",
                "route": used,
                "prompt": prompt,
                "width": width,
                "height": height,
                "output": str(output_path),
                "notes": notes,
            },
            artifacts=[str(output_path)],
            cost_usd=0.0,
            duration_seconds=round(time.time() - start, 2),
            seed=seed,
            model=used,
        )
