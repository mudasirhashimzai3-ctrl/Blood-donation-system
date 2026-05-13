import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:blood_donation_app/core/config/app_config.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/bootstrap.dart';

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

  runApp(const Bootstrap());
}
