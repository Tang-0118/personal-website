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
$publish = Join-Path $site "tools\publish_pdf.py"
$tmp1 = Join-Path $here "_one-page.pdf"
$tmp2 = Join-Path $here "_two-page.pdf"

Write-Output "[1/3] 读 Word 母版 → 生成网页版在线简历 cv.html"
python (Join-Path $here "cv_from_docx.py")

Write-Output "[2/3] 导出投递用 PDF（网页排版压成一页）"
$env:PDF_SCALE = "0.90"
node $shot $url $tmp1 1440 1000 "-" light portrait
Remove-Item Env:\PDF_SCALE -ErrorAction SilentlyContinue
if ($LASTEXITCODE -ne 0) { throw "生成一页版失败（见上面的 node 报错）" }
python $shrink $tmp1
python $publish $tmp1 (Join-Path $here "resume.pdf")
if ($LASTEXITCODE -ne 0) { throw "发布 resume.pdf 失败：关掉正在打开它的 PDF 预览器后重跑本脚本（生成结果还在 $tmp1）" }

if (-not $SkipTwoPage) {
    Write-Output "[3/3] 导出未压缩的两页版"
    node $shot $url $tmp2 1440 1000 "-" light portrait
    if ($LASTEXITCODE -ne 0) { throw "生成两页版失败（见上面的 node 报错）" }
    python $shrink $tmp2
    python $publish $tmp2 (Join-Path $here "resume-web.pdf")
    if ($LASTEXITCODE -ne 0) { throw "发布 resume-web.pdf 失败：关掉正在打开它的 PDF 预览器后重跑本脚本" }
} else {
    Write-Output "[3/3] 已跳过两页版"
}

Write-Output "完成。产出："
Get-ChildItem -LiteralPath $here -File | Where-Object { $_.Extension -eq ".pdf" -and $_.Name -notlike "_*" } |
    Select-Object Name, @{ n = "KB"; e = { [math]::Round($_.Length / 1KB) } } | Format-Table -AutoSize
