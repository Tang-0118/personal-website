"""渲染任意 cv HTML 变体为 A4 竖版单页 PDF（复用 make_pdf_portrait 的打印样式）。"""

import re
import subprocess
import sys
from pathlib import Path

SITE = Path(r"E:\github_projects\personal-website")
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")
sys.path.insert(0, str(SITE / "resume"))
from make_pdf_portrait import ANIM_OFF, PORTRAIT  # noqa: E402


def pages_of(path: Path) -> int:
    return len(re.findall(rb"/Type\s*/\s*Page[^s]", path.read_bytes()))


def render(html_path: Path, out: Path, px: float) -> int:
    html = html_path.read_text(encoding="utf-8")
    override = "<style>" + ANIM_OFF + (PORTRAIT % {"px": px}) + "</style>"
    html = html.replace("</head>", override + "</head>", 1)
    tmp = html_path.with_suffix(".print.html")
    tmp.write_text(html, encoding="utf-8")
    if out.exists():
        out.unlink()
    subprocess.run(
        [str(CHROME), "--headless=new", "--disable-gpu", "--no-sandbox",
         "--no-pdf-header-footer", f"--print-to-pdf={out}", tmp.resolve().as_uri()],
        check=True, capture_output=True,
    )
    tmp.unlink(missing_ok=True)
    return pages_of(out)


def main() -> None:
    html_path = Path(sys.argv[1]).resolve()
    out = Path(sys.argv[2]).resolve()
    for px in (11.8, 11.4, 11.0, 10.6, 10.2, 9.8):
        count = render(html_path, out, px)
        print(f"{px}px -> {count} 页")
        if count == 1:
            print("采用字号:", px)
            return
    print("最小字号仍超过一页")


if __name__ == "__main__":
    main()
