import 'package:blood_donation_app/models/app_models.dart';

class BloodRequestModel {
  const BloodRequestModel({
    required this.id,
    required this.bloodGroup,
    required this.unitsNeeded,
    required this.requestType,
    required this.status,
    this.hospitalName,
    this.createdAt,
  });

  factory BloodRequestModel.fromJson(Map<String, dynamic> json) {
    return BloodRequestModel(
      id: json['id'].toString(),
      bloodGroup: (json['blood_group'] ?? 'O+') as String,
      unitsNeeded: parseBloodRequestUnits(json['units_needed'], fallback: 1),
      requestType: (json['request_type'] ?? 'normal') as String,
      status: (json['status'] ?? 'pending') as String,
      hospitalName: json['hospital_name'] as String?,
      createdAt: json['created_at'] as String?,
    );
  }
  final String id;
  final String bloodGroup;
  final double unitsNeeded;
  final String requestType;
  final String status;
  final String? hospitalName;
  final String? createdAt;
}
