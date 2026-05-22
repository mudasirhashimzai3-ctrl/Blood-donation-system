import 'package:flutter/foundation.dart';

enum AppEnvironment { development, staging, production }

class AppConfig {
  AppConfig._();

  static const String _envName = String.fromEnvironment(
    'APP_ENV',
    defaultValue: 'development',
  );
  static const String _apiBaseUrlFromDefine = String.fromEnvironment(
    'API_BASE_URL',
  );

  static bool get isApiBaseUrlFromDefine => _apiBaseUrlFromDefine.isNotEmpty;

  static AppEnvironment get environment {
    switch (_envName) {
      case 'production':
        return AppEnvironment.production;
      case 'staging':
        return AppEnvironment.staging;
      default:
        return AppEnvironment.development;
    }
  }

  static String get baseUrl {
    if (_apiBaseUrlFromDefine.isNotEmpty) {
      return _apiBaseUrlFromDefine;
    }

    switch (environment) {
      case AppEnvironment.production:
        return 'https://api.blooddonation.app/api';
      case AppEnvironment.staging:
        return 'https://staging-api.blooddonation.app/api';
      case AppEnvironment.development:
        return _localDevelopmentApiBaseUrl();
    }
  }

  static String _localDevelopmentApiBaseUrl() {
    if (kIsWeb) {
      return 'http://localhost:8000/api';
    }

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'http://10.0.2.2:8000/api';
      case TargetPlatform.windows:
      case TargetPlatform.linux:
      case TargetPlatform.macOS:
        return 'http://127.0.0.1:8000/api';
      case TargetPlatform.iOS:
      case TargetPlatform.fuchsia:
        return 'http://localhost:8000/api';
    }
  }

  static String get websocketBaseUrl {
    final uri = Uri.parse(baseUrl);
    final scheme = uri.scheme == 'https' ? 'wss' : 'ws';
    return '$scheme://${uri.host}${uri.hasPort ? ':${uri.port}' : ''}';
  }

  static Duration get connectTimeout => const Duration(seconds: 30);
  static Duration get receiveTimeout => const Duration(seconds: 30);

  static bool get isDebug => environment == AppEnvironment.development;
}
