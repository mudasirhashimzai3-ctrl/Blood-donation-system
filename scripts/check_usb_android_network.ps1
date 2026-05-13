param(
    [string]$DeviceId = "",
    [int]$Port = 8000
)

$ErrorActionPreference = "Stop"
$adbPath = Join-Path $env:LOCALAPPDATA "Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adbPath)) {
    $cmd = Get-Command adb -ErrorAction SilentlyContinue
    if ($cmd) {
        $adbPath = $cmd.Source
    } else {
        throw "adb not found."
    }
}

if ([string]::IsNullOrWhiteSpace($DeviceId)) {
    $line = (& $adbPath devices | Select-String "device$" | Select-Object -First 1)
    if (-not $line) {
        throw "No connected Android device found."
    }
    $DeviceId = ($line.ToString() -split "\s+")[0]
}

Write-Host "Device: $DeviceId"
Write-Host "ADB reverse mappings:"
& $adbPath -s $DeviceId reverse --list

Write-Host "Local backend check:"
try {
    $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/api/core/health/" -UseBasicParsing -TimeoutSec 8
    Write-Host "Health OK: $($resp.Content)"
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)"
    throw
}
