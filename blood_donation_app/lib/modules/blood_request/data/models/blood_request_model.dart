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
      unitsNeeded: (json['units_needed'] as num?)?.toInt() ?? 1,
      requestType: (json['request_type'] ?? 'normal') as String,
      status: (json['status'] ?? 'pending') as String,
      hospitalName: json['hospital_name'] as String?,
      createdAt: json['created_at'] as String?,
    );
  }
  final String id;
  final String bloodGroup;
  final int unitsNeeded;
  final String requestType;
  final String status;
  final String? hospitalName;
  final String? createdAt;
}
