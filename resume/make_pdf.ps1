# 把手动编辑好的 resume.docx 导出成 resume.pdf（网站「下载简历」用的那份）
#
#   powershell -File resume\make_pdf.ps1
#
# 流程：Word 导出 PDF → 内嵌字体子集化压缩。改完 Word 存盘后跑这一条就行。
param(
    [string]$Docx = (Join-Path $PSScriptRoot "resume.docx"),
    [string]$Pdf = (Join-Path $PSScriptRoot "resume.pdf")
)

$ErrorActionPreference = "Stop"
$site = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path -LiteralPath $Docx)) { throw "找不到 Word 文件：$Docx" }

Write-Output "[1/2] Word 导出 PDF：$([System.IO.Path]::GetFileName($Docx)) -> $([System.IO.Path]::GetFileName($Pdf))"
try {
    & (Join-Path $PSScriptRoot "word_to_pdf.ps1") -Docx $Docx -Pdf $Pdf
}
catch {
    # Word 退出阶段偶发 COM 报错，PDF 通常已经产出
    Write-Warning "Word 导出时报错（通常是退出阶段的 COM 异常）：$($_.Exception.Message)"
}
if (-not (Test-Path -LiteralPath $Pdf)) { throw "PDF 没生成：$Pdf" }

Write-Output "[2/2] 压缩内嵌字体"
python (Join-Path $site "tools\shrink_pdf.py") $Pdf

$pages = python -c "import pymupdf,sys; d=pymupdf.open(sys.argv[1]); print(d.page_count)" $Pdf
Write-Output "完成：$([System.IO.Path]::GetFileName($Pdf))  共 $pages 页，$([math]::Round((Get-Item -LiteralPath $Pdf).Length / 1KB)) KB"
if ([int]$pages -ne 1) { Write-Warning "注意：现在是 $pages 页，想压成一页就删点内容或缩小字号后重新导出。" }
