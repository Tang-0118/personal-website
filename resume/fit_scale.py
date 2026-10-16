# -*- coding: utf-8 -*-
"""试出「刚好铺满一张 A4」的缩放比例。

用法：python fit_scale.py [起始比例] [结束比例] [步长]
对每个比例生成一页 PDF 到临时文件，报告页数、内容底部留白，最后给出建议值。
"""

import os
import subprocess
import sys

import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
SHOT = os.path.join(SITE, "tools", "shot_cdp.cjs")
URL = "file:///" + SITE.replace("\\", "/") + "/cv.html"
TMP = os.path.join(HERE, "_fit.pdf")


def render(scale: float) -> tuple:
    env = dict(os.environ, PDF_SCALE=str(scale))
    subprocess.run(["node", SHOT, URL, TMP, "1440", "1000", "-", "light", "portrait"],
                   check=True, env=env, stdout=subprocess.DEVNULL)
    doc = pymupdf.open(TMP)
    pages = doc.page_count
    page = doc[0]
    bottom_margin = page.rect.height - 28.3          # 10mm 下边距
    # 只量文字：背景/分隔线会铺满整页，量进去就没意义了
    blocks = page.get_text("blocks")
    last_y = max([b[3] for b in blocks] + [0])
    gap = bottom_margin - last_y
    doc.close()
    return pages, gap, last_y


def main() -> int:
    lo = float(sys.argv[1]) if len(sys.argv) > 1 else 0.80
    hi = float(sys.argv[2]) if len(sys.argv) > 2 else 0.90
    step = float(sys.argv[3]) if len(sys.argv) > 3 else 0.01
    best = None
    scale = lo
    while scale <= hi + 1e-9:
        pages, gap, last_y = render(round(scale, 3))
        flag = "1 页" if pages == 1 else f"{pages} 页(超了)"
        print(f"scale={scale:.3f}  {flag}  内容底 {last_y:.1f}pt  距下边距还空 {gap:.1f}pt")
        if pages == 1 and (best is None or gap < best[1]):
            best = (round(scale, 3), gap)
        scale += step
    if os.path.exists(TMP):
        os.remove(TMP)
    if best:
        print(f"\n建议：PDF_SCALE={best[0]}（底部留白 {best[1]:.1f}pt，越小越满）")
    else:
        print("\n所有比例都超过一页，需要再缩小比例或删内容")
    return 0


if __name__ == "__main__":
    sys.exit(main())
