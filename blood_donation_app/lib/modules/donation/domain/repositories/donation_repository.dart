import 'package:blood_donation_app/modules/donation/domain/entities/donation_entity.dart';

abstract class DonationRepository {
  Future<List<DonationEntity>> getDonationHistory(String donorId);
  Future<DonationEntity> getDonationById(String id);
  Future<DonationEntity> scheduleDonation({
    required String donorId,
    required String bloodBankId,
    required String bloodType,
    required DateTime scheduledDate,
    String? notes,
  });
  Future<DonationEntity> cancelDonation(String id);
}
