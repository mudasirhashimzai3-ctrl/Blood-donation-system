import 'package:blood_donation_app/core/theme/app_colors.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:flutter/material.dart';

class AppDivider extends StatelessWidget {

  const AppDivider({super.key, this.indent, this.endIndent, this.margin});
  final double? indent;
  final double? endIndent;
  final EdgeInsetsGeometry? margin;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: margin ?? EdgeInsets.zero,
      child: Divider(
        color: isDark ? AppColors.darkBorder : AppColors.divider,
        thickness: 1,
        indent: indent,
        endIndent: endIndent,
      ),
    );
  }
}

class AppVerticalDivider extends StatelessWidget {

  const AppVerticalDivider({super.key, this.height});
  final double? height;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return SizedBox(
      height: height ?? AppDimensions.lg,
      child: VerticalDivider(
        color: isDark ? AppColors.darkBorder : AppColors.divider,
        thickness: 1,
        width: 1,
      ),
    );
  }
}
