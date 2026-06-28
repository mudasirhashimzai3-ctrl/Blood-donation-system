import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/router/app_routes.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/widgets/cards/app_card.dart';
import 'package:blood_donation_app/core/widgets/layouts/app_scaffold.dart';
import 'package:blood_donation_app/core/widgets/loaders/app_loading_indicator.dart';
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
  late Future<List<DonationEntity>> _future;

  @override
  void initState() {
    super.initState();
    _future = _loadDonations();
  }

  Future<List<DonationEntity>> _loadDonations() async {
    return getIt<DonationRepository>().getDonationHistory();
  }

  Future<void> _refresh() async {
    setState(() {
      _future = _loadDonations();
    });
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Donations',
      showBackButton: false,
      body: FutureBuilder<List<DonationEntity>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: AppLoadingIndicator(size: 28));
          }
          if (snapshot.hasError) {
            return DonationHistoryErrorState(
              message: snapshot.error.toString(),
              onRetry: _refresh,
            );
          }

          final donations = snapshot.data ?? const [];
          if (donations.isEmpty) {
            return const Center(child: Text('No donations found.'));
          }

          return RefreshIndicator(
            onRefresh: _refresh,
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

class DonationHistoryErrorState extends StatelessWidget {
  const DonationHistoryErrorState({
    super.key,
    required this.message,
    required this.onRetry,
  });

  final String message;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppDimensions.screenPaddingH),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, size: 40),
            const SizedBox(height: AppDimensions.sm),
            Text(
              'Could not load donation history',
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: AppDimensions.md),
            FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
