import 'package:blood_donation_app/modules/donation/domain/entities/donation_entity.dart';

class DonationModel extends DonationEntity {

  factory DonationModel.fromJson(Map<String, dynamic> json) {
    return DonationModel(
      id: json['id'].toString(),
      donorId: json['donor']?.toString() ?? '',
      bloodBankId: json['request']?.toString() ?? '',
      bloodBankName: (json['hospital_name'] ?? 'Hospital') as String,
      bloodType: (json['request_blood_group'] ?? 'O+') as String,
      status: _statusFromString(json['status'] as String? ?? 'scheduled'),
      scheduledDate: DateTime.parse((json['created_at']) as String),
      completedDate: json['updated_at'] != null && json['status'] == 'completed'
          ? DateTime.parse(json['updated_at'] as String)
          : null,
      notes: json['notes'] as String?,
      amountMl: null,
    );
  }
  const DonationModel({
    required super.id,
    required super.donorId,
    required super.bloodBankId,
    required super.bloodBankName,
    required super.bloodType,
    required super.status,
    required super.scheduledDate,
    super.completedDate,
    super.notes,
    super.amountMl,
  });

  static DonationStatus _statusFromString(String s) {
    switch (s) {
      case 'completed':
        return DonationStatus.completed;
      case 'cancelled':
        return DonationStatus.cancelled;
      case 'accepted':
      case 'pending':
      case 'en_route':
      case 'arrived':
      case 'declined':
      case 'expired':
      default:
        return DonationStatus.scheduled;
    }
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'donor_id': donorId,
    'blood_bank_id': bloodBankId,
    'blood_bank_name': bloodBankName,
    'blood_type': bloodType,
    'status': status.name,
    'scheduled_date': scheduledDate.toIso8601String(),
    'completed_date': completedDate?.toIso8601String(),
    'notes': notes,
    'amount_ml': amountMl,
  };
}
