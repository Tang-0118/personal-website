"""把 /demo 跳转页指向固定的命名隧道地址。"""

import re
from pathlib import Path

URL = "https://demo.kexin.uno/app/"
PAGE = Path(r"E:\github_projects\personal-website\demo\index.html")

html = PAGE.read_text(encoding="utf-8")
html = re.sub(r"https://[a-z0-9-]+\.trycloudflare\.com/app/", URL, html)
html = re.sub(r"https://[a-z0-9-]+\.trycloudflare\.com", "https://demo.kexin.uno", html)
PAGE.write_text(html, encoding="utf-8")

remaining = re.findall(r"https://[^\s\"'<>]+", html)
print("页面里的链接:")
for item in dict.fromkeys(remaining):
    print("  ", item)
