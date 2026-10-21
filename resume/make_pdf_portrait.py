"""A4 竖版单页渲染：覆盖 @page 为 portrait，收紧栏宽，按字号试到一页。"""

import re
import subprocess
from pathlib import Path

SITE = Path(r"E:\github_projects\personal-website")
CV = SITE / "cv.html"
RESUME = SITE / "resume"
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")

ANIM_OFF = """
@media print {
  *, *::before, *::after {
    animation: none !important; transition: none !important;
    opacity: 1 !important; transform: none !important;
  }
}
"""

PORTRAIT = """
@page { size: A4 portrait; margin: 9mm 10mm; }
@media print {
  html { font-size: %(px)spx; }
  .cv-wrapper { width: 100%%; max-width: none; }
  .cv-grid { grid-template-columns: 186px minmax(0, 1fr); column-gap: 1.3rem; }
  .footer { display: none; }
  .project-card, .entry, .skill-group, .award-item { break-inside: auto !important; }
  .section { padding-top: .55rem; }
  .entry { margin-bottom: .6rem; }
  .entry-list li { margin-bottom: .06rem; }
  .award-item, .skill-group { margin-bottom: .1rem; }
  .hero { padding: .7rem 0 .55rem; }
  .contact-row { margin-bottom: .45rem; }
}
"""


def pages_of(path: Path) -> int:
    return len(re.findall(rb"/Type\s*/\s*Page[^s]", path.read_bytes()))


def render(px: float, out: Path) -> int:
    html = CV.read_text(encoding="utf-8")
    override = "<style>" + ANIM_OFF + (PORTRAIT % {"px": px}) + "</style>"
    html = html.replace("</head>", override + "</head>", 1)
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


def main() -> None:
    out = RESUME / "_one-page.pdf"
    chosen = None
    for px in (11.8, 11.4, 11.0, 10.6, 10.2, 9.8, 9.4):
        count = render(px, out)
        print(f"竖版 {px}px: {count} 页")
        if count == 1:
            chosen = px
            break
    print("采用字号:", chosen)
    two = RESUME / "_two-page.pdf"
    print("备用版:", render(10.4, two), "页")


if __name__ == "__main__":
    main()
