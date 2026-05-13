import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:blood_donation_app/core/theme/app_colors.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';

class AppShimmerBox extends StatelessWidget {

  const AppShimmerBox({
    super.key,
    this.width,
    this.height,
    this.borderRadius = AppDimensions.radiusSm,
  });
  final double? width;
  final double? height;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? const Color(0xFF2A2A2A) : const Color(0xFFE0E0E0),
      highlightColor: isDark
          ? const Color(0xFF3A3A3A)
          : const Color(0xFFF5F5F5),
      child: Container(
        width: width,
        height: height ?? 16,
        decoration: BoxDecoration(
          color: AppColors.border,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

class AppShimmerCard extends StatelessWidget {

  const AppShimmerCard({super.key, this.height});
  final double? height;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height ?? 100,
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const AppShimmerBox(
                width: 48,
                height: 48,
                borderRadius: AppDimensions.radiusFull,
              ),
              const SizedBox(width: AppDimensions.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const AppShimmerBox(width: 120, height: 14),
                    const SizedBox(height: 8),
                    AppShimmerBox(
                      width: MediaQuery.of(context).size.width * 0.4,
                      height: 12,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.md),
          const AppShimmerBox(height: 12),
          const SizedBox(height: 8),
          const AppShimmerBox(height: 12, width: double.infinity),
        ],
      ),
    );
  }
}
