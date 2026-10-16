# -*- coding: utf-8 -*-
"""Rebuild the resume copy with ResumeSkill-style structure and the original design language."""

import os
import shutil
import sys
from xml.sax.saxutils import escape

from docx import Document
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else r"E:\github_projects\personal-website\resume"
SRC = os.path.join(HERE, "resume.docx")          # 可编辑母版（同时充当排版模板）
OUT = os.path.join(HERE, "_build-one-page.docx")  # 默认：一页精简版（投递用）
OUT_FULL = os.path.join(HERE, "_build-two-page.docx")  # --full：两页详细版

FONT = "微软雅黑"
C_TEXT = "19232D"
C_GRAY = "5A6470"
C_ACCENT = "5C4ADC"
C_RULE = "D9DDE4"

BODY_SZ = 20  # 10pt
STACK_SZ = 19  # 9.5pt
RIGHT_TAB = 10486  # twips, matches the content width of the original A4 layout


def rpr(size, bold=False, color=C_TEXT):
    b = "<w:b/>" if bold else '<w:b w:val="0"/>'
    return (
        f'<w:rFonts w:ascii="{FONT}" w:hAnsi="{FONT}" w:eastAsia="{FONT}" w:hint="eastAsia"/>'
        f"{b}"
        f'<w:color w:val="{color}"/>'
        f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>'
    )


def run(text, size, bold=False, color=C_TEXT, tab=False):
    body = '<w:tab/>' if tab else '<w:t xml:space="preserve">' + escape(text) + "</w:t>"
    return f"<w:r><w:rPr>{rpr(size, bold, color)}</w:rPr>{body}</w:r>"


def ppr(before=0, after=0, line=1.0, keep_next=False, rule=False, indent=None, tab=False):
    parts = []
    if keep_next:
        parts.append("<w:keepNext/>")
    if rule:
        parts.append(
            f'<w:pBdr><w:bottom w:val="single" w:color="{C_RULE}" w:sz="8" w:space="2"/></w:pBdr>'
        )
    if tab:
        parts.append(f'<w:tabs><w:tab w:val="right" w:pos="{RIGHT_TAB}"/></w:tabs>')
    parts.append(
        f'<w:spacing w:before="{int(before * 20)}" w:after="{int(after * 20)}"'
        f' w:line="{int(line * 240)}" w:lineRule="auto"/>'
    )
    if indent is not None:
        parts.append(
            f'<w:ind w:left="{int(indent * 20)}" w:hanging="{int(indent * 20)}"/>'
        )
    return f"<w:pPr>{''.join(parts)}</w:pPr>"


def para(ppr_xml, runs_xml):
    return parse_xml(f'<w:p {nsdecls("w")}>{ppr_xml}{runs_xml}</w:p>')


def add(body, ppr_xml, runs_xml):
    body.append(para(ppr_xml, runs_xml))


def bullet(head, text=""):
    """Bullet glyph, then a tab that lands on the hanging indent so wrapped lines align."""
    runs = run("\u2022", BODY_SZ) + run("", BODY_SZ, tab=True)
    if head:
        runs += run(head, BODY_SZ, bold=True)
    if text:
        runs += run(text, BODY_SZ)
    return runs


HONORS = [
    "2026 第十三届 PAC 并行应用挑战赛华南赛区一等奖",
    "2026 第十九届中国大学生计算机设计大赛中南地区赛三等奖",
    "2026 湖南大学新文科实践创新大赛校级铜奖",
    "第十九届“挑战杯”校赛三等奖",
    "2025—2026 年度优秀志愿者（志愿时长 150 小时）",
    "论文 PD-CAT 2026 国际会议在审（并行三维网格生成）；软件著作权登记已受理（2026R11L1069227）、专利在审",
]

# ── 一页精简版（投递用；详细内容留在个人网站与在线简历里） ──
HONORS_ONE = [
    "2026 第十三届 PAC 并行应用挑战赛华南赛区一等奖；第十九届中国大学生计算机设计大赛中南地区赛三等奖",
    "论文 PD-CAT 2026 国际会议在审；软件著作权已受理、专利在审；优秀志愿者（150 小时）",
]

SKILLS_ONE = [
    ("编程与视觉算法：", "Python、C++、OpenCV、NumPy/scipy、图像配准与量测算法、目标检测（YOLOv8）、多目标跟踪"),
    ("模型部署与工程：", "PyTorch / ONNXRuntime、多路实时推理、Modbus RTU、PyQt5、ArkTS / HarmonyOS"),
]

PROJECTS_ONE = [
    {
        "title": "无人车间人形安全防护系统（校企合作 · 已商用上线）",
        "date": "2026 — 至今",
        "lead": "",
        "bullets": [
            ("检测与实时调度：", "YOLOv8 单类人员检测，2–4 路 1280×720 工业相机并发；推理按「只保留最新帧 + 轮询公平调度 + batch=1」组织，不等待凑批，避免旧帧堆积与相机饥饿。"),
            ("多后端部署：", "以 ModelFactory 统一 backend 与模型协议，同一套业务链可在 PyTorch（CUDA / CPU）、ONNXRuntime CPU、算能 Sophon NPU 之间切换。"),
            ("Fail-Safe 安全链路：", "STARTUP / PERSON / FAULT LOCK 状态机 + 心跳超时强制锁机；端到端以 T0 相机取帧 → T1 继电器写入成功 ≤ 200 ms 为验收口径，锁机经 Modbus RTU 输出并保留 DI 软复位。"),
        ],
        "stack": "Python · YOLOv8 · ONNXRuntime / PyTorch · OpenCV · PyQt5 · pyserial（Modbus RTU）· PyInstaller",
    },
    {
        "title": "工业包装袋封口质量在线检测系统（校企合作 · 已商用上线）",
        "date": "2026.03 — 至今",
        "lead": "",
        "bullets": [
            ("双模态决策级融合：", "IR 温度矩阵 + RGB 可见光由 PLC 硬触发同帧采集、按纳秒戳配对（±100 ms）；设计 OK / NG / UNKNOWN 三态 Fail-Safe，任一路异常降级为「不可信」而非误放行。"),
            ("图像算法：", "可见光侧动态规划求解全局最优连续边缘 + 确定性 RANSAC 拟合封口基准线；红外侧自适应温度分割 + 逐列几何量测 + MAD 稳健阈值异物检测。"),
        ],
        "stack": "Python · OpenCV · NumPy · PyQt5 · 多线程/队列 · pyserial（Modbus RTU）· PyInstaller",
    },
    {
        "title": "烟标质检助手 · HarmonyOS App（校企合作 · 已通过真机验收）",
        "date": "2026.06 — 至今",
        "lead": "",
        "bullets": [
            ("端侧迁移与验收：", "主导算法从 PC 端迁移到鸿蒙手机端，按「测试集验证 → NAPI 链路打通 → C++ 全量移植 → 真机一致性验收」推进；17 张真值图自动化验收通过，真机单张 11–75 s。"),
            ("算法与端侧工程：", "9 级检测流水线，判据统一收敛到物理量纲（1 px ≈ 0.0495 mm、最小可检 0.5 mm）；OpenCV 5.0 静态编译进 HAP，检测经 TaskPool 异步执行避免阻塞 UI。"),
        ],
        "stack": "ArkTS · HarmonyOS · Native NAPI · C++ · OpenCV 5.0",
    },
]

SKILLS = [
    ("编程与视觉算法：", "Python、C++、OpenCV、NumPy/scipy、图像配准与量测算法、目标检测（YOLOv8）、多目标跟踪"),
    ("模型部署与推理：", "PyTorch、ONNXRuntime、多路视频实时推理（latest-frame / 轮询调度）、Modbus RTU 工控联锁"),
    ("端侧与并行计算：", "ArkTS / HarmonyOS、Native NAPI、MPI、Kokkos、Linux / Slurm"),
    ("工程与工具：", "PyQt5、Git、PyInstaller、pyserial"),
]

PROJECTS = [
    {
        "title": "无人车间人形安全防护系统（校企合作 · 已商用上线）",
        "date": "2026 — 至今",
        "lead": "面向无人车间的安全防护系统：机械臂等自动化设备运行时，一旦检测到人员进入设备区域，立即输出锁机信号停止设备；负责人员检测与多路相机实时推理、安全状态机与上位机软件开发。",
        "bullets": [
            ("检测与实时调度：", "YOLOv8 单类人员检测（conf 0.3 / NMS 0.5），2–4 路 1280×720 工业相机并发；推理按「只保留最新帧 + 轮询公平调度 + batch=1」组织，不等待凑批，避免高帧率相机饿死其它路与旧帧堆积。"),
            ("多后端部署：", "以 ModelFactory 统一 backend 与模型协议，同一套业务链可在 PyTorch（CUDA / CPU）、ONNXRuntime CPU、算能 Sophon NPU（bmodel）之间切换，现场按算力选版本。"),
            ("区域与方向判定：", "多边形 ROI 划分 ON / IN / OUT 三区，门区短轨迹状态机按位移投影（可叠加拓扑得分）判定 ENTER / LEAVE，对检测抖动与丢帧容错，输出设备内实时人数与进出净流量。"),
            ("Fail-Safe 安全链路：", "STARTUP_LOCK / PERSON_LOCK / FAULT_LOCK / UNLOCK 状态机：启动默认锁机、检测到人保持锁机、相机 / 推理 / 跟踪 / 计数 / IO 任一模块心跳超时即判故障并强制锁机；复位需同时满足「无人 + 无故障 + 模块健康」并在执行前二次复查。"),
            ("时延验收与工控联锁：", "端到端以 T0 相机取帧 → T1 继电器写入成功为口径、限值 200 ms，拆成 acquire / scheduler / infer / rule / safety / io 六段统计 p95 / p99 与合格率；锁机经 Modbus RTU 继电器输出并保留 DI 软复位，IO 侧 3 次重试 + 死信队列 + 紧急锁机回调。"),
        ],
        "stack": "Python · YOLOv8 · ONNXRuntime / PyTorch · OpenCV · PyQt5 · 多线程/队列 · pyserial（Modbus RTU）· 海康 MVS SDK · PyInstaller",
    },
    {
        "title": "工业包装袋封口质量在线检测系统（校企合作 · 已商用上线）",
        "date": "2026.03 — 至今",
        "lead": "面向产线的实时质检系统：红外热成像 + 可见光双相机在线判定包装袋封口质量，NG 由 PLC 驱动剔除机构；负责视觉算法与上位机软件开发。",
        "bullets": [
            ("双模态决策级融合：", "IR 温度矩阵 + RGB 可见光由 PLC 硬触发同帧采集，按采集纳秒戳配对（±100 ms）；设计 OK/NG/UNKNOWN 三态 Fail-Safe，任一路异常一律降级为“不可信”而非误放行。"),
            ("可见光算法：", "4 项加权边缘得分图 → 动态规划求解全局最优连续边缘 → 确定性 RANSAC 拟合基准线（内点率 / 覆盖率 / 残差 / 倾角四重质量门）→ 双通道缺陷候选统一判废 + 重叠面积去重。"),
            ("红外算法：", "自适应温度分割（分位数 + 绝对下限兜底）→ 连通域打分 + 粘连 / 圆角结构精化 → 逐列几何测量 → 局部形变检测（短窗 − 长窗中值滤波残差 + 播种扩张）→ 异物检测（局部温度参考 + MAD 稳健阈值）。"),
            ("工程化：", "多线程队列流水线（线程池存图、相机健康度重连、PLC 故障自动停机）、判定阈值全配置化热更新；配套离线批量回归工具并记录配置 SHA256 指纹，保证“同图同结论”。"),
        ],
        "stack": "Python · OpenCV · NumPy · PyQt5 · 多线程/队列 · pyserial（Modbus RTU）· C 接口 SDK 封装（ctypes）· PyInstaller",
    },
    {
        "title": "烟标质检助手 · HarmonyOS App（校企合作 · 已通过真机验收）",
        "date": "2026.06 — 至今",
        "lead": "面向烟标印刷缺陷检测的端侧质检应用：负责算法迁移、端侧工程实现与真机验收。",
        "bullets": [
            ("端侧迁移主线：", "主导检测算法从 PC 端迁移到鸿蒙手机端，按「测试集验证 → NAPI 链路打通 → C++ 全量移植 → 真机一致性验收」四阶段推进；建立 17 张真值图的测试集与缺陷级一致性判据（NCC 容差常规 ±0.03 / 难图 ±0.10），自动化验收通过，真机单张 11~75 s。"),
            ("检测能力：", "实现 9 级检测流水线（主通道 → 淡红晕染 → 墨点 → 轻微墨点 → 轻微划痕 → 弱线 → 脏点团块 → 脏斑 → 跨通道去重），覆盖复杂背景下的文字行印刷检测、印刷图标 Logo 缺陷、Logo 烫金激凸套印与脏点污点类检测；判据统一收敛到物理尺寸口径（1 px ≈ 0.0495 mm，最小可检 0.5 mm），输出可直接对接质检标准。"),
            ("配准与光照校正：", "以 ORB + RANSAC 单应性替代相位相关，跨样张对齐 NCC 由 0.445 提升至 0.686（+54%）；低频增益校正把光照残差均值压到 11.0（对比直方图匹配 16.5、CLAHE 26.6）。"),
            ("轮廓提取与误报控制：", "「Otsu 自适应阈值 + 保角点多边形拟合」提取不规则烟标轮廓，与人工标注掩码 IoU 达 0.9968、边界平均偏差 0.84 px；配合边缘密度阈值 0.20 与最小物理边长过滤，模板自比对 0 误报。"),
            ("端侧工程与系统配套：", "鸿蒙端以 ArkTS + ArkUI（Stage 模型）实现样本库管理、拍照检测、结果判定与历史管理，OpenCV 5.0 静态编译进 HAP（arm64-v8a / x86_64），检测经 TaskPool 异步执行避免阻塞 UI；完成管理员 / 操作员双角色登录与差异化访问权限管理，支持按天生成 Excel 检测报表并通过 FTP 自动上传。"),
            ("算法库化：", "把六套检测方法封装为自包含 Python 类（无绝对路径依赖），以 Otsu 自适应阈值 + 保角点多边形 ROI + SIFT 单应性配准作公共底座；与原始工程逐值核对，5 个方法的检出数量与面积完全一致。"),
        ],
        "stack": "ArkTS · HarmonyOS · Native NAPI · C++",
    },
]


def build(full=False):
    """默认输出一页精简版（投递用）；full=True 时输出两页详细版。"""
    out = OUT_FULL if full else OUT
    projects = PROJECTS if full else PROJECTS_ONE
    honors = HONORS if full else HONORS_ONE
    skills = SKILLS if full else SKILLS_ONE
    # 一页版把段距与行距收一档，保证排得进 A4 单页
    LINE = 1.08 if full else 1.03
    sec_gap = (10, 4) if full else (7, 3)
    title_gap = (8, 2) if full else (6, 1)
    stack_gap = (3, 6) if full else (2, 4)
    head_gap = (6, 2) if full else (5, 2)

    shutil.copyfile(SRC, out)
    doc = Document(out)
    body = doc.element.body
    for child in list(body):
        if child.tag.endswith("}p") or child.tag.endswith("}tbl"):
            body.remove(child)

    add(body, ppr(0, 0, 1.0), run("陈可欣", 52, bold=True))
    add(
        body,
        ppr(2, 0, 1.0),
        run("计算机视觉 / 深度学习 | Python · C++ · YOLOv8 · PyTorch/ONNX · OpenCV · MPI/Kokkos", 22, bold=True, color=C_GRAY),
    )
    add(
        body,
        ppr(0, 4, 1.0, rule=True),
        run(
            "2753538923@qq.com · 15319902705（同微信） · github.com/Tang-0118",
            19,
            color=C_GRAY,
        ),
    )

    add(body, ppr(*sec_gap, 1.0, keep_next=True, rule=True), run("教育背景", 30, bold=True))
    add(
        body,
        ppr(*head_gap, 1.0, keep_next=True, tab=True),
        run("湖南大学 计算机学院 · 智能科学与技术（本科）", 23, bold=True)
        + run("", 19, color=C_GRAY, tab=True)
        + run("2024.09 — 2028.06", 19, color=C_GRAY),
    )
    add(
        body,
        ppr(0, 2, LINE),
        run("大三在读，研究方向为计算机视觉；全部课程平均分 86.61/100（GPA 3.46/4.0）。", BODY_SZ),
    )
    if full:
        add(
            body,
            ppr(0, 2, LINE),
            run(
                "担任班级宣传委员、朋辈招生负责人，连续两年参与迎新工作；参加社会实践与劳动志愿活动，志愿时长累计 150 小时。",
                BODY_SZ,
            ),
        )

    add(body, ppr(*sec_gap, 1.0, keep_next=True, rule=True), run("科研与项目经历", 30, bold=True))
    for proj in projects:
        add(
            body,
            ppr(*title_gap, 1.0, keep_next=True, tab=True),
            run(proj["title"], 23, bold=True)
            + run("", 19, color=C_GRAY, tab=True)
            + run(proj["date"], 19, color=C_GRAY),
        )
        if proj["lead"]:
            add(body, ppr(0, 2, LINE), run(proj["lead"], BODY_SZ))
        for head, text in proj["bullets"]:
            add(body, ppr(0, 2, LINE, indent=16), bullet(head, text))
        add(body, ppr(*stack_gap, 1.05), run("技术栈：" + proj["stack"], STACK_SZ, color=C_ACCENT))

    add(body, ppr(*sec_gap, 1.0, keep_next=True, rule=True), run("荣誉与技能", 30, bold=True))
    add(
        body,
        ppr(*head_gap, 1.0, keep_next=True, tab=True),
        run("主要荣誉", 21, bold=True)
        + run("", 19, color=C_GRAY, tab=True)
        + run("2025 — 2026", 19, color=C_GRAY),
    )
    for item in honors:
        add(body, ppr(0, 2, LINE, indent=16), bullet(item))

    add(body, ppr(6, 2, 1.0, keep_next=True), run("技能", 21, bold=True))
    for head, text in skills:
        add(body, ppr(0, 2, LINE, indent=16), bullet(head, text))

    doc.save(out)
    print("saved", out)


if __name__ == "__main__":
    build(full="--full" in sys.argv)
