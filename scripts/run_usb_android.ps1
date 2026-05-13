param(
    [string]$DeviceId = "",
    [string]$ApiBaseUrl = "http://127.0.0.1:8000/api",
    [string]$BackendHost = "127.0.0.1",
    [int]$BackendPort = 8000
)

$ErrorActionPreference = "Stop"

function Resolve-AdbPath {
    $localSdk = Join-Path $env:LOCALAPPDATA "Android\Sdk\platform-tools\adb.exe"
    if (Test-Path $localSdk) {
        return $localSdk
    }

    $adbFromPath = Get-Command adb -ErrorAction SilentlyContinue
    if ($adbFromPath) {
        return $adbFromPath.Source
    }

    throw "adb not found. Install Android platform-tools or add adb to PATH."
}

function Ensure-BackendListening {
    param([string]$Host, [int]$Port)
    $listening = netstat -ano | Select-String -Pattern "LISTENING" | Select-String -Pattern "$Host`:$Port"
    if ($listening) {
        Write-Host "Backend already listening on $Host:$Port"
        return
    }

    Write-Host "Starting Django backend on $Host:$Port ..."
    Start-Process -FilePath "python" `
        -ArgumentList "manage.py runserver $Host`:$Port" `
        -WorkingDirectory "backend" `
        -WindowStyle Hidden

    Start-Sleep -Seconds 3
}

$adb = Resolve-AdbPath
Write-Host "Using adb: $adb"

& $adb devices

if ([string]::IsNullOrWhiteSpace($DeviceId)) {
    $line = (& $adb devices | Select-String "device$" | Select-Object -First 1)
    if (-not $line) {
        throw "No Android device connected. Connect phone via USB and enable USB debugging."
    }
    $DeviceId = ($line.ToString() -split "\s+")[0]
}

Write-Host "Target device: $DeviceId"

Write-Host "Configuring ADB reverse tcp:$BackendPort -> tcp:$BackendPort ..."
& $adb -s $DeviceId reverse "tcp:$BackendPort" "tcp:$BackendPort"
& $adb -s $DeviceId reverse --list

Ensure-BackendListening -Host $BackendHost -Port $BackendPort

Write-Host "Checking backend health endpoint..."
try {
    $health = Invoke-WebRequest -Uri "http://$BackendHost`:$BackendPort/api/core/health/" -UseBasicParsing -TimeoutSec 8
    Write-Host "Health response: $($health.Content)"
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)"
    throw
}

Write-Host "Launching Flutter with API_BASE_URL=$ApiBaseUrl"
Push-Location "blood_donation_app"
try {
    flutter run -d $DeviceId --dart-define "API_BASE_URL=$ApiBaseUrl" --target lib/main.dart --debug
} finally {
    Pop-Location
}
