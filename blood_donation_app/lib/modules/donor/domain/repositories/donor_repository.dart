import 'package:blood_donation_app/modules/donor/domain/entities/donor_entity.dart';

abstract class DonorRepository {
  Future<List<DonorEntity>> getNearbyDonors({
    required String bloodType,
    required double latitude,
    required double longitude,
    double radiusKm = 10,
  });

  Future<DonorEntity> getDonorById(String id);
  Future<DonorEntity> updateAvailability(String id, bool isAvailable);
  Future<DonorEntity> updateProfile({
    required String id,
    String? phone,
    String? city,
    double? latitude,
    double? longitude,
  });
}
