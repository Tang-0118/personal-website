"""把线上演示入口接进网站：更新 BAGCheck 卡片数字 + 加「在线演示」按钮 + 生成 /demo 跳转页。"""

import re
import sys
from pathlib import Path

SITE = Path(r"E:\github_projects\personal-website")
TUNNEL_LOG = Path(r"E:\Deepseek_projects\rag-eval\tunnel.log")


def find_tunnel() -> str:
    if len(sys.argv) > 1 and sys.argv[1].startswith("https://"):
        return sys.argv[1].rstrip("/")
    raw = TUNNEL_LOG.read_bytes()
    for encoding in ("utf-8", "utf-16", "utf-16-le", "latin-1"):
        try:
            match = re.search(r"https://[a-z0-9-]+\.trycloudflare\.com", raw.decode(encoding, errors="ignore"))
        except LookupError:
            continue
        if match:
            return match.group(0)
    raise SystemExit("没找到隧道地址，请把地址作为参数传进来")


TUNNEL = find_tunnel()
print("隧道地址:", TUNNEL)

# 1) 数字口径更新
index = SITE / "index.html"
html = index.read_text(encoding="utf-8")
before = html
html = html.replace("AI 层 · 八个工具 + 意图路由", "AI 层 · 十六个工具 + 意图路由")
html = html.replace(
    "119 例人工标注上越界评价 0 例",
    "288 例人工标注上越界评价 0 例（仅褶皱 / 工艺参数口径）",
)
html = html.replace(
    "221 条工具路由回归 + 64 条语义评测（事实 / 多跳 / 案例 / 不可答）+ 119 例视觉标注",
    "132 条工具回归（覆盖全部 16 个工具）+ 105 条语义评测（事实 / 多跳 / 案例 / 版本 / 不可答）+ 288 例视觉标注",
)

# 2) 在 BAGCheck 的标签行后插入「在线演示」
if "demo/" not in html:
    anchor = '<span class="tag">FastAPI</span>\n          </div>\n        </div>'
    if anchor not in html:
        raise SystemExit("找不到插入锚点")
    block = (
        '<span class="tag">FastAPI</span>\n          </div>\n'
        '          <div class="project__links">\n'
        '            <a class="project-link project-link--primary" href="demo/" target="_blank" rel="noopener">\n'
        '              在线演示 AI Copilot\n'
        '              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12.5 6l6 6-6 6"/></svg>\n'
        '            </a>\n'
        '          </div>\n        </div>'
    )
    html = html.replace(anchor, block, 1)

if html != before:
    index.write_text(html, encoding="utf-8")
    print("index.html 已更新")
else:
    print("index.html 无变化")

# 3) /demo 跳转页
demo_dir = SITE / "demo"
demo_dir.mkdir(exist_ok=True)
(demo_dir / "index.html").write_text(
    f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>AI Copilot 在线演示</title>
<meta http-equiv="refresh" content="0; url={TUNNEL}/app/" />
<style>
  body {{ margin: 0; min-height: 100vh; display: grid; place-items: center;
         background: #0b1219; color: #e9eff5; font-family: "Microsoft YaHei", system-ui, sans-serif; }}
  .box {{ text-align: center; padding: 32px; }}
  h1 {{ font-size: 20px; margin: 0 0 10px; }}
  p {{ color: #8fa2b5; font-size: 13px; line-height: 1.8; margin: 0 0 18px; }}
  a {{ display: inline-block; padding: 9px 18px; border-radius: 8px; background: #1f6feb;
       color: #fff; text-decoration: none; font-size: 14px; }}
</style>
</head>
<body>
  <div class="box">
    <h1>AI Copilot 演示</h1>
    <p>正在跳转… 如果 3 秒内没有反应，点下面的按钮。</p>
    <a href="{TUNNEL}/app/">进入演示</a>
    <p style="margin-top:22px">演示环境跑在本地 Docker 上，关机后不可访问。</p>
  </div>
</body>
</html>
""",
    encoding="utf-8",
)
print("demo/index.html 已生成 ->", TUNNEL)
