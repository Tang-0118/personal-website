# 简历工作区

简历的唯一来源。网站上的「下载简历」按钮指向这个文件夹里的 `resume.pdf`。

| 文件 | 说明 |
| --- | --- |
| `resume.pdf` | **一页版简历（投递用）** —— 下载按钮就是它，文字可选可搜索 |
| `resume.docx` | 与 `resume.pdf` 同内容的可编辑 Word 母版（同时充当排版模板） |
| `resume-web.pdf` | 网页版简历：`cv.html` 的打印输出（A4 竖版 2 页，项目介绍更全） |
| `build_resume.py` | 生成 Word 版：默认一页精简版，加 `--full` 出两页详细版 |
| `build_cv_html.py` | 生成在线简历 `../cv.html`（读同目录的 `moyuin.css`） |
| `build_all.ps1` | 一键重建：Word 一页版 + PDF + `cv.html` +（可选）网页版 PDF |
| `word_to_pdf.ps1` | Word → PDF（调用本机 Word） |
| `pdf_to_png.py` | PDF → PNG，用来逐页检查排版 |
| `img_to_pdf.py` | 截图 → A4 PDF（做「截图版简历」用，`portrait-fit` 可压成一页） |
| `moyuin.css` | 在线简历的样式源 |

## 怎么重建

```powershell
powershell -File resume\build_all.ps1            # 全部重建
powershell -File resume\build_all.ps1 -SkipWeb   # 不重新生成网页版 PDF（不需要 node）
```

改内容就改 `build_resume.py`（Word 版）和 `build_cv_html.py`（在线简历）里的数据，再跑上面的命令。
`_build-*.docx` 是中间产物，随时可以删。
