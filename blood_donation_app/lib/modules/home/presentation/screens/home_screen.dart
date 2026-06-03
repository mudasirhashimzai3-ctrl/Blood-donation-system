import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/router/app_routes.dart';
import 'package:blood_donation_app/core/theme/app_colors.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/theme/app_text_styles.dart';
import 'package:blood_donation_app/core/widgets/cards/app_card.dart';
import 'package:blood_donation_app/core/widgets/cards/blood_type_badge.dart';
import 'package:blood_donation_app/core/widgets/layouts/app_scaffold.dart';
import 'package:blood_donation_app/core/widgets/layouts/section_header.dart';
import 'package:blood_donation_app/modules/auth/domain/entities/user_entity.dart';
import 'package:blood_donation_app/modules/auth/domain/repositories/auth_repository.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<UserEntity?> _userFuture;

  @override
  void initState() {
    super.initState();
    _userFuture = getIt<AuthRepository>().getCurrentUser();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<UserEntity?>(
      future: _userFuture,
      builder: (context, snapshot) {
        final user = snapshot.data;
        return AppScaffold(
          showBackButton: false,
          body: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(
              horizontal: AppDimensions.screenPaddingH,
              vertical: AppDimensions.screenPaddingV,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(user),
                const SizedBox(height: AppDimensions.xl),
                _buildQuickActions(context, user),
                const SizedBox(height: AppDimensions.xl),
                SectionHeader(
                  title: 'Hospitals',
                  actionLabel: 'See All',
                  onAction: () => context.goNamed(AppRoutes.bloodBanksName),
                ),
                const SizedBox(height: AppDimensions.md),
                _buildBloodGrid(),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildHeader(UserEntity? user) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                user?.fullName ?? 'Blood Donation',
                style: AppTextStyles.headlineLarge,
              ),
              const SizedBox(height: 4),
              Text(
                'Role: ${user?.role.name ?? '-'}',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
        CircleAvatar(
          radius: 24,
          backgroundColor: AppColors.primary.withValues(alpha: 0.1),
          child: const Icon(Icons.person_outline, color: AppColors.primary),
        ),
      ],
    );
  }

  Widget _buildQuickActions(BuildContext context, UserEntity? user) {
    final isRecipient = user?.role == UserRole.recipient;
    final actions = [
      _QuickAction(
        Icons.favorite_border_rounded,
        'Donations',
        AppColors.primary,
        () => context.goNamed(AppRoutes.donationHistoryName),
      ),
      _QuickAction(
        Icons.local_hospital_outlined,
        'Hospitals',
        AppColors.success,
        () => context.goNamed(AppRoutes.bloodBanksName),
      ),
      _QuickAction(
        Icons.notifications_outlined,
        'Alerts',
        AppColors.warning,
        () => context.goNamed(AppRoutes.notificationsName),
      ),
      _QuickAction(
        Icons.bloodtype_outlined,
        isRecipient ? 'Request' : 'Profile',
        AppColors.secondary,
        () => context.goNamed(
          isRecipient ? AppRoutes.requestBloodName : AppRoutes.donorProfileName,
        ),
      ),
    ];

    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: AppDimensions.sm,
      children: actions
          .map(
            (a) => GestureDetector(
              onTap: a.onTap,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      color: a.color.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(
                        AppDimensions.radiusMd,
                      ),
                    ),
                    child: Icon(a.icon, color: a.color, size: 26),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    a.label,
                    style: AppTextStyles.labelSmall,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildBloodGrid() {
    const types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: AppDimensions.sm,
      mainAxisSpacing: AppDimensions.sm,
      childAspectRatio: 0.9,
      children: types
          .map(
            (t) => AppCard(
              padding: const EdgeInsets.all(AppDimensions.sm),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  BloodTypeBadge(bloodType: t, size: 36),
                  const SizedBox(height: 6),
                  Text(
                    'Type',
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.success,
                    ),
                  ),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}

class _QuickAction {

  const _QuickAction(this.icon, this.label, this.color, this.onTap);
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
}
