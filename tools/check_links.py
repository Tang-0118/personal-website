# -*- coding: utf-8 -*-
"""Verify every local asset referenced by the site pages actually exists.

Usage: python check_links.py [site_dir]
"""

import os
import re
import sys

SITE = sys.argv[1] if len(sys.argv) > 1 else r"E:\github_projects\personal-website"
SOURCES = [
    "index.html",
    "cv.html",
    os.path.join("assets", "css", "style.css"),
    os.path.join("assets", "js", "main.js"),
]
SKIP_PREFIX = ("http", "mailto:", "tel:", "data:", "//", "codex:", "javascript:")
PATTERN = re.compile(
    r"""(?:src|href)\s*=\s*["']([^"'#?]+)["']|url\(\s*["']?([^"')]+)["']?\s*\)"""
)


def main() -> int:
    missing = []
    checked = 0
    for rel in SOURCES:
        path = os.path.join(SITE, rel)
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8", errors="ignore") as fh:
            text = fh.read()
        base = os.path.dirname(path)
        for match in PATTERN.finditer(text):
            ref = (match.group(1) or match.group(2) or "").strip()
            if not ref or ref.startswith(SKIP_PREFIX):
                continue
            if ref.endswith(".html"):
                target = os.path.join(SITE, ref)
            elif ref.startswith(("assets/", "../", "./")):
                target = os.path.normpath(os.path.join(base, ref))
            else:
                continue
            checked += 1
            if not os.path.exists(target):
                missing.append((rel, ref))

    print(f"checked {checked} local references, missing {len(missing)}")
    for src, ref in missing:
        print(f"MISSING  {src}  ->  {ref}")
    return 1 if missing else 0


if __name__ == "__main__":
    sys.exit(main())
