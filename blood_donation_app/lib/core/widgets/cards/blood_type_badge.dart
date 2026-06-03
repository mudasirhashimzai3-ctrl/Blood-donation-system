import 'package:blood_donation_app/core/theme/app_colors.dart';
import 'package:blood_donation_app/core/theme/app_text_styles.dart';
import 'package:flutter/material.dart';

class BloodTypeBadge extends StatelessWidget {

  const BloodTypeBadge({
    super.key,
    required this.bloodType,
    this.size = 40,
    this.large = false,
  });
  final String bloodType;
  final double size;
  final bool large;

  @override
  Widget build(BuildContext context) {
    final color = AppColors.bloodTypeColors[bloodType] ?? AppColors.primary;
    final badgeSize = large ? 72.0 : size;

    return Container(
      width: badgeSize,
      height: badgeSize,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        shape: BoxShape.circle,
        border: Border.all(color: color, width: large ? 2.5 : 2),
      ),
      alignment: Alignment.center,
      child: Text(
        bloodType,
        style: (large ? AppTextStyles.headlineMedium : AppTextStyles.titleSmall)
            .copyWith(color: color, fontWeight: FontWeight.w700),
      ),
    );
  }
}
