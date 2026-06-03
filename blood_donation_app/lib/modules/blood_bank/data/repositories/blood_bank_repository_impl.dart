import 'package:blood_donation_app/modules/blood_bank/data/datasources/blood_bank_remote_datasource.dart';
import 'package:blood_donation_app/modules/blood_bank/domain/entities/blood_bank_entity.dart';
import 'package:blood_donation_app/modules/blood_bank/domain/repositories/blood_bank_repository.dart';

class BloodBankRepositoryImpl implements BloodBankRepository {
  BloodBankRepositoryImpl(this._remote);
  final BloodBankRemoteDataSource _remote;

  @override
  Future<List<BloodBankEntity>> getNearbyBloodBanks({
    required double latitude,
    required double longitude,
    double radiusKm = 20,
  }) => _remote.getNearbyBloodBanks(
    latitude: latitude,
    longitude: longitude,
    radiusKm: radiusKm,
  );

  @override
  Future<BloodBankEntity> getBloodBankById(String id) =>
      _remote.getBloodBankById(id);

  @override
  Future<Map<String, int>> getBloodInventory(String bloodBankId) =>
      _remote.getBloodInventory(bloodBankId);
}
