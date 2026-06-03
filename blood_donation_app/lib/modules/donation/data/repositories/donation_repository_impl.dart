import 'package:blood_donation_app/modules/donation/data/datasources/donation_remote_datasource.dart';
import 'package:blood_donation_app/modules/donation/domain/entities/donation_entity.dart';
import 'package:blood_donation_app/modules/donation/domain/repositories/donation_repository.dart';

class DonationRepositoryImpl implements DonationRepository {
  DonationRepositoryImpl(this._remote);
  final DonationRemoteDataSource _remote;

  @override
  Future<List<DonationEntity>> getDonationHistory(String donorId) =>
      _remote.getDonationHistory(donorId);

  @override
  Future<DonationEntity> getDonationById(String id) =>
      _remote.getDonationById(id);

  @override
  Future<DonationEntity> scheduleDonation({
    required String donorId,
    required String bloodBankId,
    required String bloodType,
    required DateTime scheduledDate,
    String? notes,
  }) => _remote.scheduleDonation(
    donorId: donorId,
    bloodBankId: bloodBankId,
    bloodType: bloodType,
    scheduledDate: scheduledDate,
    notes: notes,
  );

  @override
  Future<DonationEntity> cancelDonation(String id) =>
      _remote.cancelDonation(id);
}
