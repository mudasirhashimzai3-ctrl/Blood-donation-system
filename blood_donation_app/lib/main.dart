import 'package:blood_donation_app/bootstrap.dart';
import 'package:blood_donation_app/core/config/app_config.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

Uri _buildHealthUri() {
  final baseUrl = AppConfig.baseUrl;
  final normalizedBase = baseUrl.endsWith('/') ? baseUrl : '$baseUrl/';
  return Uri.parse(normalizedBase).resolve('core/health/');
}

bool _isPhysicalMobileDebugTarget() {
  if (kIsWeb) return false;
  return defaultTargetPlatform == TargetPlatform.android ||
      defaultTargetPlatform == TargetPlatform.iOS;
}

Future<void> _debugApiPreflight() async {
  if (!kDebugMode) return;

  final healthUri = _buildHealthUri();
  final mobileHint = _isPhysicalMobileDebugTarget()
      ? '\nIf using a physical Android phone via USB:\n'
          '1) Run adb reverse tcp:8000 tcp:8000\n'
          '2) Start backend on 127.0.0.1:8000\n'
          '3) Run Flutter with --dart-define=API_BASE_URL=http://127.0.0.1:8000/api'
      : '';
  final client = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 4),
      receiveTimeout: const Duration(seconds: 4),
      headers: const {'Accept': 'application/json'},
    ),
  );

  try {
    final response = await client.getUri<dynamic>(healthUri);
    if (response.statusCode == 200) {
      debugPrint('API preflight OK: $healthUri');
      return;
    }

    debugPrint(
      'API preflight failed (${response.statusCode}) at $healthUri. '
      'Check backend startup and ALLOWED_HOSTS/CORS.',
    );
  } catch (error) {
    debugPrint(
      'API preflight error for $healthUri: $error\n'
      'If this is Flutter web and browser console shows CORS, allow X-Client-Platform in backend CORS headers.'
      '$mobileHint',
    );
  } finally {
    client.close(force: true);
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock orientation to portrait
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Configure status bar
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize dependencies
  await configureDependencies(AppConfig.environment);

  if (kDebugMode) {
    debugPrint('Mobile API base URL: ${AppConfig.baseUrl}');
    if (!AppConfig.baseUrl.startsWith('http')) {
      debugPrint('Warning: API_BASE_URL looks invalid. Expected http(s) URL.');
    }
    if (!AppConfig.isApiBaseUrlFromDefine && _isPhysicalMobileDebugTarget()) {
      debugPrint(
        'Hint: pass --dart-define=API_BASE_URL=http://<your-lan-ip>:8000/api when using a physical phone.',
      );
    }
    await _debugApiPreflight();
  }

  runApp(const Bootstrap());
}
