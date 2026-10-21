"""Chrome CLI 打印 cv.html，用 zoom 压到一页（CDP 的 printToPDF 在这版 Chrome 上不可用）。"""

import re
import subprocess
from pathlib import Path

SITE = Path(r"E:\github_projects\personal-website")
CV = SITE / "cv.html"
RESUME = SITE / "resume"
CHROME = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")


def pages_of(path: Path) -> int:
    return len(re.findall(rb"/Type\s*/\s*Page[^s]", path.read_bytes()))


def render(zoom: float, out: Path) -> int:
    html = CV.read_text(encoding="utf-8")
    inject = f"<style>html{{zoom:{zoom};}}</style>"
    html = html.replace("</head>", inject + "</head>", 1)
    tmp = RESUME / f"_print_{int(zoom * 100)}.html"
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
    one = RESUME / "_one-page.pdf"
    for zoom in (0.85, 0.78, 0.72, 0.66, 0.60):
        count = render(zoom, one)
        print(f"zoom={zoom}: {count} 页")
        if count == 1:
            break
    two = RESUME / "_two-page.pdf"
    print("两页版 zoom=1.0:", render(1.0, two), "页")


if __name__ == "__main__":
    main()
