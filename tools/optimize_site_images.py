"""Create responsive WebP variants for personal-site lifestyle photos."""

from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PHOTOS = ROOT / "assets" / "photos"
WIDTHS = (480, 720, 960)


def build(source: Path, width: int) -> None:
    output = source.with_name(f"{source.stem}-{width}.webp")
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        if image.width > width:
            height = round(image.height * width / image.width)
            image = image.resize((width, height), Image.Resampling.LANCZOS)
        image.save(output, "WEBP", quality=76, method=6)
    print(f"{output.name}: {output.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    sources = sorted(
        path
        for path in PHOTOS.glob("life-*.jpg")
        if not path.stem.endswith("-m")
    )
    for source in sources:
        for target_width in WIDTHS:
            build(source, target_width)
