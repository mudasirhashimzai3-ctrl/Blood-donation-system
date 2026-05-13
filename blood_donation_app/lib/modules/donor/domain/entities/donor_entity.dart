import 'package:equatable/equatable.dart';

class DonorEntity extends Equatable {

  const DonorEntity({
    required this.id,
    required this.name,
    required this.bloodType,
    this.phone,
    this.email,
    this.avatarUrl,
    this.latitude,
    this.longitude,
    this.city,
    this.isAvailable = true,
    this.lastDonationDate,
    this.totalDonations = 0,
  });
  final String id;
  final String name;
  final String bloodType;
  final String? phone;
  final String? email;
  final String? avatarUrl;
  final double? latitude;
  final double? longitude;
  final String? city;
  final bool isAvailable;
  final DateTime? lastDonationDate;
  final int totalDonations;

  @override
  List<Object?> get props => [
    id,
    name,
    bloodType,
    phone,
    email,
    avatarUrl,
    latitude,
    longitude,
    city,
    isAvailable,
    lastDonationDate,
    totalDonations,
  ];
}
