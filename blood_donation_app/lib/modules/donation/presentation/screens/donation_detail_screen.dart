import 'package:flutter/material.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/widgets/buttons/app_button.dart';
import 'package:blood_donation_app/core/widgets/layouts/app_scaffold.dart';
import 'package:blood_donation_app/core/widgets/loaders/app_loading_indicator.dart';
import 'package:blood_donation_app/modules/donation/domain/entities/donation_entity.dart';
import 'package:blood_donation_app/modules/donation/domain/repositories/donation_repository.dart';

class DonationDetailScreen extends StatefulWidget {
  const DonationDetailScreen({super.key, required this.donationId});
  final String donationId;

  @override
  State<DonationDetailScreen> createState() => _DonationDetailScreenState();
}

class _DonationDetailScreenState extends State<DonationDetailScreen> {
  late Future<DonationEntity> _future;
  bool _isCancelling = false;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<DonationEntity> _load() {
    return getIt<DonationRepository>().getDonationById(widget.donationId);
  }

  Future<void> _cancelDonation() async {
    setState(() => _isCancelling = true);
    try {
      await getIt<DonationRepository>().cancelDonation(widget.donationId);
      if (!mounted) return;
      setState(() => _future = _load());
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) {
        setState(() => _isCancelling = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Donation Details',
      body: FutureBuilder<DonationEntity>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: AppLoadingIndicator(size: 28));
          }
          if (snapshot.hasError) {
            return Center(child: Text(snapshot.error.toString()));
          }

          final donation = snapshot.data;
          if (donation == null) {
            return const Center(child: Text('Donation not found.'));
          }

          return Padding(
            padding: const EdgeInsets.all(AppDimensions.screenPaddingH),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  donation.bloodBankName,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text('Blood type: ${donation.bloodType}'),
                Text('Status: ${donation.status.name}'),
                Text('Request ID: ${donation.bloodBankId}'),
                if (donation.notes?.isNotEmpty == true)
                  Text('Notes: ${donation.notes}'),
                const SizedBox(height: AppDimensions.xl),
                if (donation.status != DonationStatus.cancelled &&
                    donation.status != DonationStatus.completed)
                  AppButton(
                    label: 'Cancel Donation',
                    variant: AppButtonVariant.danger,
                    isLoading: _isCancelling,
                    onPressed: _cancelDonation,
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
