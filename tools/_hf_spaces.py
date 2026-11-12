"""Shared helpers for calling free Hugging Face Spaces (Gradio apps).

Free ZeroGPU Spaces give every caller a small daily GPU quota (anonymous
callers per IP, signed-in callers per account). When one Space refuses with a
quota or queue error, callers move on to the next Space in their list, which
is why the tools built on this module take an ordered ``spaces`` list.

Authentication: if ``HF_TOKEN`` (or ``HUGGINGFACE_TOKEN``) is set it is sent
to the Space, which unlocks the account's own ZeroGPU quota. In cloud
sessions the network proxy may inject the token instead, so no variable is
needed there.
"""

from __future__ import annotations

import os
import shutil
from pathlib import Path
from typing import Any, Callable

QUOTA_MARKERS = (
    "zerogpu quota",
    "exceeded your",
    "gpu quota",
    "queue is full",
    "too many requests",
    "rate limit",
    "429",
    "no gpu was available",
    "gpu task aborted",
    "space is sleeping",
    "paused",
    "building",
)


def gradio_client_available() -> bool:
    try:
        import gradio_client  # noqa: F401
    except ImportError:
        return False
    return True


def hf_token() -> str | None:
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_TOKEN")
    return token.strip() if token and token.strip().startswith("hf_") else None


def is_quota_error(message: str) -> bool:
    lowered = message.lower()
    return any(marker in lowered for marker in QUOTA_MARKERS)


def call_space(space: str, api_name: str, args: list[Any], timeout: float = 600.0) -> Any:
    """Run one prediction on a Space and return the raw Gradio result."""
    from gradio_client import Client

    kwargs: dict[str, Any] = {"verbose": False}
    token = hf_token()
    if token:
        kwargs["token"] = token
    url = space if space.startswith("http") else f"https://{space_subdomain(space)}.hf.space/"
    client = Client(url, **kwargs)
    job = client.submit(*args, api_name=api_name)
    return job.result(timeout=timeout)


def space_subdomain(space_id: str) -> str:
    """'black-forest-labs/FLUX.1-schnell' -> 'black-forest-labs-flux-1-schnell'."""
    return space_id.lower().replace("/", "-").replace(".", "-").replace("_", "-")


def first_file_path(result: Any) -> str | None:
    """Find the first local file path inside a Gradio result."""
    if isinstance(result, str):
        return result if os.path.isfile(result) else None
    if isinstance(result, dict):
        for key in ("video", "path", "image", "name"):
            if key in result:
                found = first_file_path(result[key])
                if found:
                    return found
        for value in result.values():
            found = first_file_path(value)
            if found:
                return found
        return None
    if isinstance(result, (list, tuple)):
        for item in result:
            found = first_file_path(item)
            if found:
                return found
    return None


def copy_output(src: str, output_path: str | None, default_name: str) -> Path:
    suffix = Path(src).suffix or Path(default_name).suffix
    dest = Path(output_path) if output_path else Path(default_name).with_suffix(suffix)
    if not dest.suffix:
        dest = dest.with_suffix(suffix)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)
    return dest


def run_with_fallback(
    order: list[str],
    catalog: dict[str, dict[str, Any]],
    build_args: Callable[[str, dict[str, Any]], list[Any]],
    timeout: float = 600.0,
) -> tuple[str, Any, list[str]]:
    """Try each Space in ``order``; return (key, result, errors).

    Moves to the next Space on quota/queue errors and on any other failure,
    recording why each one was skipped. Raises RuntimeError when all fail.
    """
    errors: list[str] = []
    for key in order:
        entry = catalog[key]
        try:
            args = build_args(key, entry)
            result = call_space(entry["space"], entry["api_name"], args, timeout=timeout)
            return key, result, errors
        except Exception as exc:  # noqa: BLE001 - each Space fails differently
            message = str(exc) or type(exc).__name__
            tag = "quota" if is_quota_error(message) else "error"
            errors.append(f"{key} ({tag}): {message[:300]}")
    raise RuntimeError("All Hugging Face Spaces failed:\n  " + "\n  ".join(errors))
