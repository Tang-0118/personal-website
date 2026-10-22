# 建立命名隧道，把 demo.kexin.uno 固定指向本机 8081
# 前置：已跑过 cloudflared tunnel login，且 kexin.uno 的 NS 已切到 Cloudflare
param(
    [string]$Hostname = "demo.kexin.uno",
    [string]$TunnelName = "bagcheck-copilot",
    [int]$Port = 8081
)

$ErrorActionPreference = "Stop"
$cf = "E:\Deepseek_projects\tools\cloudflared.exe"
$cfDir = "$env:USERPROFILE\.cloudflared"
$config = "$cfDir\config.yml"

Write-Host "[1/6] 检查登录状态…" -ForegroundColor Cyan
if (-not (Test-Path "$cfDir\cert.pem")) {
    throw "还没登录。先跑：`n  & `"$cf`" tunnel login"
}
Write-Host "      cert.pem 存在" -ForegroundColor Green

Write-Host "[2/6] 创建/复用隧道 $TunnelName …" -ForegroundColor Cyan
$tunnels = & $cf tunnel list --output json 2>$null | ConvertFrom-Json
$tunnel = $tunnels | Where-Object { $_.name -eq $TunnelName } | Select-Object -First 1
if (-not $tunnel) {
    & $cf tunnel create $TunnelName | Out-Null
    $tunnels = & $cf tunnel list --output json | ConvertFrom-Json
    $tunnel = $tunnels | Where-Object { $_.name -eq $TunnelName } | Select-Object -First 1
}
if (-not $tunnel) { throw "隧道创建失败" }
$tunnelId = $tunnel.id
Write-Host "      UUID: $tunnelId" -ForegroundColor Green

Write-Host "[3/6] 绑定 $Hostname …" -ForegroundColor Cyan
& $cf tunnel route dns $TunnelName $Hostname 2>&1 | Select-Object -Last 1

Write-Host "[4/6] 写入 config.yml …" -ForegroundColor Cyan
$yaml = @"
tunnel: $tunnelId
credentials-file: $cfDir\$tunnelId.json

ingress:
  - hostname: $Hostname
    service: http://127.0.0.1:$Port
  - service: http_status:404
"@
$yaml | Out-File -FilePath $config -Encoding utf8
Write-Host "      $config" -ForegroundColor Green

Write-Host "[5/6] 测试运行（前台 20 秒）…" -ForegroundColor Cyan
$proc = Start-Process -FilePath $cf -ArgumentList "tunnel","--config",$config,"run",$TunnelName -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 6
$ok = $false
for ($i = 0; $i -lt 4; $i++) {
    try {
        $r = Invoke-WebRequest "https://$Hostname/health" -UseBasicParsing -TimeoutSec 15
        if ($r.StatusCode -eq 200) { $ok = $true; break }
    } catch { Start-Sleep -Seconds 5 }
}
if ($ok) { Write-Host "      https://$Hostname/health -> 200" -ForegroundColor Green }
else { Write-Host "      公网还没通，可能是 DNS 还在生效中（不影响后面继续）" -ForegroundColor Yellow }

Write-Host "[6/6] 注册开机自启…" -ForegroundColor Cyan
$action = New-ScheduledTaskAction -Execute $cf -Argument "tunnel --config `"$config`" run $TunnelName"
$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName "BagcheckDemoTunnel" -Action $action -Trigger $trigger -Principal $principal -Force | Out-Null
Write-Host "      计划任务 BagcheckDemoTunnel 已注册（登录即启动）" -ForegroundColor Green

# 前台测试进程留着，避免刚测通就断
if (-not $proc.HasExited) { Write-Host "      隧道进程 PID $($proc.Id) 保持运行" -ForegroundColor Green }

Write-Host ""
Write-Host "固定地址： https://$Hostname/app/" -ForegroundColor Cyan
Write-Host "下一步：python tools\update_demo.py https://$Hostname/app/ 然后提交" -ForegroundColor DarkGray
