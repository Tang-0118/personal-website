$ErrorActionPreference = "Stop"

$site = Join-Path (Split-Path -Parent $PSScriptRoot) "github_projects\personal-website"
$site = "E:\github_projects\personal-website"
$zip = "E:\github_projects\personal-website-deploy.zip"

if (-not (Test-Path -LiteralPath $site)) { throw "site folder not found: $site" }
if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }

$items = @("index.html", "cv.html", "README.md", "preview.png", "preview-mobile.png", "assets") |
    ForEach-Object { Join-Path $site $_ } |
    Where-Object { Test-Path -LiteralPath $_ }

Compress-Archive -Path $items -DestinationPath $zip -CompressionLevel Optimal

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($zip)
$hasCv = [bool]($archive.Entries | Where-Object { $_.FullName -eq "cv.html" })
$count = $archive.Entries.Count
$archive.Dispose()

$info = Get-Item -LiteralPath $zip
Write-Output ("zip: {0}" -f $info.FullName)
Write-Output ("size: {0:N2} MB, entries: {1}, contains cv.html: {2}" -f ($info.Length / 1MB), $count, $hasCv)
