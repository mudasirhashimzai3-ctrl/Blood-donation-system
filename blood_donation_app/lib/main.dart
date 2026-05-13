import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:blood_donation_app/core/config/app_config.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/bootstrap.dart';
import 'package:flutter/foundation.dart';

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
  }

  runApp(const Bootstrap());
}
