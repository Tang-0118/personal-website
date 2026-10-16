param(

    [Parameter(Mandatory = $true)][string]$Docx,

    [Parameter(Mandatory = $true)][string]$Pdf

)



$ErrorActionPreference = "Stop"

$docxPath = (Resolve-Path -LiteralPath $Docx).Path

$pdfDir = Split-Path -Parent $Pdf

if (-not (Test-Path -LiteralPath $pdfDir)) {

    New-Item -ItemType Directory -Force -Path $pdfDir | Out-Null

}

$pdfPath = [System.IO.Path]::GetFullPath($Pdf)

$tmpPath = $pdfPath + ".new.pdf"



# 先导到临时文件，再覆盖目标：目标正被预览器打开时也不会打断 Word 导出

if (Test-Path -LiteralPath $tmpPath) { [System.IO.File]::Delete($tmpPath) }



$word = New-Object -ComObject Word.Application

$word.Visible = $false

$word.DisplayAlerts = 0

try {

    $doc = $word.Documents.Open($docxPath, $false, $true)

    $doc.ExportAsFixedFormat($tmpPath, 17)

    $doc.Close(0)

}

finally {

    # Word 退出阶段偶尔抛 COM 报错（RPC failed），别让它中断后续的覆盖步骤

    try { $word.Quit() } catch { Write-Warning "Word 退出时报错（可忽略）：$($_.Exception.Message)" }

    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null } catch { }

}



if (-not (Test-Path -LiteralPath $tmpPath)) { throw "PDF export failed" }



try {

    [System.IO.File]::Copy($tmpPath, $pdfPath, $true)

}

catch {

    throw "PDF 已导出到 $tmpPath，但覆盖 $pdfPath 失败（文件可能正被预览器打开）：$($_.Exception.Message)"

}

[System.IO.File]::Delete($tmpPath)

Write-Output "PDF: $pdfPath"

