import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/modules/donation/data/models/donation_model.dart';

abstract class DonationRemoteDataSource {
  Future<List<DonationModel>> getDonationHistory();
  Future<DonationModel> getDonationById(String id);
  Future<DonationModel> scheduleDonation({
    required String donorId,
    required String bloodBankId,
    required String bloodType,
    required DateTime scheduledDate,
    String? notes,
  });
  Future<DonationModel> cancelDonation(String id);
}

class DonationRemoteDataSourceImpl implements DonationRemoteDataSource {
  DonationRemoteDataSourceImpl(this._apiClient);
  final ApiClient _apiClient;

  @override
  Future<List<DonationModel>> getDonationHistory() async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/donations/',
    );
    final data = (response.data!['results'] as List?) ?? const [];
    return data
        .map((e) => DonationModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  @override
  Future<DonationModel> getDonationById(String id) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/donations/$id/',
    );
    return DonationModel.fromJson(response.data!);
  }

  @override
  Future<DonationModel> scheduleDonation({
    required String donorId,
    required String bloodBankId,
    required String bloodType,
    required DateTime scheduledDate,
    String? notes,
  }) async {
    throw UnimplementedError(
      'Direct scheduling is not exposed by current backend API.',
    );
  }

  @override
  Future<DonationModel> cancelDonation(String id) async {
    final response = await _apiClient.patch<Map<String, dynamic>>(
      '/donations/$id/status/',
      data: {'status': 'cancelled'},
    );
    return DonationModel.fromJson(response.data!);
  }
}
