"""Generate smaller WebP variants used by the toolkit folder previews."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ROOT / "assets" / "projects"

LANDSCAPE = [
    "seal-ui-realtime",
    "seal-ui-ng",
    "seal-ui-ngview",
    "seal-ui-config",
    "xmesh-overview",
    "xmesh-terrain",
    "xmesh-dcu-scaling",
]

PORTRAIT = [
    "yanbiao-1",
    "yanbiao-4",
    "yanbiao-3",
    "yanbiao-5",
    "yanbiao-6",
]


def resize(source_name: str, target_width: int) -> None:
    source = PROJECTS / f"{source_name}.webp"
    output = PROJECTS / f"{source_name}-{target_width}.webp"
    with Image.open(source) as image:
        image = image.convert("RGB")
        height = round(image.height * target_width / image.width)
        resized = image.resize((target_width, height), Image.Resampling.LANCZOS)
        resized.save(output, "WEBP", quality=72, method=6)
    print(f"{output.name}: {output.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    for name in LANDSCAPE:
        resize(name, 560)
    for name in PORTRAIT:
        resize(name, 280)
