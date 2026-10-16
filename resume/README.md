# 简历工作区

简历的唯一来源。网站上的「下载简历」按钮指向本目录的 `resume.pdf`。

| 文件 | 说明 |
| --- | --- |
| `resume.pdf` | **一页版（投递用）**：在线简历 `cv.html` 的打印输出，压缩 85% 后正好落在一张 A4 上；文字可选中、可搜索，ATS 能解析 |
| `resume.docx` | 可编辑 Word 母版（同时充当 Word 版的排版模板） |
| `resume-word.pdf` | Word 排版的一页版（另一套样式，想换样式投递时用） |
| `build_resume.py` | 生成 Word 版：默认一页精简版，加 `--full` 出两页详细版 |
| `build_cv_html.py` | 生成在线简历 `../cv.html`（读同目录 `moyuin.css`） |
| `build_all.ps1` | 一键重建上面四份产物 |
| `word_to_pdf.ps1` | Word → PDF（调用本机 Word） |
| `pdf_to_png.py` | PDF → PNG，逐页检查排版 |
| `img_to_pdf.py` | 截图 → A4 PDF（`portrait-fit` 可把整页截图压成一页） |
| `moyuin.css` | 在线简历的样式源 |

## 怎么重建

```powershell
powershell -File resume\build_all.ps1            # 全部重建
powershell -File resume\build_all.ps1 -SkipWeb   # 跳过需要 node 的两步
```

改内容就改 `build_resume.py`（Word 版）和 `build_cv_html.py`（在线简历）里的数据，再跑上面的命令。
`_build-*.docx` 是中间产物，可以随时删。

## 为什么下载版是「压缩 85%」的

`cv.html` 的打印排版原尺寸是 **2 页 A4 竖版**（第 2 页只用到四成）。
生成 PDF 时用 `PDF_SCALE` 整体缩放：Chromium 会按 1/scale 加宽布局再等比缩小，所以内容仍然铺满页宽，只是字号小一档。
实测 **0.86 是仍能装进一页的最大比例**，脚本里用 0.85 留一点余量。想改：

```powershell
$env:PDF_SCALE = "0.86"
node tools\shot_cdp.cjs "file:///E:/github_projects/personal-website/cv.html" "resume\resume.pdf" 1440 1000 "-" light portrait
```

要「不压缩的两页版」就把 `PDF_SCALE` 设为 1 再跑一遍。
