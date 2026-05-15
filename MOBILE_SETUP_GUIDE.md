# Mobile Device Connection Guide for Blood Donation App

## Prerequisites
1. Android device with USB debugging enabled
2. USB cable for connection
3. Flutter SDK installed
4. Django backend code cloned
5. MySQL database configured

## Step-by-Step Setup

### 1. Prepare Your Android Device
- Enable Developer Options:
  - Go to Settings > About phone
  - Tap "Build number" 7 times
- Enable USB debugging:
  - Go to Settings > System > Developer options
  - Toggle "USB debugging" ON

### 2. Connect Device and Verify
```bash
# Connect device via USB
adb devices

# You should see your device listed
# If prompted on device, allow USB debugging
```

### 3. Set Up ADB Reverse (Recommended Method)
```bash
# Set up port forwarding from device to your machine
adb reverse tcp:8000 tcp:8000

# Verify the reverse connection
adb reverse --list
# Should show: tcp:8000 tcp:8000
```

### 4. Configure Django Backend
Edit `.env` file in backend directory:
```
DATABASE_URL=mysql://root:Admin%40123@127.0.0.1:3306/blood_donation
DEBUG=true
CORS_ALLOW_ALL_ORIGINS=true
ALLOWED_HOSTS=*
```

Ensure `settings.py` has:
```python
ALLOWED_HOSTS = ["*", "localhost", "127.0.0.1", "[::1]", "0.0.0.0", "testserver"]
CORS_ALLOW_ALL_ORIGINS = True
```

### 5. Start the Backend Server
```bash
# Navigate to backend directory
cd C:\blood donation project\Blood donation system\backend

# Start Django development server
python manage.py runserver 127.0.0.1:8000
```

### 6. Launch the Flutter App
```bash
# Navigate to app directory
cd C:\blood donation project\Blood donation system\blood_donation_app

# Run the app (will use default API_BASE_URL from app_config.dart)
flutter run
```

## Alternative Method: Using LAN IP (WiFi)
If you prefer wireless debugging or can't use USB:

### 1. Find Your Machine's IP Address
```bash
# Windows
ipconfig
# Look for IPv4 Address under your active network adapter
# Example: 192.168.1.100
```

### 2. Configure Backend to Listen on All Interfaces
```bash
python manage.py runserver 0.0.0.0:8000
```

### 3. Launch App with Custom API Base URL
```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.100:8000/api
```

## Troubleshooting

### Connection Issues
1. **"check your api or network" error persists:**
   - Verify `adb reverse` is active: `adb reverse --list`
   - Test API endpoint from device browser: Visit `http://127.0.0.1:8000/core/health/`
   - If using LAN IP: Ensure device can ping your machine's IP

2. **Backend not accessible:**
   - Check Windows Firewall: Allow port 8000 for private networks
   - Verify Django is running: `netstat -ano | findstr :8000`
   - Check ALLOWED_HOSTS includes "*" or your device IP

3. **CORS Errors:**
   - Confirm `CORS_ALLOW_ALL_ORIGINS=true` in `.env`
   - Check browser/devtools console for specific CORS error details

### Verification Steps
1. After connecting, check Flutter console for:
   ```
   Mobile API base URL: http://10.0.2.2:8000/api
   API preflight OK: http://10.0.2.2:8000/api/core/health/
   ```

2. Test donor/recipient screens load data without errors

3. If using LAN IP method, verify console shows your custom API base URL

## Maintenance
- When disconnecting USB, clear adb reverse: `adb reverse --remove-all`
- If IP changes (DHCP), update `--dart-define` value accordingly
- For production, configure proper domain and SSL certificates

## Security Note
Using `ALLOWED_HOSTS=["*"]` and `CORS_ALLOW_ALL_ORIGINS=true` is suitable for development only. For production, restrict to specific domains.