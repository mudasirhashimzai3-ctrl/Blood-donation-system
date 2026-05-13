import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:blood_donation_app/core/config/app_config.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/bootstrap.dart';
import 'package:flutter/foundation.dart';

Uri _buildHealthUri() {
  final baseUrl = AppConfig.baseUrl;
  final normalizedBase =
      baseUrl.endsWith('/') ? baseUrl : '$baseUrl/';
  return Uri.parse(normalizedBase).resolve('core/health/');
}

Future<void> _debugApiPreflight() async {
  if (!kDebugMode) return;

  final healthUri = _buildHealthUri();
  final client = HttpClient()..connectionTimeout = const Duration(seconds: 4);
  try {
    final request = await client.getUrl(healthUri);
    request.headers.set(HttpHeaders.acceptHeader, 'application/json');
    final response =
        await request.close().timeout(const Duration(seconds: 4));
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
      'If using a physical Android phone via USB:\n'
      '1) Run adb reverse tcp:8000 tcp:8000\n'
      '2) Start backend on 127.0.0.1:8000\n'
      '3) Run Flutter with --dart-define=API_BASE_URL=http://127.0.0.1:8000/api',
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
    if (!AppConfig.isApiBaseUrlFromDefine) {
      debugPrint(
        'Hint: pass --dart-define=API_BASE_URL=http://<your-lan-ip>:8000/api when using a physical phone.',
      );
    }
    await _debugApiPreflight();
  }

  runApp(const Bootstrap());
}
