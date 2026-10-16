# -*- coding: utf-8 -*-
"""把 Word 内容母版 resume.docx 读回来，生成网页版在线简历 cv.html。

约定（见 README.md）：
  * 抬头区：第一行姓名；「求职意向：」「联系方式：」开头的行；其余一行当定位语
  * 「[板块名]」单独一行作为板块标题
  * 条目行用 Tab 分隔「名称 + 时间」；要点行以「•\t」开头
  * 小节内用「一句话：」「概述：」「技术栈：」「GPA：」「主修课程：」等前缀

用法：python cv_from_docx.py [--docx resume.docx] [--out ../cv.html]
"""

import argparse
import os
import re
import sys

from docx import Document

import build_cv_html as cv

HERE = os.path.dirname(os.path.abspath(__file__))
SECTION_RE = re.compile(r"^\[(.+?)\]$")
PROJECT_ICONS = [cv.ICON_SHIELD, cv.ICON_ALGO, cv.ICON_DEVICE, cv.ICON_GRID, cv.ICON_CODE]


def rich(text: str) -> str:
    return re.sub(r"<strong>(.*?)</strong>", r"\1", text)


def runs_of(par) -> str:
    """把段落转成带 <strong> 的字符串：Word 里加粗的部分保留强调。"""
    out = []
    for run in par.runs:
        if not run.text:
            continue
        out.append(f"<strong>{rich(run.text)}</strong>" if run.bold else rich(run.text))
    return "".join(out)


def split_head(text: str):
    """「标签：正文」→ (标签, 正文)，没有冒号则整段当正文。"""
    for sep in ("：", ":"):
        if sep in text:
            head, tail = text.split(sep, 1)
            if len(head) <= 18:
                return head + "：", tail.strip()
    return "", text


def chunks_of(text: str):
    parts = re.split(r"[、,，;；]", text)
    return [p.strip() for p in parts if p.strip()]


def parse(docx_path: str) -> dict:
    doc = Document(docx_path)
    paras = [p for p in doc.paragraphs if p.text.strip()]

    data = {"name": "陈可欣", "intent": "", "tagline": "", "contact": "",
            "edu": {}, "skills": [], "awards": [], "projects": [], "practice": []}
    section = None
    current = None          # 当前项目 / 实践条目
    edu_lines = []

    for par in paras:
        text = par.text.strip()          # 纯文本：用于判断结构（板块、条目、要点）
        markup = runs_of(par).strip()    # 带 <strong>：仅用于保留 Word 里的加粗（获奖等）
        m = SECTION_RE.match(text)
        if m:
            section = m.group(1)
            current = None
            continue

        if section is None:                      # 抬头区
            if not data["contact"] and text.startswith("联系方式："):
                data["contact"] = text.split("：", 1)[1]
            elif text.startswith("求职意向："):
                data["intent"] = text.split("：", 1)[1]
            elif len(data["name"]) and text == data["name"]:
                continue
            elif not data["tagline"] and not text.startswith("求职意向"):
                data["tagline"] = text
            else:
                data["name"] = text
            continue

        body = text[2:].strip() if text.startswith("•") else text

        if section == "教育背景":
            if not data["edu"] and "\t" in body:
                org, date = body.split("\t", 1)
                data["edu"] = {"org": org.strip(), "date": date.strip(),
                               "sub": "", "gpa": "", "courses": ""}
            elif not data["edu"].get("sub"):
                data["edu"]["sub"] = body
            elif body.startswith("GPA"):
                data["edu"]["gpa"] = body
            elif body.startswith("主修课程"):
                data["edu"]["courses"] = body.split("：", 1)[-1]
            edu_lines.append(body)

        elif section == "技术技能":
            head, tail = split_head(body)
            label = head.rstrip("：")
            data["skills"].append((label, chunks_of(tail)))

        elif section == "获奖与认证":
            data["awards"].append(markup)

        elif section == "项目经历":
            if "\t" in body and not body.startswith("•"):
                head, date = body.split("\t", 1)
                title, tag = head.strip(), ""
                for open_b, close_b in (("（", "）"), ("(", ")")):
                    if open_b in title and title.rstrip().endswith(close_b):
                        title, tag = title.rsplit(open_b, 1)
                        tag = tag.rstrip().rstrip(close_b)
                        break
                current = {"title": title.strip(), "tag": tag.strip(), "right": date.strip(),
                           "desc": "", "summary": "", "award": "", "chips": [], "bullets": []}
                data["projects"].append(current)
            elif current is None:
                continue
            elif body.startswith("一句话"):
                current["desc"] = body.split("：", 1)[-1]
            elif body.startswith("概述"):
                current["summary"] = body.split("：", 1)[-1]
            elif body.startswith("获奖"):
                current["award"] = body.split("：", 1)[-1]
            elif body.startswith("技术栈"):
                current["chips"] = chunks_of(body.split("：", 1)[-1])
            elif not current["desc"] and not current["bullets"]:
                # 标题下面第一行裸文本 = 一句话简介（写不写「一句话：」都认）
                current["desc"] = body
            else:
                head, tail = split_head(body)
                current["bullets"].append((head, tail))

        elif section in ("实践经历", "实习与实践"):
            if "\t" in body and not text.startswith("•"):
                head, date = body.split("\t", 1)
                current = {"title": head.strip(), "date": date.strip(), "sub": "", "bullets": []}
                data["practice"].append(current)
            elif current is None:
                continue
            elif not current["sub"] and not text.startswith("•"):
                current["sub"] = body
            else:
                current["bullets"].append(body)

    return data


def apply_to_renderer(data: dict) -> None:
    cv.SKILLS = [
        (cv.ICON_ALGO if i == 0 else cv.ICON_NN if i == 1 else cv.ICON_CODE if i == 2 else cv.ICON_DEVICE,
         label, chips)
        for i, (label, chips) in enumerate(data["skills"])
    ] or cv.SKILLS
    cv.AWARDS = data["awards"] or cv.AWARDS
    cv.PROJECTS = [
        dict(icon=PROJECT_ICONS[i % len(PROJECT_ICONS)], title=p["title"], tag=p["tag"],
             tag_class="project-tag", desc=p["desc"], right=p["right"], chips=p["chips"],
             summary=p["summary"], bullets=p["bullets"], award=p.get("award", ""))
        for i, p in enumerate(data["projects"])
    ] or cv.PROJECTS
    cv.PRACTICE = [
        dict(title=e["title"], date=e["date"], sub=e["sub"], bullets=e["bullets"])
        for e in data["practice"]
    ] or cv.PRACTICE


def patch_hero(html: str, data: dict) -> str:
    """抬头区（定位语 / 求职意向 / 电话 / 邮箱 / GitHub）按 Word 母版改写。"""
    if data["tagline"]:
        html = re.sub(r'(<p class="tagline">).*?(</p>)', lambda m: m.group(1) + rich(data["tagline"]) + m.group(2),
                      html, count=1)
    if data["intent"]:
        html = re.sub(r'(求职意向 · ).*?(</p>)', lambda m: m.group(1) + data["intent"] + m.group(2),
                      html, count=1)
    phone = re.search(r"1\d{10}", data["contact"])
    if phone:
        html = re.sub(r"1\d{10}（同微信）", phone.group(0) + "（同微信）", html)
        html = re.sub(r"(href=\"tel:)1\d{10}", lambda m: m.group(1) + phone.group(0), html)
    mail = re.search(r"[\w.\-]+@[\w.\-]+", data["contact"])
    if mail:
        html = re.sub(r"[\w.\-]+@[\w.\-]+", mail.group(0), html)
    gh = re.search(r"GitHub:\s*([\w\-]+)", data["contact"])
    if gh:
        html = re.sub(r"https://github\.com/[\w\-]+", "https://github.com/" + gh.group(1), html)
    return html


def patch_education(html: str, data: dict) -> str:
    """教育背景那一段（学校 / 时间 / 专业 / GPA / 主修课程）也跟着 Word 走。"""
    edu = data.get("edu") or {}
    if not edu.get("org"):
        return html
    html = re.sub(r'(<h3 class="entry-title">).*?(</h3>)',
                  lambda m: m.group(1) + rich(edu["org"]) + m.group(2), html, count=1)
    if edu.get("date"):
        html = re.sub(r'(<span class="entry-date">).*?(</span>)',
                      lambda m: m.group(1) + edu["date"] + m.group(2), html, count=1)
    if edu.get("sub"):
        html = re.sub(r'(<p class="entry-sub">).*?(</p>)',
                      lambda m: m.group(1) + rich(edu["sub"]) + m.group(2), html, count=1)
    if edu.get("gpa"):
        html = re.sub(r'(<p class="entry-detail">)(.*?)(</p>)',
                      lambda m: m.group(1) + "<strong>" + rich(edu["gpa"]) + "</strong>" + m.group(3),
                      html, count=1)
    if edu.get("courses"):
        html = re.sub(r'<p class="entry-detail">主修课程：.*?</p>',
                      lambda m: '<p class="entry-detail">主修课程：' + rich(edu["courses"]) + "</p>",
                      html, count=1)
    return html


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--docx", default=os.path.join(HERE, "resume.docx"))
    ap.add_argument("--out", default=os.path.join(os.path.dirname(HERE), "cv.html"))
    args = ap.parse_args()

    data = parse(args.docx)
    apply_to_renderer(data)
    css = cv.clean_css(cv.CSS_SRC.read_text(encoding="utf-8"))
    html = patch_education(patch_hero(cv.build_html(css), data), data)
    with open(args.out, "w", encoding="utf-8") as fh:
        fh.write(html)
    print(f"wrote {args.out}  ({len(html)} chars)  "
          f"项目 {len(cv.PROJECTS)} · 技能组 {len(cv.SKILLS)} · 获奖 {len(cv.AWARDS)} · 实践 {len(cv.PRACTICE)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
