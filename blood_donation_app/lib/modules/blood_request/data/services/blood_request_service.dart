import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/modules/blood_bank/data/models/blood_bank_model.dart';
import 'package:blood_donation_app/modules/blood_request/data/models/blood_request_model.dart';

class BloodRequestService {
  BloodRequestService(this._apiClient);
  final ApiClient _apiClient;

  Future<List<BloodRequestModel>> getRequests() async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/blood-requests/',
    );
    final data = (response.data?['results'] as List?) ?? const [];
    return data
        .map((item) => BloodRequestModel.fromJson(item as Map<String, dynamic>))
        .toList(growable: false);
  }

  Future<List<BloodBankModel>> getHospitals() async {
    final response = await _apiClient.get<Map<String, dynamic>>('/hospitals/');
    final data = (response.data?['results'] as List?) ?? const [];
    return data
        .map((item) => BloodBankModel.fromJson(item as Map<String, dynamic>))
        .toList(growable: false);
  }

  Future<void> createRequest({
    required String hospitalId,
    required String bloodGroup,
    required int units,
    required String requestType,
  }) async {
    await _apiClient.post(
      '/blood-requests/',
      data: {
        'hospital': int.parse(hospitalId),
        'blood_group': bloodGroup,
        'units_needed': units,
        'request_type': requestType,
        'auto_match_enabled': true,
      },
    );
  }
}
