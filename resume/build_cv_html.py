# -*- coding: utf-8 -*-
"""Build a self-contained HTML CV that reuses the Tyndall design language of cv.moyuin.top."""

import re
import shutil
from pathlib import Path

CSS_SRC = Path(__file__).with_name("moyuin.css") # 样式源随简历放一起，不再依赖 %TEMP%
OUT = Path(r"E:\github_projects\personal-website\cv.html")

def clean_css(raw: str) -> str:
    raw = raw.replace(", .language-notice[data-astro-cid-lcdefpme]", "")
    raw = raw.replace(",.language-notice[data-astro-cid-lcdefpme]", "")
    raw = re.sub(r"\.[a-z-]*notice[a-z-]*[^{}]*\{[^{}]*\}", "", raw)
    raw = raw.replace("[data-astro-cid-lcdefpme]", "")
    raw = re.sub(r"\s*,\s*(?=\})", "", raw)
    raw = re.sub(r"\n{3,}", "\n\n", raw)
    return raw + PRINT_OVERRIDES

# Keeps the two-column design when the page is printed: browsers evaluate the
# width-based media queries against the paper box, which otherwise collapses the
# grid into a long single column.
PRINT_OVERRIDES = """
@media print {
  html { font-size: 12.4px; }
  .cv-wrapper { width: 100%; max-width: none; }
  .hero { padding: .95rem 0 .9rem; }
  .tagline { margin-bottom: .75rem; }
  .contact-row { margin-bottom: .6rem; }
  .cv-grid {
    display: grid;
    grid-template-columns: 232px minmax(0, 1fr);
    column-gap: 2rem;
    padding: .3rem 0 .4rem;
  }
  .cv-aside { display: block; }
  .cv-main { display: block; }
  .cv-aside .section, .cv-main .section { order: 0; }
  .cv-aside::after { content: ""; top: 1rem; bottom: .4rem; right: -1rem; }
  .section { padding-top: .95rem; }
  .section-title { margin-bottom: .6rem; font-size: 1rem; padding-bottom: .4rem; break-after: avoid; }
  .entry { margin-bottom: 1rem; }
  .entry-sub { margin-bottom: .15rem; }
  .entry-detail, .project-summary { font-size: .78rem; line-height: 1.6; }
  .entry-list { margin-top: .35rem; padding-left: .95rem; font-size: .8rem; line-height: 1.6; }
  .entry-list li { margin-bottom: .2rem; }
  .project-card {
    border: 0;
    border-radius: 0;
    padding: 0;
    margin-bottom: .85rem;
  }
  .project-card .project-icon { display: none; }
  .tech-stack { margin-top: .45rem; gap: .28rem; }
  .skills-stack { gap: .62rem; }
  .skill-header { margin-bottom: .3rem; }
  .award-item { padding: .26rem 0; }
  .footer { padding: .7rem 0 0; }
}
"""

ICON_CAP = '<path d="M10 3L1.5 7.5 10 12l8.5-4.5L10 3z"/><path d="M5 9.6V14c0 1.2 2.2 2.4 5 2.4s5-1.2 5-2.4V9.6"/><path d="M18.5 7.5V12"/>'
ICON_GRID = '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/>'
ICON_TROPHY = '<path d="M6.5 3h7v5a3.5 3.5 0 01-7 0V3z"/><path d="M6.5 4H3.8v1.6a2.6 2.6 0 002.7 2.6M13.5 4h2.7v1.6a2.6 2.6 0 01-2.7 2.6"/><path d="M10 11.5V14M7 17h6M8.2 14.5h3.6"/>'
ICON_FOLDER = '<path d="M2.5 6A1.5 1.5 0 014 4.5h3.6L9 6.5h7A1.5 1.5 0 0117.5 8v6.5A1.5 1.5 0 0116 16H4a1.5 1.5 0 01-1.5-1.5V6z"/><path d="M7.8 10.2l-1.6 1.6 1.6 1.6M12.2 10.2l1.6 1.6-1.6 1.6"/>'
ICON_CASE = '<rect x="2.5" y="6.5" width="15" height="9.5" rx="2"/><path d="M7 6.5V5.2A1.7 1.7 0 018.7 3.5h2.6A1.7 1.7 0 0113 5.2v1.3M2.5 10.5h15"/>'
ICON_ALGO = '<path d="M10 2.5v3M10 14.5v3M2.5 10h3M14.5 10h3"/><circle cx="10" cy="10" r="3.2"/><path d="M4.7 4.7l2.1 2.1M13.2 13.2l2.1 2.1M15.3 4.7l-2.1 2.1M6.8 13.2l-2.1 2.1" opacity=".55"/>'
ICON_NN = '<circle cx="3.6" cy="6" r="1.7"/><circle cx="3.6" cy="14" r="1.7"/><circle cx="10" cy="10" r="1.7"/><circle cx="16.4" cy="5.4" r="1.7"/><circle cx="16.4" cy="14.6" r="1.7"/><path d="M5.2 6.9l3.4 2.5M5.3 13.3l3.4-2.5M11.6 9.2l3.2-2.9M11.7 10.8l3.1 2.9"/>'
ICON_CODE = '<path d="M7 5L2.5 10 7 15M13 5l4.5 5-4.5 5M11.5 3L8.5 17"/>'
ICON_DEVICE = '<rect x="2" y="3" width="16" height="12" rx="2.5"/><path d="M2 7h16M7 17h6M10 15v2"/>'
ICON_TERM = '<rect x="2" y="3" width="16" height="14" rx="2.5"/><path d="M6 8.5l3 2-3 2M12 12.5h3"/>'
ICON_PROJ = '<path d="M2.5 6A1.5 1.5 0 014 4.5h3.6L9 6.5h7A1.5 1.5 0 0117.5 8v6.5A1.5 1.5 0 0116 16H4a1.5 1.5 0 01-1.5-1.5V6z"/><path d="M7.8 10.2l-1.6 1.6 1.6 1.6M12.2 10.2l1.6 1.6-1.6 1.6"/>'
ICON_SHIELD = '<path d="M10 2.5l6.2 2.3v5c0 3.6-2.5 6.2-6.2 7.6-3.7-1.4-6.2-4-6.2-7.6v-5L10 2.5z"/><path d="M7.3 10l1.9 1.9 3.5-3.9"/>'

def section_title(icon: str, label: str) -> str:
    return (
        '<h2 class="section-title">'
        f'<span class="st-icon"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" '
        f'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">{icon}</svg></span>'
        f"{label}</h2>"
    )

def skill_group(icon: str, label: str, chips: list[str]) -> str:
    chip_html = "".join(f'<span class="chip">{c}</span>' for c in chips)
    return (
        '<div class="skill-group">'
        '<div class="skill-header">'
        f'<span class="cat-icon"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" '
        f'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">{icon}</svg></span>'
        f'<h4 class="skill-label">{label}</h4></div>'
        f'<div class="skill-chips">{chip_html}</div>'
        "</div>"
    )

def award(text: str) -> str:
    return f'<div class="award-item"><span class="award-dot"></span><span>{text}</span></div>'

def tech_chips(items: list[str]) -> str:
    return '<div class="tech-stack">' + "".join(f'<span class="tech-chip">{i}</span>' for i in items) + "</div>"

def project_card(icon: str, title: str, tag: str, tag_class: str, desc: str, right: str,
                 chips: list[str], summary: str, bullets: list[tuple[str, str]],
                 award: str = "") -> str:
    tag_html = f'<span class="{tag_class}">{tag}</span>' if tag else ""
    if award:
        tag_html += f'<span class="project-tag award-tag">{award}</span>'
    lis = "".join(f"<li><strong>{h}</strong>{t}</li>" for h, t in bullets)
    return (
        '<div class="project-card">'
        '<div class="entry-header"><div class="ph-left">'
        f'<span class="project-icon"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" '
        f'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">{icon}</svg></span>'
        f'<div><h3 class="entry-title">{title} {tag_html}</h3>'
        f'<p class="project-desc">{desc}</p></div></div>'
        f'<span class="project-link">{right}</span></div>'
        f"{tech_chips(chips)}"
        f'<p class="project-summary">{summary}</p>'
        f'<ul class="entry-list">{lis}</ul>'
        "</div>"
    )

SKILLS = [
    (ICON_ALGO, "计算机视觉与图像处理",
     ["OpenCV", "NumPy / scipy", "图像配准与量测", "Otsu / RANSAC / SIFT / ORB", "缺陷检测", "几何量测"]),
    (ICON_NN, "深度学习与模型部署",
     ["目标检测（YOLOv8）", "多目标跟踪", "PyTorch", "ONNXRuntime", "多路视频实时推理", "可视化与实验分析"]),
    (ICON_CODE, "编程语言", ["Python", "C++", "ArkTS"]),
    (ICON_DEVICE, "端侧与并行计算", ["HarmonyOS / ArkTS", "Native NAPI", "MPI", "Kokkos", "HIP / DCU", "Linux / Slurm"]),
    (ICON_TERM, "工程化与工具链", ["PyQt5", "Git", "PyInstaller", "pyserial（Modbus RTU）", "多线程 / 队列", "工业相机 SDK（MVS）"]),
]

AWARDS = [
    "2026 第十三届 PAC 并行应用挑战赛华南赛区 <strong>一等奖</strong>",
    "2026 第十九届中国大学生计算机设计大赛中南地区赛 <strong>三等奖</strong>",
    "2026 湖南大学新文科实践创新大赛 <strong>校级铜奖</strong>",
    "第十九届“挑战杯” <strong>校赛三等奖</strong>",
    "2025—2026 年度优秀志愿者（志愿时长 150 小时）",
    "大学英语六级考试 <strong>CET-6 通过</strong>",
    "论文 PD-CAT 2026 国际会议 <strong>在审</strong>（并行三维网格生成）",
    "<strong>软件著作权</strong> 登记已受理（2026R11L1069227）· 专利在审",
]

PROJECTS = [
    dict(
        icon=ICON_SHIELD,
        title="无人车间人形安全防护系统",
        tag="课题组校企合作 · 已商用上线",
        tag_class="project-tag",
        desc="多路工业相机 + YOLOv8 人员检测：检测到人进入设备区域就锁停设备（机械臂），安全侧只允许「宁可误锁，不可误开」",
        right="2026 — 至今",
        chips=["Python", "YOLOv8", "ONNXRuntime / PyTorch", "OpenCV", "PyQt5", "多线程 / 队列",
               "pyserial（Modbus RTU）", "海康 MVS SDK", "PyInstaller"],
        summary="面向无人车间的安全防护系统：机械臂等自动化设备运行时，一旦检测到人员进入设备区域立即输出锁机信号停止设备；本人负责人员检测与多路相机实时推理、安全状态机与上位机软件开发，并完成 CPU（2 路）/ GPU（4 路）两套现场版本交付。",
        bullets=[
            ("检测与实时推理调度：",
             "YOLOv8 单类人员检测，2–4 路 1280×720 工业相机并发；推理按「只保留最新帧 + 轮询公平调度 + batch=1」组织，不等待凑批；以 ModelFactory 统一 backend 协议，可在 PyTorch（CUDA / CPU）、ONNXRuntime、算能 Sophon NPU 之间切换"),
            ("区域与方向判定：",
             "多边形 ROI 划分 ON / IN / OUT 三区，门区短轨迹状态机按位移投影判定 ENTER / LEAVE，对检测抖动与丢帧容错，输出设备内实时人数与进出净流量"),
            ("Fail-Safe 安全设计：",
             "STARTUP / PERSON / FAULT LOCK 状态机——启动默认锁机、检测到人保持锁机、任一模块心跳超时即判故障并强制锁机；复位需同时满足「无人 + 无故障 + 模块健康」并在执行前二次复查"),
            ("时延验收与工控联锁：",
             "端到端以 T0 相机取帧 → T1 继电器写入成功 ≤ 200 ms 为验收口径，拆成 acquire / scheduler / infer / rule / safety / io 六段统计 p95 / p99；锁机经 Modbus RTU 输出并保留 DI 软复位，IO 侧 3 次重试 + 死信队列 + 紧急锁机回调"),
        ],
    ),
    dict(
        icon=ICON_ALGO,
        title="工业包装袋封口质量在线检测系统",
        tag="课题组校企合作 · 已商用上线",
        tag_class="project-tag",
        award="计算机设计大赛中南赛区三等奖",
        desc="红外热成像 + 可见光双相机的产线封口质量在线判别系统，NG 由 PLC 驱动剔除",
        right="2026.03 — 至今",
        chips=["Python", "OpenCV", "NumPy", "PyQt5", "多线程 / 队列", "pyserial（Modbus RTU）",
               "C SDK 封装（ctypes）", "PyInstaller"],
        summary="面向上产线的实时质检系统：双相机同帧采集、三态判定与离线回归闭环，已商用上线；本人负责视觉算法与上位机软件开发。",
        bullets=[
            ("图像算法链路（可见光）：",
             "4 项加权边缘得分图 → 动态规划求全局最优连续边缘 → 确定性 RANSAC 拟合基准线（内点率 / 覆盖率 / 残差 / 倾角四重质量门）→ 缺陷候选统一判废 + 重叠面积去重"),
            ("图像算法链路（红外）：",
             "自适应温度分割 → 连通域打分与结构精化 → 逐列几何测量 → 局部形变检测（短窗−长窗中值残差 + 播种扩张）→ 异物检测（局部温度参考 + MAD 稳健阈值）"),
            ("多源决策与可靠性：",
             "IR 温度矩阵 + RGB 可见光由 PLC 硬触发同帧采集、纳秒戳配对（±100 ms）；OK / NG / UNKNOWN 三态 Fail-Safe，任一路异常降级为「不可信」而非误放行"),
            ("评测闭环与工程落地：",
             "判定阈值全配置化热更新，配置持久化 SHA256 指纹 + 离线批量回归工具，保证「同图同结论」；多线程队列流水线（线程池存图、相机健康度重连、PLC 故障自动停机）支撑产线连续运行"),
        ],
    ),
    dict(
        icon=ICON_DEVICE,
        title="烟标质检助手 · HarmonyOS App",
        tag="课题组校企合作 · 已通过真机验收",
        tag_class="project-tag",
        desc="把 PC 端烟标印刷缺陷检测算法迁移到鸿蒙手机端的端侧质检应用",
        right="2026.06 — 至今",
        chips=["ArkTS", "HarmonyOS", "Native NAPI", "C++", "TaskPool", "OpenCV 5.0", "Excel 报表 / FTP"],
        summary="主导检测算法从 PC 端到鸿蒙端的端侧迁移与验收：先做测试集验证与一致性判据，再打通 NAPI 与 C++ 全量移植，端侧单张 11~75 s。",
        bullets=[
            ("端侧迁移与验收：",
             "按「测试集验证 → NAPI 链路打通 → C++ 全量移植 → 真机一致性验收」四阶段推进；建立 17 张真值图的测试集与缺陷级一致性判据（NCC 容差常规 ±0.03 / 难图 ±0.10），自动化验收通过，真机单张 11~75 s"),
            ("检测能力与定量提升：",
             "9 级检测流水线覆盖文字行印刷、图标 Logo、烫金激凸套印与脏点污点四类场景，判据统一收敛到物理量纲（1 px ≈ 0.0495 mm、最小可检 0.5 mm）；以 ORB + RANSAC 单应性替代相位相关，跨样张对齐 NCC 由 0.445 提升至 0.686（+54%），轮廓提取与人工标注掩码 IoU 0.9968"),
            ("端侧工程与算法库化：",
             "OpenCV 5.0 静态编译进 HAP（arm64-v8a / x86_64），检测经 TaskPool 异步执行避免阻塞 UI，支持管理员 / 操作员权限与按天 Excel 报表 FTP 上传；六套检测方法封装为自包含 Python 类，与原始工程逐值核对一致"),
        ],
    ),
]

PRACTICE = [
    dict(
        title="湖南大学 计算机学院 · 导师科研组",
        date="2025.09 — 至今",
        sub="大二进组 · 计算机视觉方向",
        bullets=[
            "大二起跟随导师进入科研组学习计算机视觉，从图像预处理、配准与量测做起，逐步独立承担课题中的算法实现与实验评估",
            "由导师带领与企业合作完成「工业包装袋封口质量在线检测系统」与「烟标质检助手」两个项目：封口检测系统已商用上线，烟标质检助手已完成真机验收；负责视觉算法实现与调优、桌面端与鸿蒙端工程开发、以及算法从 PC 到手机端的移植与验收",
            "相关成果：软件著作权受理、专利在审；烟标质检助手建立 17 张真值图测试集与自动化验收流程，封口检测系统获中国大学生计算机设计大赛中南地区赛三等奖",
        ],
    ),
]

def build_html(css: str) -> str:
    skills = "".join(skill_group(*s) for s in SKILLS)
    awards = "".join(award(a) for a in AWARDS)
    projects = "".join(
        project_card(
            p["icon"], p["title"], p["tag"], p["tag_class"], p["desc"],
            p["right"], p["chips"], p["summary"], p["bullets"],
            p.get("award", ""),
        )
        for p in PROJECTS
    )
    practice = "".join(
        '<div class="entry">'
        '<div class="entry-header">'
        f'<h3 class="entry-title">{e["title"]}</h3>'
        f'<span class="entry-date">{e["date"]}</span></div>'
        f'<p class="entry-sub">{e["sub"]}</p>'
        '<ul class="entry-list">' + "".join(f"<li>{b}</li>" for b in e["bullets"]) + "</ul>"
        "</div>"
        for e in PRACTICE
    )

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="陈可欣的中文技术履历。">
<meta name="theme-color" content="#ffffff">
<title>陈可欣 — 中文履历</title>
<script>
  (function () {{
    var STORAGE_KEY = "theme-mode";
    var DARK_BG = "#070615";
    var LIGHT_BG = "#ffffff";
    function getPreferredMode() {{
      var stored = null;
      try {{ stored = localStorage.getItem(STORAGE_KEY); }} catch (e) {{}}
      if (stored === "dark" || stored === "light") return stored;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }}
    function apply(mode) {{
      var dark = mode === "dark";
      document.documentElement.classList.toggle("dark", dark);
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", dark ? DARK_BG : LIGHT_BG);
    }}
    apply(getPreferredMode());
    window.__setThemeMode = function (mode) {{
      try {{ localStorage.setItem(STORAGE_KEY, mode); }} catch (e) {{}}
      apply(mode);
    }};
  }})();
</script>
<style>
{css}
</style>
</head>
<body>
<div class="cv-wrapper">

  <div class="floating-controls">
    <button class="control-btn" id="print-button" aria-label="打印 / 导出 PDF" title="打印 / 导出 PDF" type="button">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    </button>
    <button class="control-btn" id="theme-toggle" aria-label="切换深色模式" data-dark-label="切换深色模式" data-light-label="切换浅色模式" aria-pressed="false" type="button">
      <svg class="icon-sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      <svg class="icon-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>
  </div>

  <header class="hero">
    <div class="hero-content">
      <h1 class="name">陈可欣</h1>
      <p class="tagline">专注计算机视觉与深度学习算法的工程落地：目标检测、图像量测与工业质检。</p>
      <div class="contact-row">
        <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>15319902705（同微信）</span>
        <a href="mailto:2753538923@qq.com"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>2753538923@qq.com</a>
        <a href="https://github.com/Tang-0118" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>GitHub</a>
      </div>
      <p class="intent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg>求职意向 · 计算机视觉 / 图形图像算法（实习）</p>
    </div>
  </header>

  <div class="cv-grid">
    <aside class="cv-aside">
      <section class="section">
        {section_title(ICON_CAP, "教育背景")}
        <div class="entry">
          <div class="entry-header">
            <h3 class="entry-title">湖南大学</h3>
            <span class="entry-date">2024.09 – 2028.06</span>
          </div>
          <p class="entry-sub">计算机学院 · 智能科学与技术（本科在读）</p>
          <p class="entry-detail"><strong>GPA：3.46 / 4.0（86.61 / 100）</strong></p>
          <p class="entry-detail">主修课程：深度学习、数字图像处理、机器学习、模式识别、线性代数、离散数学、程序设计（C++）、数据结构、操作系统、计算机体系结构、计算机网络、计算机系统等</p>
        </div>
      </section>

      <section class="section">
        {section_title(ICON_GRID, "技术技能")}
        <div class="skills-stack">{skills}</div>
      </section>

      <section class="section">
        {section_title(ICON_TROPHY, "获奖与认证")}
        <div class="awards-list">{awards}</div>
      </section>
    </aside>

    <main class="cv-main">
      <section class="section">
        {section_title(ICON_PROJ, "项目经历")}
        {projects}
      </section>

      <section class="section">
        {section_title(ICON_CASE, "实践经历")}
        {practice}
      </section>
    </main>
  </div>

  <footer class="footer">
    <p>陈可欣 · 中文履历 · 更新于 2026.10</p>
  </footer>
</div>

<script>
  (function () {{
    var toggle = document.getElementById("theme-toggle");
    var printButton = document.getElementById("print-button");
    function sync() {{
      var dark = document.documentElement.classList.contains("dark");
      toggle.setAttribute("aria-pressed", dark ? "true" : "false");
      toggle.setAttribute("aria-label", dark ? toggle.dataset.lightLabel : toggle.dataset.darkLabel);
      toggle.setAttribute("title", dark ? toggle.dataset.lightLabel : toggle.dataset.darkLabel);
    }}
    toggle.addEventListener("click", function () {{
      var dark = document.documentElement.classList.contains("dark");
      window.__setThemeMode(dark ? "light" : "dark");
      sync();
    }});
    printButton.addEventListener("click", function () {{ window.print(); }});
    sync();
  }})();
</script>
</body>
</html>
"""

def main():
    css = clean_css(CSS_SRC.read_text(encoding="utf-8"))
    html = build_html(css)
    OUT.write_text(html, encoding="utf-8")
    print("wrote", OUT, len(html), "chars")

if __name__ == "__main__":
    main()
