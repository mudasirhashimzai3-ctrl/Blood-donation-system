import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/router/app_routes.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/widgets/cards/app_card.dart';
import 'package:blood_donation_app/core/widgets/layouts/app_scaffold.dart';
import 'package:blood_donation_app/core/widgets/loaders/app_loading_indicator.dart';
import 'package:blood_donation_app/modules/auth/domain/repositories/auth_repository.dart';
import 'package:blood_donation_app/modules/donation/domain/entities/donation_entity.dart';
import 'package:blood_donation_app/modules/donation/domain/repositories/donation_repository.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class DonationHistoryScreen extends StatefulWidget {
  const DonationHistoryScreen({super.key});

  @override
  State<DonationHistoryScreen> createState() => _DonationHistoryScreenState();
}

class _DonationHistoryScreenState extends State<DonationHistoryScreen> {
  Future<List<DonationEntity>> _loadDonations() async {
    final user = await getIt<AuthRepository>().getCurrentUser();
    if (user == null) return [];
    return getIt<DonationRepository>().getDonationHistory(user.id);
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Donations',
      showBackButton: false,
      body: FutureBuilder<List<DonationEntity>>(
        future: _loadDonations(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: AppLoadingIndicator(size: 28));
          }
          if (snapshot.hasError) {
            return Center(child: Text(snapshot.error.toString()));
          }

          final donations = snapshot.data ?? const [];
          if (donations.isEmpty) {
            return const Center(child: Text('No donations found.'));
          }

          return RefreshIndicator(
            onRefresh: () async => setState(() {}),
            child: ListView.separated(
              padding: const EdgeInsets.all(AppDimensions.screenPaddingH),
              itemCount: donations.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AppDimensions.sm),
              itemBuilder: (context, index) {
                final donation = donations[index];
                return AppCard(
                  onTap: () => context.go(
                    AppRoutes.donationDetail.replaceFirst(':id', donation.id),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        donation.bloodBankName,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 4),
                      Text('Blood type: ${donation.bloodType}'),
                      Text('Status: ${donation.status.name}'),
                      Text(
                        'Created: ${donation.scheduledDate.toLocal().toString().split('.').first}',
                      ),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
