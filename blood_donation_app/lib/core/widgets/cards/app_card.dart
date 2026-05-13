import 'package:flutter/material.dart';
import 'package:blood_donation_app/core/theme/app_colors.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';

class AppCard extends StatelessWidget {

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.borderRadius,
    this.color,
    this.hasBorder = true,
    this.elevation = 0,
  });
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final double? borderRadius;
  final Color? color;
  final bool hasBorder;
  final double elevation;

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? AppDimensions.radiusLg;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Material(
      color: color ?? (isDark ? AppColors.darkSurface : AppColors.surface),
      elevation: elevation,
      borderRadius: BorderRadius.circular(radius),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(radius),
        child: Container(
          padding: padding ?? const EdgeInsets.all(AppDimensions.cardPadding),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(radius),
            border: hasBorder
                ? Border.all(
                    color: isDark ? AppColors.darkBorder : AppColors.border,
                  )
                : null,
          ),
          child: child,
        ),
      ),
    );
  }
}
