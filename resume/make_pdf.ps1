# 改完 Word 母版跑这一条：Word → 网页版在线简历 → 网页排版的 PDF
#
#   powershell -File resume\make_pdf.ps1
#
# 产出：
#   ../cv.html        在线简历（网页版，https://kexin.uno/cv.html）
#   resume.pdf        投递用：网页排版压成一页 A4（网站「下载简历」指向它）
#   resume-web.pdf    同上但未压缩（A4 竖版 2 页，字大一点）
#
# 内容全部来自 resume.docx（文字母版）；想重置母版跑 build_master.py。
param([switch]$SkipTwoPage)

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$site = Split-Path -Parent $here
$url = "file:///" + ($site -replace '\\', '/') + "/cv.html"
$shot = Join-Path $site "tools\shot_cdp.cjs"
$shrink = Join-Path $site "tools\shrink_pdf.py"

Write-Output "[1/3] 读 Word 母版 → 生成网页版在线简历 cv.html"
python (Join-Path $here "cv_from_docx.py")

Write-Output "[2/3] 导出投递用 PDF（网页排版压成一页）"
$env:PDF_SCALE = "0.85"
node $shot $url (Join-Path $here "resume.pdf") 1440 1000 "-" light portrait
Remove-Item Env:\PDF_SCALE -ErrorAction SilentlyContinue
python $shrink (Join-Path $here "resume.pdf")

if (-not $SkipTwoPage) {
    Write-Output "[3/3] 导出未压缩的两页版 resume-web.pdf"
    node $shot $url (Join-Path $here "resume-web.pdf") 1440 1000 "-" light portrait
    python $shrink (Join-Path $here "resume-web.pdf")
} else {
    Write-Output "[3/3] 已跳过 resume-web.pdf"
}

Write-Output "完成。产出："
Get-ChildItem -LiteralPath $here -File | Where-Object { $_.Extension -eq ".pdf" } |
    Select-Object Name, @{ n = "KB"; e = { [math]::Round($_.Length / 1KB) } } | Format-Table -AutoSize
