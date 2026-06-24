import 'package:blood_donation_app/modules/donation/domain/entities/donation_entity.dart';

class DonationModel extends DonationEntity {
  factory DonationModel.fromJson(Map<String, dynamic> json) {
    DateTime parseDate(dynamic value) {
      return DateTime.tryParse(value?.toString() ?? '') ?? DateTime.now();
    }

    final status = json['status']?.toString() ?? 'scheduled';

    return DonationModel(
      id: json['id'].toString(),
      donorId: json['donor']?.toString() ?? '',
      bloodBankId: json['request']?.toString() ?? '',
      bloodBankName: json['hospital_name']?.toString() ?? 'Hospital',
      bloodType: json['request_blood_group']?.toString() ?? 'O+',
      status: _statusFromString(status),
      scheduledDate: parseDate(json['created_at']),
      completedDate: json['updated_at'] != null && status == 'completed'
          ? parseDate(json['updated_at'])
          : null,
      notes: json['notes']?.toString(),
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
      case 'pending':
        return DonationStatus.pending;
      case 'accepted':
        return DonationStatus.accepted;
      case 'en_route':
        return DonationStatus.enRoute;
      case 'arrived':
        return DonationStatus.arrived;
      case 'completed':
        return DonationStatus.completed;
      case 'cancelled':
        return DonationStatus.cancelled;
      case 'declined':
        return DonationStatus.declined;
      case 'expired':
        return DonationStatus.expired;
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
