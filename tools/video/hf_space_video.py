"""Free video generation through public Hugging Face Spaces (ZeroGPU).

- LTX-Video distilled: text-to-video and image-to-video (short clips).
- Wan 2.2 fast / Wan 2.1 fast: image-to-video only (animate a still).

Free, but each caller gets a small daily ZeroGPU quota, so expect a few short
clips per day. On quota errors the tool falls back to the next Space.
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

SIZES = {"16:9": (704, 400), "9:16": (400, 704), "1:1": (512, 512)}
WAN21_SIZES = {"16:9": (896, 512), "9:16": (512, 896), "1:1": (640, 640)}

SPACES: dict[str, dict[str, Any]] = {
    "ltx-distilled": {
        "space": "Lightricks/ltx-video-distilled",
        "api_name": "/text_to_video",
        "t2v": True,
        "i2v": True,
    },
    "wan2.2-fast": {
        "space": "zerogpu-aoti/wan2-2-fp8da-aoti-faster",
        "api_name": "/generate_video",
        "t2v": False,
        "i2v": True,
    },
    "wan2.1-fast": {
        "space": "multimodalart/wan2-1-fast",
        "api_name": "/generate_video",
        "t2v": False,
        "i2v": True,
    },
}
LTX_NEGATIVE = "worst quality, inconsistent motion, blurry, jittery, distorted"
WAN_NEGATIVE = (
    "Bright tones, overexposed, static, blurred details, subtitles, worst quality, "
    "low quality, JPEG artifacts, ugly, deformed, extra fingers, watermark, text"
)


class HFSpaceVideo(BaseTool):
    name = "hf_space_video"
    version = "0.1.0"
    tier = ToolTier.GENERATE
    capability = "video_generation"
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
    fallback_tools = ["pexels_video", "pixabay_video", "image_selector"]
    agent_skills = ["ltx2"]

    capabilities = ["text_to_video", "image_to_video"]
    supports = {
        "free": True,
        "image_to_video": True,
        "reference_image": True,
        "native_audio": False,
        "multi_space_fallback": True,
    }
    best_for = [
        "free short AI video clips with no API key",
        "animating a still image (Wan 2.2 / LTX) at zero cost",
        "b-roll drafts on a zero budget",
    ]
    not_good_for = [
        "clips longer than ~5 seconds",
        "batches (small daily ZeroGPU quota)",
        "guaranteed turnaround",
    ]

    input_schema = {
        "type": "object",
        "required": ["prompt"],
        "properties": {
            "prompt": {"type": "string"},
            "operation": {
                "type": "string",
                "enum": ["text_to_video", "image_to_video"],
                "default": "text_to_video",
            },
            "reference_image_path": {"type": "string", "description": "Local image to animate (image_to_video)."},
            "reference_image_url": {"type": "string", "description": "Public image URL to animate (image_to_video)."},
            "space": {
                "type": "string",
                "enum": ["auto", *SPACES.keys()],
                "default": "auto",
            },
            "aspect_ratio": {"type": "string", "enum": list(SIZES.keys()), "default": "16:9"},
            "duration_seconds": {"type": "number", "minimum": 1, "maximum": 5, "default": 3},
            "seed": {"type": "integer"},
            "output_path": {"type": "string"},
        },
    }

    resource_profile = ResourceProfile(cpu_cores=1, ram_mb=512, vram_mb=0, disk_mb=200, network_required=True)
    retry_policy = RetryPolicy(max_retries=1, backoff_seconds=60.0, retryable_errors=["quota", "timeout"])
    idempotency_key_fields = ["prompt", "operation", "space", "aspect_ratio", "duration_seconds", "seed"]
    side_effects = ["writes video file to output_path", "calls public Hugging Face Spaces"]
    user_visible_verification = ["Watch generated clip for motion quality and prompt adherence"]

    def get_status(self) -> ToolStatus:
        return ToolStatus.AVAILABLE if gradio_client_available() else ToolStatus.UNAVAILABLE

    def estimate_cost(self, inputs: dict[str, Any]) -> float:
        return 0.0

    def estimate_runtime(self, inputs: dict[str, Any]) -> float:
        return 120.0

    @staticmethod
    def _image_arg(inputs: dict[str, Any]) -> Any:
        from gradio_client import handle_file

        source = inputs.get("reference_image_path") or inputs.get("reference_image_url")
        return handle_file(source) if source else None

    def _build_args(self, key: str, inputs: dict[str, Any], seed: int, image: Any) -> list[Any]:
        prompt = inputs["prompt"]
        aspect = inputs.get("aspect_ratio", "16:9")
        duration = float(min(5, max(1, inputs.get("duration_seconds", 3))))
        if key == "ltx-distilled":
            width, height = SIZES.get(aspect, SIZES["16:9"])
            mode = "image-to-video" if image is not None else "text-to-video"
            return [prompt, LTX_NEGATIVE, image, None, height, width, mode, duration, 9, seed, False, 1, True]
        if image is None:
            raise ValueError("this Space only does image_to_video; pass reference_image_path")
        if key == "wan2.2-fast":
            return [image, prompt, 6, WAN_NEGATIVE, duration, 1, 1, seed, False]
        if key == "wan2.1-fast":
            width, height = WAN21_SIZES.get(aspect, WAN21_SIZES["16:9"])
            return [image, prompt, height, width, WAN_NEGATIVE, duration, 1.0, 4, seed, False]
        raise ValueError(f"Unknown Space key: {key}")

    def execute(self, inputs: dict[str, Any]) -> ToolResult:
        if not gradio_client_available():
            return ToolResult(success=False, error="gradio_client not installed. " + self.install_instructions)

        start = time.time()
        has_image = bool(inputs.get("reference_image_path") or inputs.get("reference_image_url"))
        operation = inputs.get("operation") or ("image_to_video" if has_image else "text_to_video")
        if operation == "image_to_video" and not has_image:
            return ToolResult(success=False, error="image_to_video needs reference_image_path or reference_image_url")

        choice = inputs.get("space", "auto")
        if choice not in ("auto", None) and choice not in SPACES:
            return ToolResult(success=False, error=f"Unknown space '{choice}'. Options: {list(SPACES)}")
        if choice in ("auto", None):
            want = "i2v" if operation == "image_to_video" else "t2v"
            order = [k for k, v in SPACES.items() if v[want]]
            if operation == "image_to_video":
                order = ["wan2.2-fast", "ltx-distilled", "wan2.1-fast"]
        else:
            order = [choice]

        seed = int(inputs["seed"]) if inputs.get("seed") is not None else random.randint(0, 2**31 - 1)
        try:
            image = self._image_arg(inputs) if operation == "image_to_video" else None
            catalog = {k: dict(v) for k, v in SPACES.items()}
            if image is not None:
                catalog["ltx-distilled"]["api_name"] = "/image_to_video"
            key, result, skipped = run_with_fallback(
                order, catalog, lambda k, _e: self._build_args(k, inputs, seed, image), timeout=900
            )
            src = first_file_path(result)
            if not src:
                raise RuntimeError(f"Space returned no video file: {str(result)[:200]}")
            dest = copy_output(src, inputs.get("output_path"), "generated_video.mp4")
        except Exception as exc:
            return ToolResult(success=False, error=f"HF Space video generation failed: {exc}")

        return ToolResult(
            success=True,
            data={
                "provider": "huggingface_spaces",
                "space": SPACES[key]["space"],
                "operation": operation,
                "prompt": inputs["prompt"],
                "output": str(dest),
                "skipped_spaces": skipped,
            },
            artifacts=[str(dest)],
            cost_usd=0.0,
            duration_seconds=round(time.time() - start, 2),
            seed=seed,
            model=SPACES[key]["space"],
        )
