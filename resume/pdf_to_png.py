import sys
from pathlib import Path

import pymupdf

pdf_path = Path(sys.argv[1])
out_dir = Path(sys.argv[2])
out_dir.mkdir(parents=True, exist_ok=True)
prefix = sys.argv[3] if len(sys.argv) > 3 else "page"
dpi = int(sys.argv[4]) if len(sys.argv) > 4 else 150

doc = pymupdf.open(pdf_path)
print("pages:", doc.page_count)
for i, page in enumerate(doc, start=1):
    pix = page.get_pixmap(dpi=dpi)
    target = out_dir / f"{prefix}-{i}.png"
    pix.save(target)
    print("wrote", target, pix.width, "x", pix.height)
