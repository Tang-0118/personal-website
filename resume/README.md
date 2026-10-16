# 简历工作区

简历的唯一来源，网站上的「下载简历」按钮指向本目录的 `resume.pdf`。

## 日常改文字：编辑 Word → 转 PDF

1. 用 Word 打开 `resume.docx`，直接改文字（排版样式在 Word 里调也一样生效），保存；
2. 跑一条命令，把它导出成 `resume.pdf`（顺手压缩内嵌字体）：

```powershell
powershell -File resume\make_pdf.ps1
```

跑完 `resume.pdf` 就是最新版，网站下载按钮指向它，推送到 GitHub 后线上就更新了。
脚本会先导到临时文件再覆盖，所以 `resume.pdf` 正开着预览也不影响导出（覆盖失败时会另存 `resume-new.pdf` 并提示，关掉预览器重跑即可）。

> `resume.docx` 是手动编辑的母版，脚本**不会**覆盖它。

## 文件说明

| 文件 | 说明 |
| --- | --- |
| `resume.docx` | **手动编辑的 Word 母版**（一页，单列排版） |
| `resume.pdf` | 投递用 PDF：由 `resume.docx` 导出，一页，文字可选中 |
| `resume-web.pdf` | 网页排版的另一版：`cv.html` 的打印输出（A4 竖版 2 页，双栏带彩色标签） |
| `make_pdf.ps1` | Word → PDF（+ 字体子集压缩）。改完 Word 跑这条就行 |
| `build_all.ps1` | 全套重建：代码草稿 → `cv.html` → `resume-web.pdf` → Word 导 PDF |
| `build_resume.py` | 由代码生成 `_from-code.docx` 草稿（想从代码改内容时用，不覆盖母版） |
| `build_cv_html.py` | 生成在线简历 `../cv.html`（读同目录 `moyuin.css`） |
| `word_to_pdf.ps1` | 底层工具：Word → PDF（调用本机 Word） |
| `pdf_to_png.py` | PDF → PNG，逐页检查排版 |
| `img_to_pdf.py` | 截图 → A4 PDF（`portrait-fit` 可把整页截图压成一页） |
| `moyuin.css` | 在线简历的样式源 |

`_from-code.docx`、`_check.png` 之类以 `_` 开头的都是中间产物，可随时删。

## 两套排版的关系

| | Word 版（`resume.docx` → `resume.pdf`） | 网页版（`cv.html` → `resume-web.pdf`） |
| --- | --- | --- |
| 版式 | 单列，技术栈用彩色小字 | 双栏（左栏教育/技能/获奖），标签化 |
| 页数 | 1 页 | 2 页（不压缩时） |
| 改文字 | Word 里直接改 | 改 `build_cv_html.py` 里的数据 |
| 用途 | 投递（下载按钮指向它） | 网站上的「在线版简历」，或想要更完整的版本 |

两边内容要一起更新时，跑 `build_all.ps1`；只改 Word 文字时跑 `make_pdf.ps1` 就够。
