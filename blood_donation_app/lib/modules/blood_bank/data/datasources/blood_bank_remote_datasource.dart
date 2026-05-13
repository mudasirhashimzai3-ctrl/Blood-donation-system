import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/modules/blood_bank/data/models/blood_bank_model.dart';

abstract class BloodBankRemoteDataSource {
  Future<List<BloodBankModel>> getNearbyBloodBanks({
    required double latitude,
    required double longitude,
    double radiusKm = 20,
  });
  Future<BloodBankModel> getBloodBankById(String id);
  Future<Map<String, int>> getBloodInventory(String bloodBankId);
}

class BloodBankRemoteDataSourceImpl implements BloodBankRemoteDataSource {
  BloodBankRemoteDataSourceImpl(this._apiClient);
  final ApiClient _apiClient;

  @override
  Future<List<BloodBankModel>> getNearbyBloodBanks({
    required double latitude,
    required double longitude,
    double radiusKm = 20,
  }) async {
    final response = await _apiClient.get<Map<String, dynamic>>('/hospitals/');
    final data = (response.data!['results'] as List?) ?? const [];
    return data
        .map((e) => BloodBankModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<BloodBankModel> getBloodBankById(String id) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/hospitals/$id/',
    );
    return BloodBankModel.fromJson(response.data!);
  }

  @override
  Future<Map<String, int>> getBloodInventory(String bloodBankId) async {
    return {};
  }
}
