# 一键重建简历
#
#   powershell -File resume\build_all.ps1            # 全部重建
#   powershell -File resume\build_all.ps1 -SkipWeb   # 跳过需要 node 的两步
#
# 产出：
#   resume.pdf       一页版（网页排版压成一页，网站「下载简历」指向它）
#   resume.docx      可编辑 Word 母版
#   resume-word.pdf  Word 排版的一页版（备用样式）
#   ../cv.html       在线简历
#
param([switch]$SkipWeb)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$site = Split-Path -Parent $here

Write-Output "[1/4] 生成 Word 一页版"
python (Join-Path $here "build_resume.py")
Copy-Item -LiteralPath (Join-Path $here "_build-one-page.docx") -Destination (Join-Path $here "resume.docx") -Force

Write-Output "[2/4] 导出 Word 版 PDF（resume-word.pdf）"
$wordPdf = Join-Path $here "resume-word.pdf"
try {
    & (Join-Path $here "word_to_pdf.ps1") -Docx (Join-Path $here "resume.docx") -Pdf $wordPdf
}
catch {
    Write-Warning "Word 导出时报错（通常是退出阶段的 COM 异常）：$($_.Exception.Message)"
}
if (-not (Test-Path -LiteralPath $wordPdf)) { throw "Word 版 PDF 没生成：$wordPdf" }

Write-Output "[3/4] 重建在线简历 cv.html"
python (Join-Path $here "build_cv_html.py")

if (-not $SkipWeb) {
    Write-Output "[4/4] 生成下载版：网页排版压成一页 A4（resume.pdf）"
    $url = "file:///" + ($site -replace '\\', '/') + "/cv.html"
    $env:PDF_SCALE = "0.85"
    node (Join-Path $site "tools\shot_cdp.cjs") $url (Join-Path $here "resume.pdf") 1440 1000 "-" light portrait
    Remove-Item Env:\PDF_SCALE -ErrorAction SilentlyContinue
    Write-Output "    压缩内嵌字体"
    python (Join-Path $site "tools\shrink_pdf.py") (Join-Path $here "resume.pdf")
}

Write-Output "完成。产出："
Get-ChildItem -LiteralPath $here -File | Where-Object { $_.Extension -in ".pdf", ".docx" } |
    Select-Object Name, @{ n = "KB"; e = { [math]::Round($_.Length / 1KB) } } | Format-Table -AutoSize
