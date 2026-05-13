import 'package:equatable/equatable.dart';
import 'package:blood_donation_app/core/utils/use_case.dart';
import 'package:blood_donation_app/modules/donor/domain/entities/donor_entity.dart';
import 'package:blood_donation_app/modules/donor/domain/repositories/donor_repository.dart';

class GetNearbyDonorsUseCase
    extends UseCase<List<DonorEntity>, GetNearbyDonorsParams> {
  GetNearbyDonorsUseCase(this._repository);
  final DonorRepository _repository;

  @override
  Future<List<DonorEntity>> call(GetNearbyDonorsParams params) {
    return _repository.getNearbyDonors(
      bloodType: params.bloodType,
      latitude: params.latitude,
      longitude: params.longitude,
      radiusKm: params.radiusKm,
    );
  }
}

class GetNearbyDonorsParams extends Equatable {

  const GetNearbyDonorsParams({
    required this.bloodType,
    required this.latitude,
    required this.longitude,
    this.radiusKm = 10,
  });
  final String bloodType;
  final double latitude;
  final double longitude;
  final double radiusKm;

  @override
  List<Object?> get props => [bloodType, latitude, longitude, radiusKm];
}
