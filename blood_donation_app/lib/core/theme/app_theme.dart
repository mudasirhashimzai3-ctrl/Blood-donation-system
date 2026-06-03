import 'package:blood_donation_app/core/theme/app_colors.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/theme/app_text_styles.dart';
import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        onPrimary: AppColors.textOnPrimary,
        secondary: AppColors.secondary,
        onSecondary: AppColors.textOnPrimary,
        error: AppColors.error,
        surface: AppColors.surface,
        onSurface: AppColors.textPrimary,
      ),
      fontFamily: 'AppFont',
      textTheme: _buildTextTheme(Brightness.light),
      appBarTheme: _buildAppBarTheme(Brightness.light),
      elevatedButtonTheme: _buildElevatedButtonTheme(),
      outlinedButtonTheme: _buildOutlinedButtonTheme(),
      textButtonTheme: _buildTextButtonTheme(),
      inputDecorationTheme: _buildInputDecorationTheme(Brightness.light),
      cardTheme: _buildCardTheme(Brightness.light),
      bottomNavigationBarTheme: _buildBottomNavTheme(Brightness.light),
      chipTheme: _buildChipTheme(Brightness.light),
      dividerTheme: const DividerThemeData(
        color: AppColors.divider,
        thickness: 1,
        space: 1,
      ),
      scaffoldBackgroundColor: AppColors.background,
      snackBarTheme: _buildSnackBarTheme(),
      dialogTheme: _buildDialogTheme(Brightness.light),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.dark,
        primary: AppColors.primaryLight,
        onPrimary: AppColors.darkBackground,
        secondary: AppColors.secondaryLight,
        onSecondary: AppColors.darkBackground,
        error: const Color(0xFFEF9A9A),
        surface: AppColors.darkSurface,
        onSurface: AppColors.darkTextPrimary,
      ),
      fontFamily: 'AppFont',
      textTheme: _buildTextTheme(Brightness.dark),
      appBarTheme: _buildAppBarTheme(Brightness.dark),
      elevatedButtonTheme: _buildElevatedButtonTheme(),
      outlinedButtonTheme: _buildOutlinedButtonTheme(),
      textButtonTheme: _buildTextButtonTheme(),
      inputDecorationTheme: _buildInputDecorationTheme(Brightness.dark),
      cardTheme: _buildCardTheme(Brightness.dark),
      bottomNavigationBarTheme: _buildBottomNavTheme(Brightness.dark),
      chipTheme: _buildChipTheme(Brightness.dark),
      dividerTheme: const DividerThemeData(
        color: AppColors.darkBorder,
        thickness: 1,
        space: 1,
      ),
      scaffoldBackgroundColor: AppColors.darkBackground,
      snackBarTheme: _buildSnackBarTheme(),
      dialogTheme: _buildDialogTheme(Brightness.dark),
    );
  }

  // ─── Text Theme ───────────────────────────────────────────────────────────

  static TextTheme _buildTextTheme(Brightness brightness) {
    final Color textColor = brightness == Brightness.light
        ? AppColors.textPrimary
        : AppColors.darkTextPrimary;
    final Color secondaryColor = brightness == Brightness.light
        ? AppColors.textSecondary
        : AppColors.darkTextSecondary;

    return TextTheme(
      displayLarge: AppTextStyles.displayLarge.copyWith(color: textColor),
      displayMedium: AppTextStyles.displayMedium.copyWith(color: textColor),
      headlineLarge: AppTextStyles.headlineLarge.copyWith(color: textColor),
      headlineMedium: AppTextStyles.headlineMedium.copyWith(color: textColor),
      headlineSmall: AppTextStyles.headlineSmall.copyWith(color: textColor),
      titleLarge: AppTextStyles.titleLarge.copyWith(color: textColor),
      titleMedium: AppTextStyles.titleMedium.copyWith(color: textColor),
      titleSmall: AppTextStyles.titleSmall.copyWith(color: textColor),
      bodyLarge: AppTextStyles.bodyLarge.copyWith(color: textColor),
      bodyMedium: AppTextStyles.bodyMedium.copyWith(color: textColor),
      bodySmall: AppTextStyles.bodySmall.copyWith(color: secondaryColor),
      labelLarge: AppTextStyles.labelLarge.copyWith(color: textColor),
      labelMedium: AppTextStyles.labelMedium.copyWith(color: secondaryColor),
      labelSmall: AppTextStyles.labelSmall.copyWith(color: secondaryColor),
    );
  }

  // ─── AppBar Theme ─────────────────────────────────────────────────────────

  static AppBarTheme _buildAppBarTheme(Brightness brightness) {
    return AppBarTheme(
      elevation: 0,
      scrolledUnderElevation: 1,
      centerTitle: true,
      backgroundColor: brightness == Brightness.light
          ? AppColors.surface
          : AppColors.darkSurface,
      foregroundColor: brightness == Brightness.light
          ? AppColors.textPrimary
          : AppColors.darkTextPrimary,
      titleTextStyle: AppTextStyles.headlineSmall.copyWith(
        color: brightness == Brightness.light
            ? AppColors.textPrimary
            : AppColors.darkTextPrimary,
      ),
      iconTheme: IconThemeData(
        color: brightness == Brightness.light
            ? AppColors.textPrimary
            : AppColors.darkTextPrimary,
        size: AppDimensions.iconMd,
      ),
    );
  }

  // ─── Button Themes ────────────────────────────────────────────────────────

  static ElevatedButtonThemeData _buildElevatedButtonTheme() {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textOnPrimary,
        minimumSize: const Size(double.infinity, AppDimensions.buttonHeightMd),
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
        ),
        textStyle: AppTextStyles.button,
        elevation: 0,
      ),
    );
  }

  static OutlinedButtonThemeData _buildOutlinedButtonTheme() {
    return OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        minimumSize: const Size(double.infinity, AppDimensions.buttonHeightMd),
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.lg),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
        ),
        side: const BorderSide(color: AppColors.primary, width: 1.5),
        textStyle: AppTextStyles.button,
      ),
    );
  }

  static TextButtonThemeData _buildTextButtonTheme() {
    return TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primary,
        padding: const EdgeInsets.symmetric(
          horizontal: AppDimensions.md,
          vertical: AppDimensions.sm,
        ),
        textStyle: AppTextStyles.button,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
        ),
      ),
    );
  }

  // ─── Input Decoration Theme ───────────────────────────────────────────────

  static InputDecorationTheme _buildInputDecorationTheme(
    Brightness brightness,
  ) {
    final bool isLight = brightness == Brightness.light;
    return InputDecorationTheme(
      filled: true,
      fillColor: isLight
          ? AppColors.surfaceVariant
          : AppColors.darkSurfaceVariant,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.md,
        vertical: AppDimensions.md,
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
        borderSide: BorderSide(
          color: isLight ? AppColors.border : AppColors.darkBorder,
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
        borderSide: BorderSide(
          color: isLight ? AppColors.border : AppColors.darkBorder,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
        borderSide: const BorderSide(color: AppColors.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
        borderSide: const BorderSide(color: AppColors.error, width: 2),
      ),
      labelStyle: AppTextStyles.bodyMedium.copyWith(
        color: isLight ? AppColors.textSecondary : AppColors.darkTextSecondary,
      ),
      hintStyle: AppTextStyles.bodyMedium.copyWith(
        color: isLight ? AppColors.textDisabled : const Color(0xFF666666),
      ),
      errorStyle: AppTextStyles.caption.copyWith(color: AppColors.error),
    );
  }

  // ─── Card Theme ───────────────────────────────────────────────────────────

  static CardThemeData _buildCardTheme(Brightness brightness) {
    return CardThemeData(
      elevation: 0,
      color: brightness == Brightness.light
          ? AppColors.surface
          : AppColors.darkSurface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        side: BorderSide(
          color: brightness == Brightness.light
              ? AppColors.border
              : AppColors.darkBorder,
        ),
      ),
      margin: const EdgeInsets.all(0),
    );
  }

  // ─── Bottom Navigation ────────────────────────────────────────────────────

  static BottomNavigationBarThemeData _buildBottomNavTheme(
    Brightness brightness,
  ) {
    return BottomNavigationBarThemeData(
      backgroundColor: brightness == Brightness.light
          ? AppColors.surface
          : AppColors.darkSurface,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: brightness == Brightness.light
          ? AppColors.textSecondary
          : AppColors.darkTextSecondary,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
      selectedLabelStyle: AppTextStyles.labelSmall.copyWith(
        color: AppColors.primary,
        fontWeight: FontWeight.w600,
      ),
      unselectedLabelStyle: AppTextStyles.labelSmall,
    );
  }

  // ─── Chip Theme ───────────────────────────────────────────────────────────

  static ChipThemeData _buildChipTheme(Brightness brightness) {
    final bool isLight = brightness == Brightness.light;
    return ChipThemeData(
      backgroundColor: isLight
          ? AppColors.surfaceVariant
          : AppColors.darkSurfaceVariant,
      selectedColor: AppColors.primary.withValues(alpha: 0.15),
      side: BorderSide(
        color: isLight ? AppColors.border : AppColors.darkBorder,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusFull),
      ),
      labelStyle: AppTextStyles.labelMedium,
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.md,
        vertical: AppDimensions.xs,
      ),
    );
  }

  // ─── SnackBar Theme ───────────────────────────────────────────────────────

  static SnackBarThemeData _buildSnackBarTheme() {
    return SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
      ),
      contentTextStyle: AppTextStyles.bodyMedium.copyWith(color: Colors.white),
    );
  }

  // ─── Dialog Theme ─────────────────────────────────────────────────────────

  static DialogThemeData _buildDialogTheme(Brightness brightness) {
    return DialogThemeData(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.radiusXl),
      ),
      backgroundColor: brightness == Brightness.light
          ? AppColors.surface
          : AppColors.darkSurface,
      elevation: 0,
      titleTextStyle: AppTextStyles.headlineSmall.copyWith(
        color: brightness == Brightness.light
            ? AppColors.textPrimary
            : AppColors.darkTextPrimary,
      ),
    );
  }
}
