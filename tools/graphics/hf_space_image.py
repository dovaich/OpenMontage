"""Free image generation through public Hugging Face Spaces (ZeroGPU).

Calls well-known Spaces (Z-Image Turbo, FLUX.1 schnell/dev, FLUX.2 dev,
Qwen-Image) over the Gradio API. Free, but every caller gets a small daily
ZeroGPU quota; when one Space refuses, the tool moves on to the next.
"""

from __future__ import annotations

import random
import time
from typing import Any

from tools._hf_spaces import (
    copy_output,
    first_file_path,
    gradio_client_available,
    run_with_fallback,
)
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

ASPECT_SIZES = {
    "1:1": (1024, 1024),
    "16:9": (1280, 720),
    "9:16": (720, 1280),
    "4:3": (1152, 864),
    "3:4": (864, 1152),
    "3:2": (1248, 832),
    "2:3": (832, 1248),
}

ZIMAGE_RESOLUTIONS = {
    "1:1": "1024x1024 ( 1:1 )",
    "16:9": "1280x720 ( 16:9 )",
    "9:16": "720x1280 ( 9:16 )",
    "4:3": "1152x864 ( 4:3 )",
    "3:4": "864x1152 ( 3:4 )",
    "3:2": "1248x832 ( 3:2 )",
    "2:3": "832x1248 ( 2:3 )",
}

QWEN_ASPECTS = {"1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"}

SPACES: dict[str, dict[str, Any]] = {
    "z-image-turbo": {"space": "Tongyi-MAI/Z-Image-Turbo", "api_name": "/generate"},
    "flux-schnell": {"space": "black-forest-labs/FLUX.1-schnell", "api_name": "/infer"},
    "qwen-image": {"space": "Qwen/Qwen-Image", "api_name": "/infer"},
    "flux-dev": {"space": "black-forest-labs/FLUX.1-dev", "api_name": "/infer"},
    "flux2-dev": {"space": "black-forest-labs/FLUX.2-dev", "api_name": "/infer"},
}
DEFAULT_ORDER = ["z-image-turbo", "flux-schnell", "qwen-image", "flux-dev", "flux2-dev"]


class HFSpaceImage(BaseTool):
    name = "hf_space_image"
    version = "0.1.0"
    tier = ToolTier.GENERATE
    capability = "image_generation"
    provider = "huggingface_spaces"
    stability = ToolStability.EXPERIMENTAL
    execution_mode = ExecutionMode.SYNC
    determinism = Determinism.SEEDED
    runtime = ToolRuntime.API

    dependencies = ["python:gradio_client"]
    install_instructions = (
        "pip install gradio_client\n"
        "Optional: set HF_TOKEN (free account at https://huggingface.co/settings/tokens) "
        "for a larger daily ZeroGPU quota."
    )
    agent_skills = ["flux-best-practices"]

    capabilities = ["generate_image", "text_to_image"]
    supports = {
        "free": True,
        "seed": True,
        "aspect_ratio": True,
        "multi_space_fallback": True,
    }
    best_for = [
        "free image generation with no API key",
        "FLUX / Qwen-Image / Z-Image quality at zero cost",
        "drafts and storyboard frames on a zero budget",
    ]
    not_good_for = [
        "large batches (small daily ZeroGPU quota)",
        "guaranteed turnaround (public queues)",
    ]

    input_schema = {
        "type": "object",
        "required": ["prompt"],
        "properties": {
            "prompt": {"type": "string"},
            "space": {
                "type": "string",
                "enum": ["auto", *SPACES.keys()],
                "default": "auto",
                "description": "Which Space to use. 'auto' tries them in order and falls back on quota errors.",
            },
            "aspect_ratio": {
                "type": "string",
                "enum": list(ASPECT_SIZES.keys()),
                "default": "16:9",
            },
            "seed": {"type": "integer"},
            "output_path": {"type": "string"},
        },
    }

    resource_profile = ResourceProfile(cpu_cores=1, ram_mb=512, vram_mb=0, disk_mb=50, network_required=True)
    retry_policy = RetryPolicy(max_retries=1, backoff_seconds=30.0, retryable_errors=["quota", "timeout"])
    idempotency_key_fields = ["prompt", "space", "aspect_ratio", "seed"]
    side_effects = ["writes image file to output_path", "calls public Hugging Face Spaces"]
    user_visible_verification = ["Inspect generated image for prompt adherence"]

    def get_status(self) -> ToolStatus:
        return ToolStatus.AVAILABLE if gradio_client_available() else ToolStatus.UNAVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        return 0.0

    def estimate_runtime(self, inputs: dict[str, Any]) -> float:
        return 40.0

    @staticmethod
    def _build_args(key: str, prompt: str, aspect: str, seed: int) -> list[Any]:
        width, height = ASPECT_SIZES.get(aspect, ASPECT_SIZES["16:9"])
        if key == "z-image-turbo":
            return [prompt, ZIMAGE_RESOLUTIONS.get(aspect, ZIMAGE_RESOLUTIONS["16:9"]), seed, 8, 3.0, False, []]
        if key == "flux-schnell":
            return [prompt, seed, False, width, height, 4]
        if key == "qwen-image":
            return [prompt, seed, False, aspect if aspect in QWEN_ASPECTS else "16:9", 4.0, 30, False]
        if key == "flux-dev":
            return [prompt, seed, False, width, height, 3.5, 28]
        if key == "flux2-dev":
            return [prompt, [], seed, False, width, height, 30, 4, False]
        raise ValueError(f"Unknown Space key: {key}")

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        if not gradio_client_available():
            return ToolResult(success=False, error="gradio_client not installed. " + self.install_instructions)

        start = time.time()
        prompt = inputs["prompt"]
        aspect = inputs.get("aspect_ratio", "16:9")
        seed = int(inputs["seed"]) if inputs.get("seed") is not None else random.randint(0, 2**31 - 1)
        choice = inputs.get("space", "auto")
        if choice not in ("auto", None) and choice not in SPACES:
            return ToolResult(success=False, error=f"Unknown space '{choice}'. Options: {list(SPACES)}")
        order = DEFAULT_ORDER if choice in ("auto", None) else [choice]

        try:
            key, result, skipped = run_with_fallback(
                order, SPACES, lambda k, _e: self._build_args(k, prompt, aspect, seed), timeout=300
            )
            src = first_file_path(result)
            if not src:
                raise RuntimeError(f"Space returned no image file: {str(result)[:200]}")
            dest = copy_output(src, inputs.get("output_path"), "generated_image.webp")
        except Exception as exc:
            return ToolResult(success=False, error=f"HF Space image generation failed: {exc}")

        return ToolResult(
            success=True,
            data={
                "provider": "huggingface_spaces",
                "space": SPACES[key]["space"],
                "prompt": prompt,
                "aspect_ratio": aspect,
                "output": str(dest),
                "skipped_spaces": skipped,
            },
            artifacts=[str(dest)],
            cost_usd=0.0,
            duration_seconds=round(time.time() - start, 2),
            seed=seed,
            model=SPACES[key]["space"],
        )
