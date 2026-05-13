import 'package:flutter/material.dart';
import 'package:blood_donation_app/core/theme/app_colors.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';

class AppIconButton extends StatelessWidget {

  const AppIconButton({
    super.key,
    required this.icon,
    this.onPressed,
    this.backgroundColor,
    this.iconColor,
    this.size = AppDimensions.buttonHeightMd,
    this.tooltip,
    this.outlined = false,
  });
  final Widget icon;
  final VoidCallback? onPressed;
  final Color? backgroundColor;
  final Color? iconColor;
  final double size;
  final String? tooltip;
  final bool outlined;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip ?? '',
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(size / 2),
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            color:
                backgroundColor ??
                (outlined
                    ? Colors.transparent
                    : AppColors.primary.withValues(alpha: 0.1)),
            shape: BoxShape.circle,
            border: outlined
                ? Border.all(color: AppColors.primary, width: 1.5)
                : null,
          ),
          child: Center(child: icon),
        ),
      ),
    );
  }
}
