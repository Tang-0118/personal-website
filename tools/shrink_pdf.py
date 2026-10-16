# -*- coding: utf-8 -*-
"""Shrink a PDF in place: subset embedded fonts + rebuild the file.
Usage: python tools/shrink_pdf.py <file.pdf>
"""

import os
import sys

import pymupdf


def main() -> int:
    path = sys.argv[1]
    before = os.path.getsize(path)
    doc = pymupdf.open(path)
    try:
        doc.subset_fonts()
    except Exception as exc:  # 子集化失败不影响成品
        print("subset_fonts skipped:", exc)
    tmp = path + ".tmp"
    doc.save(tmp, garbage=4, deflate=True, clean=True)
    doc.close()
    os.replace(tmp, path)
    after = os.path.getsize(path)
    print(f"shrunk {path}: {before / 1024:.0f} KB -> {after / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
