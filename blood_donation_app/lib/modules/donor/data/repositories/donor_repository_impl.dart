import 'package:blood_donation_app/modules/donor/data/datasources/donor_remote_datasource.dart';
import 'package:blood_donation_app/modules/donor/domain/entities/donor_entity.dart';
import 'package:blood_donation_app/modules/donor/domain/repositories/donor_repository.dart';

class DonorRepositoryImpl implements DonorRepository {
  DonorRepositoryImpl(this._remote);
  final DonorRemoteDataSource _remote;

  @override
  Future<List<DonorEntity>> getNearbyDonors({
    required String bloodType,
    required double latitude,
    required double longitude,
    double radiusKm = 10,
  }) => _remote.getNearbyDonors(
    bloodType: bloodType,
    latitude: latitude,
    longitude: longitude,
    radiusKm: radiusKm,
  );

  @override
  Future<DonorEntity> getDonorById(String id) => _remote.getDonorById(id);

  @override
  Future<DonorEntity> updateAvailability(String id, bool isAvailable) =>
      _remote.updateAvailability(id, isAvailable);

  @override
  Future<DonorEntity> updateProfile({
    required String id,
    String? phone,
    String? city,
    double? latitude,
    double? longitude,
  }) {
    return _remote.getDonorById(id);
  }
}
