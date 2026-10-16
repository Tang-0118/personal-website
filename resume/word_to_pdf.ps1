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
if (Test-Path -LiteralPath $pdfPath) { Remove-Item -LiteralPath $pdfPath -Force }

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($docxPath, $false, $true)
    $doc.ExportAsFixedFormat($pdfPath, 17)
    $doc.Close(0)
}
finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}

if (-not (Test-Path -LiteralPath $pdfPath)) { throw "PDF export failed" }
Write-Output "PDF: $pdfPath"
