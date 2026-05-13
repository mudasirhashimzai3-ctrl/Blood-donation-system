import 'package:equatable/equatable.dart';

class BloodBankEntity extends Equatable {

  const BloodBankEntity({
    required this.id,
    required this.name,
    required this.address,
    required this.city,
    required this.phone,
    this.email,
    this.website,
    required this.latitude,
    required this.longitude,
    required this.bloodInventory,
    this.openingHours,
    this.isOpen = true,
    this.distanceKm,
  });
  final String id;
  final String name;
  final String address;
  final String city;
  final String phone;
  final String? email;
  final String? website;
  final double latitude;
  final double longitude;
  final Map<String, int> bloodInventory; // bloodType -> units available
  final String? openingHours;
  final bool isOpen;
  final double? distanceKm;

  @override
  List<Object?> get props => [
    id,
    name,
    address,
    city,
    phone,
    latitude,
    longitude,
  ];
}
