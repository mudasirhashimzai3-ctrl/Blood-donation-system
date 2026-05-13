import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Brand
  static const Color primary = Color(0xFFD32F2F); // Red 700
  static const Color primaryLight = Color(0xFFFF6659); // Red 300
  static const Color primaryDark = Color(0xFF9A0007); // Red 900
  static const Color secondary = Color(0xFF1565C0); // Blue 800
  static const Color secondaryLight = Color(0xFF5E92F3);
  static const Color secondaryDark = Color(0xFF003c8f);

  // Semantics
  static const Color success = Color(0xFF2E7D32);
  static const Color warning = Color(0xFFF57F17);
  static const Color error = Color(0xFFC62828);
  static const Color info = Color(0xFF01579B);

  // Neutrals
  static const Color background = Color(0xFFFAFAFA);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF5F5F5);
  static const Color border = Color(0xFFE0E0E0);
  static const Color divider = Color(0xFFEEEEEE);

  // Text
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textDisabled = Color(0xFFBDBDBD);
  static const Color textOnPrimary = Color(0xFFFFFFFF);

  // Dark mode
  static const Color darkBackground = Color(0xFF121212);
  static const Color darkSurface = Color(0xFF1E1E1E);
  static const Color darkSurfaceVariant = Color(0xFF2C2C2C);
  static const Color darkBorder = Color(0xFF373737);
  static const Color darkTextPrimary = Color(0xFFEEEEEE);
  static const Color darkTextSecondary = Color(0xFFAAAAAA);

  // Blood type colors
  static const Map<String, Color> bloodTypeColors = {
    'A+': Color(0xFFE53935),
    'A-': Color(0xFFEF5350),
    'B+': Color(0xFFD81B60),
    'B-': Color(0xFFE91E63),
    'AB+': Color(0xFF8E24AA),
    'AB-': Color(0xFF9C27B0),
    'O+': Color(0xFFE65100),
    'O-': Color(0xFFF57C00),
  };
}
