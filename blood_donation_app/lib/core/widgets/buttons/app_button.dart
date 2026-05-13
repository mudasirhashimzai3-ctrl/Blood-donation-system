import 'package:flutter/material.dart';
import 'package:blood_donation_app/core/theme/app_colors.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/theme/app_text_styles.dart';
import 'package:blood_donation_app/core/widgets/loaders/app_loading_indicator.dart';

enum AppButtonVariant { primary, outlined, text, danger }

class AppButton extends StatelessWidget {

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.isLoading = false,
    this.isFullWidth = true,
    this.prefixIcon,
    this.suffixIcon,
    this.height,
    this.borderRadius,
  });
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final bool isLoading;
  final bool isFullWidth;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final double? height;
  final double? borderRadius;

  @override
  Widget build(BuildContext context) {
    final h = height ?? AppDimensions.buttonHeightMd;
    final radius = borderRadius ?? AppDimensions.radiusMd;
    final disabled = onPressed == null || isLoading;

    switch (variant) {
      case AppButtonVariant.primary:
        return _buildElevated(context, h, radius, disabled);
      case AppButtonVariant.outlined:
        return _buildOutlined(context, h, radius, disabled);
      case AppButtonVariant.text:
        return _buildText(context, h, radius, disabled);
      case AppButtonVariant.danger:
        return _buildDanger(context, h, radius, disabled);
    }
  }

  Widget _buildElevated(
    BuildContext context,
    double h,
    double radius,
    bool disabled,
  ) {
    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      height: h,
      child: ElevatedButton(
        onPressed: disabled ? null : onPressed,
        style: ElevatedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radius),
          ),
        ),
        child: _buildChild(AppColors.textOnPrimary),
      ),
    );
  }

  Widget _buildOutlined(
    BuildContext context,
    double h,
    double radius,
    bool disabled,
  ) {
    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      height: h,
      child: OutlinedButton(
        onPressed: disabled ? null : onPressed,
        style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radius),
          ),
        ),
        child: _buildChild(AppColors.primary),
      ),
    );
  }

  Widget _buildText(
    BuildContext context,
    double h,
    double radius,
    bool disabled,
  ) {
    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      height: h,
      child: TextButton(
        onPressed: disabled ? null : onPressed,
        style: TextButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radius),
          ),
        ),
        child: _buildChild(AppColors.primary),
      ),
    );
  }

  Widget _buildDanger(
    BuildContext context,
    double h,
    double radius,
    bool disabled,
  ) {
    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      height: h,
      child: ElevatedButton(
        onPressed: disabled ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.error,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(radius),
          ),
        ),
        child: _buildChild(Colors.white),
      ),
    );
  }

  Widget _buildChild(Color color) {
    if (isLoading) {
      return AppLoadingIndicator(color: color, size: 20);
    }
    if (prefixIcon == null && suffixIcon == null) {
      return Text(label, style: AppTextStyles.button.copyWith(color: color));
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (prefixIcon != null) ...[prefixIcon!, const SizedBox(width: 8)],
        Text(label, style: AppTextStyles.button.copyWith(color: color)),
        if (suffixIcon != null) ...[const SizedBox(width: 8), suffixIcon!],
      ],
    );
  }
}
