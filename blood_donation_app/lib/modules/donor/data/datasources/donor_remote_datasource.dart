import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/modules/donor/data/models/donor_model.dart';

abstract class DonorRemoteDataSource {
  Future<List<DonorModel>> getNearbyDonors({
    required String bloodType,
    required double latitude,
    required double longitude,
    double radiusKm = 10,
  });
  Future<DonorModel> getDonorById(String id);
  Future<DonorModel> updateAvailability(String id, bool isAvailable);
}

class DonorRemoteDataSourceImpl implements DonorRemoteDataSource {
  DonorRemoteDataSourceImpl(this._apiClient);
  final ApiClient _apiClient;

  @override
  Future<List<DonorModel>> getNearbyDonors({
    required String bloodType,
    required double latitude,
    required double longitude,
    double radiusKm = 10,
  }) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/donors/',
      queryParameters: {'blood_group': bloodType},
    );
    final data = (response.data!['results'] as List?) ?? const [];
    return data
        .map((e) => DonorModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<DonorModel> getDonorById(String id) async {
    final response = await _apiClient.get<Map<String, dynamic>>('/donors/$id/');
    return DonorModel.fromJson(response.data!);
  }

  @override
  Future<DonorModel> updateAvailability(String id, bool isAvailable) async {
    final response = await _apiClient.patch<Map<String, dynamic>>(
      '/donors/$id/',
      data: {'status': isAvailable ? 'active' : 'inactive'},
    );
    return DonorModel.fromJson(response.data!);
  }
}
