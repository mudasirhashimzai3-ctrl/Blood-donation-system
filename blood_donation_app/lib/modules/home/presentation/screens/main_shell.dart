import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:blood_donation_app/core/router/app_routes.dart';
import 'package:blood_donation_app/core/theme/app_colors.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/theme/app_text_styles.dart';

class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.child});
  final Widget child;

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location.startsWith(AppRoutes.donorProfile)) return 1;
    if (location.startsWith(AppRoutes.requestBlood)) return 2;
    if (location.startsWith(AppRoutes.donationHistory)) return 2;
    if (location.startsWith(AppRoutes.bloodBanks)) return 3;
    if (location.startsWith(AppRoutes.notifications)) return 4;
    return 0;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.goNamed(AppRoutes.homeName);
        break;
      case 1:
        context.goNamed(AppRoutes.donorProfileName);
        break;
      case 2:
        context.goNamed(AppRoutes.donationHistoryName);
        break;
      case 3:
        context.goNamed(AppRoutes.bloodBanksName);
        break;
      case 4:
        context.goNamed(AppRoutes.notificationsName);
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.surface,
          border: Border(
            top: BorderSide(
              color: isDark ? AppColors.darkBorder : AppColors.border,
            ),
          ),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: AppDimensions.bottomNavHeight,
            child: Row(
              children:
                  [
                    const _NavItem(
                      icon: Icons.home_outlined,
                      activeIcon: Icons.home_rounded,
                      label: 'Home',
                      index: 0,
                    ),
                    const _NavItem(
                      icon: Icons.person_outline_rounded,
                      activeIcon: Icons.person_rounded,
                      label: 'Profile',
                      index: 1,
                    ),
                    const _NavItem(
                      icon: Icons.favorite_border_rounded,
                      activeIcon: Icons.favorite_rounded,
                      label: 'Donate',
                      index: 2,
                    ),
                    const _NavItem(
                      icon: Icons.local_hospital_outlined,
                      activeIcon: Icons.local_hospital_rounded,
                      label: 'Banks',
                      index: 3,
                    ),
                    const _NavItem(
                      icon: Icons.notifications_outlined,
                      activeIcon: Icons.notifications_rounded,
                      label: 'Alerts',
                      index: 4,
                    ),
                  ].map((item) {
                    final active = _currentIndex(context) == item.index;
                    return Expanded(
                      child: InkWell(
                        onTap: () => _onTap(context, item.index),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              active ? item.activeIcon : item.icon,
                              color: active
                                  ? AppColors.primary
                                  : AppColors.textSecondary,
                              size: AppDimensions.iconMd,
                            ),
                            const SizedBox(height: 3),
                            Text(
                              item.label,
                              style: AppTextStyles.labelSmall.copyWith(
                                color: active
                                    ? AppColors.primary
                                    : AppColors.textSecondary,
                                fontWeight: active
                                    ? FontWeight.w600
                                    : FontWeight.w400,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.index,
  });
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final int index;
}
