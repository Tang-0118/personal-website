# 一键重建简历：一页版 Word + PDF，在线简历 cv.html，网页版 PDF
#
#   powershell -File resume\build_all.ps1              # 全部重建
#   powershell -File resume\build_all.ps1 -SkipWeb     # 跳过网页版 PDF（不需要 node）
#
param([switch]$SkipWeb)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$site = Split-Path -Parent $here

Write-Output "[1/4] 生成 Word 一页版（build_resume.py）"
python (Join-Path $here "build_resume.py")
Copy-Item -LiteralPath (Join-Path $here "_build-one-page.docx") -Destination (Join-Path $here "resume.docx") -Force

Write-Output "[2/4] 导出 PDF（Word 转 PDF）"
$pdf = Join-Path $here "resume.pdf"
try {
    & (Join-Path $here "word_to_pdf.ps1") -Docx (Join-Path $here "resume.docx") -Pdf $pdf
}
catch {
    # Word 退出时偶发 COM 报错，PDF 一般已经产出，这里只提示
    Write-Warning "Word 导出时报错（通常是退出阶段的 COM 异常）：$($_.Exception.Message)"
}
if (-not (Test-Path -LiteralPath $pdf)) { throw "PDF 没生成：$pdf" }

Write-Output "[3/4] 重建在线简历 cv.html"
python (Join-Path $here "build_cv_html.py")

if (-not $SkipWeb) {
    Write-Output "[4/4] 生成网页版 PDF（打印模式，A4 竖版）"
    $url = "file:///" + ($site -replace '\\', '/') + "/cv.html"
    node (Join-Path $site "tools\shot_cdp.cjs") $url (Join-Path $here "resume-web.pdf") 1440 1000 "-" light portrait
}

Write-Output "完成。产出："
Get-ChildItem -LiteralPath $here -File | Where-Object { $_.Extension -in ".pdf", ".docx" } |
    Select-Object Name, @{ n = "KB"; e = { [math]::Round($_.Length / 1KB) } } | Format-Table -AutoSize
