import 'package:blood_donation_app/core/network/api_client.dart';
import 'package:blood_donation_app/modules/donation/data/datasources/donation_remote_datasource.dart';
import 'package:blood_donation_app/modules/donation/domain/entities/donation_entity.dart';
import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';

class FakeApiClient implements ApiClient {
  String? lastPath;
  Map<String, dynamic>? lastQueryParameters;

  @override
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    lastPath = path;
    lastQueryParameters = queryParameters;
    return Response<T>(
      requestOptions: RequestOptions(path: path),
      data: <String, dynamic>{
        'results': [
          {
            'id': 9,
            'donor': 5,
            'request': 12,
            'hospital_name': 'Central Hospital',
            'request_blood_group': 'A+',
            'status': 'accepted',
            'created_at': '2026-06-24T10:00:00Z',
            'updated_at': '2026-06-24T11:00:00Z',
          },
        ],
      } as T,
    );
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  test(
      'getDonationHistory fetches authenticated donor history without donor query',
      () async {
    final apiClient = FakeApiClient();
    final dataSource = DonationRemoteDataSourceImpl(apiClient);

    final donations = await dataSource.getDonationHistory();

    expect(apiClient.lastPath, '/donations/');
    expect(apiClient.lastQueryParameters, isNull);
    expect(donations, hasLength(1));
    expect(donations.single.id, '9');
    expect(donations.single.bloodBankName, 'Central Hospital');
    expect(donations.single.status, DonationStatus.accepted);
  });
}
