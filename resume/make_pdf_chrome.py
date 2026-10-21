"""Chrome CLI 打印 cv.html。

CDP 的 Page.printToPDF 在这版 Chrome 上不可用，而 CSS zoom 又不影响打印分页，
所以改用「缩小打印基准字号」来压页——打印样式本来就是 rem 布局，缩字号即整体缩放。
"""

import re
import subprocess
from pathlib import Path

SITE = Path(r"E:\github_projects\personal-website")
CV = SITE / "cv.html"
RESUME = SITE / "resume"
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")

BASE_PX = 12.4  # build_cv_html.py 里 PRINT_OVERRIDES 的默认打印字号

# 页面用了入场动画（animation: ... both），起始 opacity 为 0；直接打印会拍到「还没出现」的状态，
# 抬头整块是空白的。打印时必须把动画和变换全部关掉。
ANIM_OFF = """
@media print {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
"""

# 只超出几行时的收口：收紧段间距、隐藏页脚署名（页内已有姓名抬头）
COMPACT_CSS = """
@media print {
  html { font-size: %(px)spx; }
  .footer { display: none; }
  /* 打印样式默认给卡片加了 break-inside: avoid，整块推不下就整块跳页，
     这是「字号再小也还是两页」的真正原因；压一页时必须允许跨页断开。 */
  .project-card, .entry, .skill-group, .award-item { break-inside: auto !important; }
  .section { padding-top: .6rem; }
  .entry { margin-bottom: .65rem; }
  .entry-list li { margin-bottom: .08rem; }
  .award-item, .skill-group { margin-bottom: .12rem; }
  .hero { padding: .7rem 0 .6rem; }
}
"""


def pages_of(path: Path) -> int:
    return len(re.findall(rb"/Type\s*/\s*Page[^s]", path.read_bytes()))


def _render(html: str, out: Path) -> int:
    tmp = RESUME / "_print.html"
    tmp.write_text(html, encoding="utf-8")
    if out.exists():
        out.unlink()
    subprocess.run(
        [str(CHROME), "--headless=new", "--disable-gpu", "--no-sandbox",
         "--no-pdf-header-footer", f"--print-to-pdf={out}", tmp.as_uri()],
        check=True, capture_output=True,
    )
    return pages_of(out)


def render(px: float | None, out: Path) -> int:
    html = CV.read_text(encoding="utf-8")
    extra = ANIM_OFF + (COMPACT_CSS % {"px": px} if px else "")
    html = html.replace("</head>", "<style>" + extra + "</style></head>", 1)
    return _render(html, out)


def main() -> None:
    one = RESUME / "_one-page.pdf"
    best = None
    for px in (BASE_PX, 12.0, 11.6, 11.2, 10.8, 10.4):
        count = render(px, one)
        print(f"字号 {px}px + 紧凑样式: {count} 页")
        if count <= 1:
            best = px
            break
    print("一页版字号：", best if best else "仍装不下")

    two = RESUME / "_two-page.pdf"
    print("两页版（原始字号 + 关动画）：", render(None, two), "页")


if __name__ == "__main__":
    main()
