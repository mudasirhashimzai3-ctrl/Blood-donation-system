import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/widgets/cards/app_card.dart';
import 'package:blood_donation_app/core/widgets/layouts/app_scaffold.dart';
import 'package:blood_donation_app/core/widgets/loaders/app_loading_indicator.dart';
import 'package:blood_donation_app/modules/blood_bank/domain/entities/blood_bank_entity.dart';
import 'package:blood_donation_app/modules/blood_bank/domain/repositories/blood_bank_repository.dart';
import 'package:flutter/material.dart';

class BloodBankListScreen extends StatefulWidget {
  const BloodBankListScreen({super.key});

  @override
  State<BloodBankListScreen> createState() => _BloodBankListScreenState();
}

class _BloodBankListScreenState extends State<BloodBankListScreen> {
  late final Future<List<BloodBankEntity>> _future;

  @override
  void initState() {
    super.initState();
    _future = getIt<BloodBankRepository>().getNearbyBloodBanks(
      latitude: 0,
      longitude: 0,
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Hospitals',
      showBackButton: false,
      body: FutureBuilder<List<BloodBankEntity>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: AppLoadingIndicator(size: 28));
          }

          if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(AppDimensions.lg),
                child: Text(snapshot.error.toString()),
              ),
            );
          }

          final hospitals = snapshot.data ?? const [];
          if (hospitals.isEmpty) {
            return const Center(child: Text('No hospitals found.'));
          }

          return ListView.separated(
            padding: const EdgeInsets.all(AppDimensions.screenPaddingH),
            itemCount: hospitals.length,
            separatorBuilder: (_, __) =>
                const SizedBox(height: AppDimensions.sm),
            itemBuilder: (context, index) {
              final item = hospitals[index];
              return AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 4),
                    Text(item.city.isEmpty ? 'City not set' : item.city),
                    if (item.phone.isNotEmpty) Text(item.phone),
                    if (item.address.isNotEmpty) Text(item.address),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
