# 重建简历相关的产物
#
#   powershell -File resume\build_all.ps1            # 全部重建
#   powershell -File resume\build_all.ps1 -SkipWeb   # 跳过需要 node 的部分
#
# 说明：resume.docx 是手动编辑的母版，本脚本不会覆盖它。
#   1. 由代码生成草稿 _from-code.docx（想从代码改内容时用，跟母版比对后再另存）
#   2. 重建在线简历 ../cv.html
#   3. 由 cv.html 生成网页排版版 resume-web.pdf（未压缩，2 页）
#   4. 由 resume.docx 生成投递用 resume.pdf（一页，Word 排版）
#
# 只改了 Word 里的文字时，直接跑 make_pdf.ps1 就够了。
param([switch]$SkipWeb)

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$site = Split-Path -Parent $here

Write-Output "[1/4] 生成代码版草稿 _from-code.docx"
python (Join-Path $here "build_resume.py")

Write-Output "[2/4] 重建在线简历 cv.html"
python (Join-Path $here "build_cv_html.py")

if (-not $SkipWeb) {
    Write-Output "[3/4] 生成网页排版版 resume-web.pdf（cv.html 打印输出，A4 竖版 2 页）"
    $url = "file:///" + ($site -replace '\\', '/') + "/cv.html"
    $env:PDF_SCALE = "1"
    node (Join-Path $site "tools\shot_cdp.cjs") $url (Join-Path $here "resume-web.pdf") 1440 1000 "-" light portrait
    Remove-Item Env:\PDF_SCALE -ErrorAction SilentlyContinue
    python (Join-Path $site "tools\shrink_pdf.py") (Join-Path $here "resume-web.pdf")
} else {
    Write-Output "[3/4] 已跳过 resume-web.pdf"
}

Write-Output "[4/4] 由 resume.docx 生成投递用 resume.pdf"
& (Join-Path $here "make_pdf.ps1")

Write-Output "完成。产出："
Get-ChildItem -LiteralPath $here -File | Where-Object { $_.Extension -in ".pdf", ".docx" } |
    Select-Object Name, @{ n = "KB"; e = { [math]::Round($_.Length / 1KB) } } | Format-Table -AutoSize
