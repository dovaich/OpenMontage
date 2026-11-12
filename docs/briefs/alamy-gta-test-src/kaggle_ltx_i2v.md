# Free image-to-video on Kaggle (T4) — working recipe

- Auth: the user's Kaggle token is saved as a network secret for `www.kaggle.com` (Bearer). Use `kaggle_client.py`, which calls
  `https://www.kaggle.com/api/v1/<service>/<method>`. The official CLI goes to `api.kaggle.com`, which is not allowed.
- Push a script kernel with `kernels.KernelsApiService/SaveKernel`:
  `{slug: "dovaich/<name>", kernelType: "script", isPrivate: true, enableGpu: true, enableInternet: true, machineShape: "NvidiaTeslaT4", text: <python>}`.
  Embed small input images as base64 inside the script.
- Poll `GetKernelSessionStatus` until it returns COMPLETE or ERROR. Read the log and the file URLs with `ListKernelSessionOutput`. The files download from `www.kaggleusercontent.com`, which is allowed.
- What works on a T4 (15 GB): `LTXImageToVideoPipeline.from_pretrained("Lightricks/LTX-Video", torch_dtype=torch.float16)` with
  `enable_model_cpu_offload()`, `vae.enable_tiling()` and `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`.
  At 384x672 with 73 frames and 30 steps it takes about 40 s of sampling, about 5 min including the model download, and peaks at 12.4 GB.
- Failed attempts:
  - bfloat16 at 480x832 with 97 frames ran out of memory.
  - The `_native_efficient` backend with bfloat16 found no kernel.
  - A float32 VAE together with a float16 pipeline gave a dtype mismatch.
- Quality note: the last ~0.5 s of a clip can smear. Trim it, or generate slightly longer than needed.
