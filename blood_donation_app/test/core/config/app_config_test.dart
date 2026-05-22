import 'package:blood_donation_app/core/config/app_config.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  tearDown(() {
    debugDefaultTargetPlatformOverride = null;
  });

  test('development base url uses Android emulator loopback on Android', () {
    debugDefaultTargetPlatformOverride = TargetPlatform.android;
    expect(AppConfig.baseUrl, 'http://10.0.2.2:8000/api');
  });

  test('development base url uses local desktop loopback on Windows', () {
    debugDefaultTargetPlatformOverride = TargetPlatform.windows;
    expect(AppConfig.baseUrl, 'http://127.0.0.1:8000/api');
  });

  test('websocket base url is derived from api base url', () {
    debugDefaultTargetPlatformOverride = TargetPlatform.windows;
    expect(AppConfig.websocketBaseUrl, 'ws://127.0.0.1:8000');
  });
}
