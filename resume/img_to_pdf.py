# -*- coding: utf-8 -*-
"""Turn a page screenshot into an A4 PDF (one image per page, web look preserved).

Usage: python img_to_pdf.py <image.png> <out.pdf> [portrait|landscape|portrait-fit]

portrait / landscape: fitted to the page width at native resolution; if taller
than one page, sliced across pages instead of being shrunk to unreadable size.
portrait-fit: the whole shot is scaled down (kept centred) so everything lands on
a single A4 page.
"""

import os
import sys

import pymupdf
from PIL import Image, ImageStat

A4 = {"portrait": (595.0, 841.9), "landscape": (841.9, 595.0)}
DPI = 72  # pymupdf 把图片按 1px = 1pt 处理，dpi=72 即原分辨率
SEARCH_WINDOW = 260  # 在目标切点上下各找这么多像素，挑一行最空白的


def best_cut_row(gray: Image.Image, target: int, lo: int, hi: int) -> int:
    """在 [lo, hi] 范围内找灰度方差最小的一行（即最接近空白的地方）作为切点。"""
    hi = min(hi, gray.height - 1)
    lo = max(lo, 1)
    best, best_std = target, None
    for y in range(lo, hi + 1):
        std = ImageStat.Stat(gray.crop((0, y, gray.width, y + 1))).stddev[0]
        if best_std is None or std < best_std:
            best, best_std = y, std
    return best


def main() -> int:
    src, dst = sys.argv[1], sys.argv[2]
    mode = (sys.argv[3] if len(sys.argv) > 3 else "portrait").lower()
    fit_one_page = mode.endswith("-fit")
    base = mode[:-4] if fit_one_page else mode
    if base not in A4:
        raise SystemExit(f"unknown mode: {mode}")
    pw, ph = A4[base]

    img = pymupdf.open(src)
    rect = img[0].rect
    doc = pymupdf.open()

    page_height_pt = ph * (rect.width / pw)  # 按宽度撑满时，一页能容纳的图片高度
    if fit_one_page:
        # 整张图等比缩放到一页内（两边都放得下），居中摆放
        factor = min(pw / rect.width, ph / rect.height)
        w, h = rect.width * factor, rect.height * factor
        page = doc.new_page(width=pw, height=ph)
        pix = img[0].get_pixmap(dpi=DPI)
        page.insert_image(
            pymupdf.Rect((pw - w) / 2, (ph - h) / 2, (pw + w) / 2, (ph + h) / 2),
            stream=pix.tobytes("png"),
        )
        pages = 1
    elif page_height_pt >= rect.height:
        page = doc.new_page(width=pw, height=ph)
        pix = img[0].get_pixmap(dpi=DPI)
        page.insert_image(pymupdf.Rect(0, 0, pw, page_height_pt), stream=pix.tobytes("png"))
        pages = 1
    else:
        gray = Image.open(src).convert("L")
        pages = 0
        top = 0.0
        while top < rect.height - 2:
            nominal = top + page_height_pt
            if nominal >= rect.height - 2:
                bottom = rect.height
            else:
                # 图片 1px = 1pt，直接在同一坐标系里找最空白的切点
                cut = best_cut_row(
                    gray,
                    int(nominal),
                    int(nominal - SEARCH_WINDOW),
                    int(nominal + SEARCH_WINDOW),
                )
                bottom = float(cut)
            pix = img[0].get_pixmap(dpi=DPI, clip=pymupdf.Rect(0, top, rect.width, bottom))
            page = doc.new_page(width=pw, height=ph)
            page.insert_image(
                pymupdf.Rect(0, 0, pw, pw * (bottom - top) / rect.width),
                stream=pix.tobytes("png"),
            )
            pages += 1
            top = bottom

    doc.save(dst, deflate=True, garbage=3)
    print(
        f"wrote {dst}  pages={pages}  {os.path.getsize(dst) / 1024:.0f} KB  "
        f"({mode} {pw:.0f}x{ph:.0f}pt, image {int(rect.width)}x{int(rect.height)}px)"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
