import 'package:blood_donation_app/modules/blood_bank/domain/entities/blood_bank_entity.dart';

abstract class BloodBankRepository {
  Future<List<BloodBankEntity>> getNearbyBloodBanks({
    required double latitude,
    required double longitude,
    double radiusKm = 20,
  });
  Future<BloodBankEntity> getBloodBankById(String id);
  Future<Map<String, int>> getBloodInventory(String bloodBankId);
}
