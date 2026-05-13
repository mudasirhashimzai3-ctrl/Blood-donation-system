import 'package:equatable/equatable.dart';

enum DonationStatus { scheduled, completed, cancelled, pendingReview }

class DonationEntity extends Equatable {

  const DonationEntity({
    required this.id,
    required this.donorId,
    required this.bloodBankId,
    required this.bloodBankName,
    required this.bloodType,
    required this.status,
    required this.scheduledDate,
    this.completedDate,
    this.notes,
    this.amountMl,
  });
  final String id;
  final String donorId;
  final String bloodBankId;
  final String bloodBankName;
  final String bloodType;
  final DonationStatus status;
  final DateTime scheduledDate;
  final DateTime? completedDate;
  final String? notes;
  final double? amountMl;

  bool get isCompleted => status == DonationStatus.completed;

  @override
  List<Object?> get props => [
    id,
    donorId,
    bloodBankId,
    bloodBankName,
    bloodType,
    status,
    scheduledDate,
    completedDate,
    notes,
    amountMl,
  ];
}
