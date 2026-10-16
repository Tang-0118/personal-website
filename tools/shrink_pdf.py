# -*- coding: utf-8 -*-
"""Shrink a PDF in place: subset embedded fonts + rebuild the file.
Usage: python tools/shrink_pdf.py <file.pdf>
"""

import os
import sys
import time

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
    for attempt in range(8):
        try:
            os.replace(tmp, path)
            break
        except PermissionError:
            # 目标常被 PDF 预览器占用，等一会儿再试
            if attempt == 7:
                fallback = path.replace(".pdf", "-new.pdf")
                os.replace(tmp, fallback)
                print(f"目标一直被占用，已另存为 {fallback}（关掉预览器后重跑即可）")
                path = fallback
            else:
                time.sleep(5)
    after = os.path.getsize(path)
    print(f"shrunk {path}: {before / 1024:.0f} KB -> {after / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
