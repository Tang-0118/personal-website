# 一条命令恢复在线演示：起容器 → 起隧道 → 更新 kexin.uno/demo → 推送
# 用法：powershell -ExecutionPolicy Bypass -File tools\start_demo.ps1
param(
    [switch]$NoPush,
    [int]$Port = 8081
)

$ErrorActionPreference = "Stop"
$site = "E:\github_projects\personal-website"
$deploy = "E:\封口检测\bagcheeck_v1.2-agent\bagcheeck_v1.2\deploy"
$cloudflared = "E:\Deepseek_projects\tools\cloudflared.exe"
$log = "$env:TEMP\cf_tunnel.log"

Write-Host "[1/4] 启动容器…" -ForegroundColor Cyan
docker compose -f "$deploy\docker-compose.yml" up -d 2>&1 | Out-Null
$healthy = $false
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 3
    try {
        $r = Invoke-WebRequest "http://127.0.0.1:$Port/health" -UseBasicParsing -TimeoutSec 5
        if ($r.StatusCode -eq 200) { $healthy = $true; break }
    } catch { }
}
if (-not $healthy) { throw "容器没起来，先看 docker compose ps" }
Write-Host "      api 健康检查通过" -ForegroundColor Green

Write-Host "[2/4] 重启隧道…" -ForegroundColor Cyan
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
if (Test-Path $log) { Remove-Item $log -Force }
Start-Process -FilePath $cloudflared `
    -ArgumentList "tunnel", "--url", "http://127.0.0.1:$Port", "--no-autoupdate" `
    -RedirectStandardError $log -WindowStyle Hidden

$url = $null
for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 2
    if (Test-Path $log) {
        $m = Select-String -Path $log -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -ErrorAction SilentlyContinue |
             Select-Object -First 1
        if ($m) { $url = $m.Matches.Value; break }
    }
}
if (-not $url) { throw "隧道没拿到地址，看 $log" }
Write-Host "      $url" -ForegroundColor Green

Write-Host "[3/4] 更新 kexin.uno/demo 跳转…" -ForegroundColor Cyan
Push-Location $site
python tools\update_demo.py $url
if (-not $NoPush) {
    git add demo/index.html
    git -c user.name="Tang-0118" -c user.email="2753538923@qq.com" commit -q -m "demo: point to new tunnel"
    $env:GIT_SSH_COMMAND = "ssh -o BatchMode=yes -o ConnectTimeout=15"
    git push origin main 2>&1 | Out-Null
    Write-Host "      已推送，等 1 分钟左右 GitHub Pages 生效" -ForegroundColor Green
}
Pop-Location

Write-Host "[4/4] 自检…" -ForegroundColor Cyan
try {
    $h = Invoke-WebRequest "$url/health" -UseBasicParsing -TimeoutSec 25
    Write-Host "      公网 health: $($h.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "      公网还打不开（可能刚建隧道，等 30 秒再试）" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "演示地址： https://kexin.uno/demo" -ForegroundColor Cyan
Write-Host "直连地址： $url" -ForegroundColor DarkGray
