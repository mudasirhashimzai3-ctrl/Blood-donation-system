import 'package:blood_donation_app/core/constants/app_constants.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/widgets/buttons/app_button.dart';
import 'package:blood_donation_app/core/widgets/cards/app_card.dart';
import 'package:blood_donation_app/core/widgets/fields/app_dropdown_field.dart';
import 'package:blood_donation_app/core/widgets/fields/app_text_field.dart';
import 'package:blood_donation_app/core/widgets/layouts/app_scaffold.dart';
import 'package:blood_donation_app/core/widgets/loaders/app_loading_indicator.dart';
import 'package:blood_donation_app/modules/blood_bank/data/models/blood_bank_model.dart';
import 'package:blood_donation_app/modules/blood_request/data/models/blood_request_model.dart';
import 'package:blood_donation_app/modules/blood_request/data/services/blood_request_service.dart';
import 'package:flutter/material.dart';

class BloodRequestScreen extends StatefulWidget {
  const BloodRequestScreen({super.key});

  @override
  State<BloodRequestScreen> createState() => _BloodRequestScreenState();
}

class _BloodRequestScreenState extends State<BloodRequestScreen> {
  late final BloodRequestService _service;
  late Future<List<BloodRequestModel>> _future;
  List<BloodBankModel> _hospitals = const [];
  String? _selectedHospitalId;
  String? _selectedBloodGroup;
  String _requestType = 'normal';
  final TextEditingController _unitsController = TextEditingController(
    text: '1',
  );
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _service = BloodRequestService(getIt());
    _future = _service.getRequests();
    _loadHospitals();
  }

  @override
  void dispose() {
    _unitsController.dispose();
    super.dispose();
  }

  Future<void> _loadHospitals() async {
    final hospitals = await _service.getHospitals();
    if (!mounted) return;
    setState(() {
      _hospitals = hospitals;
      if (_hospitals.isNotEmpty) {
        _selectedHospitalId = _hospitals.first.id;
      }
    });
  }

  Future<void> _refresh() async {
    setState(() {
      _future = _service.getRequests();
    });
  }

  Future<void> _createRequest() async {
    if (_selectedHospitalId == null || _selectedBloodGroup == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select hospital and blood group')),
      );
      return;
    }

    final units = int.tryParse(_unitsController.text.trim());
    if (units == null || units < 1) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Units must be at least 1')));
      return;
    }

    setState(() => _submitting = true);
    try {
      await _service.createRequest(
        hospitalId: _selectedHospitalId!,
        bloodGroup: _selectedBloodGroup!,
        units: units,
        requestType: _requestType,
      );
      if (!mounted) return;
      _unitsController.text = '1';
      await _refresh();
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Blood request created')));
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Blood Requests',
      showBackButton: false,
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: ListView(
          padding: const EdgeInsets.all(AppDimensions.screenPaddingH),
          children: [
            AppCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Create Request',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: AppDimensions.sm),
                  AppDropdownField<String>(
                    label: 'Hospital',
                    value: _selectedHospitalId,
                    items: _hospitals
                        .map(
                          (h) => DropdownMenuItem<String>(
                            value: h.id,
                            child: Text(h.name),
                          ),
                        )
                        .toList(),
                    onChanged: (value) => setState(() {
                      _selectedHospitalId = value;
                    }),
                  ),
                  const SizedBox(height: AppDimensions.sm),
                  AppDropdownField<String>(
                    label: 'Blood Group',
                    value: _selectedBloodGroup,
                    items: AppConstants.bloodTypes
                        .map(
                          (type) => DropdownMenuItem<String>(
                            value: type,
                            child: Text(type),
                          ),
                        )
                        .toList(),
                    onChanged: (value) => setState(() {
                      _selectedBloodGroup = value;
                    }),
                  ),
                  const SizedBox(height: AppDimensions.sm),
                  AppDropdownField<String>(
                    label: 'Request Type',
                    value: _requestType,
                    items: const [
                      DropdownMenuItem(value: 'normal', child: Text('Normal')),
                      DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
                      DropdownMenuItem(
                        value: 'critical',
                        child: Text('Critical'),
                      ),
                    ],
                    onChanged: (value) {
                      if (value != null) {
                        setState(() => _requestType = value);
                      }
                    },
                  ),
                  const SizedBox(height: AppDimensions.sm),
                  AppTextField(
                    controller: _unitsController,
                    label: 'Units Needed',
                    keyboardType: TextInputType.number,
                  ),
                  const SizedBox(height: AppDimensions.sm),
                  AppButton(
                    label: 'Create',
                    isLoading: _submitting,
                    onPressed: _createRequest,
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppDimensions.lg),
            Text(
              'Recent Requests',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: AppDimensions.sm),
            FutureBuilder<List<BloodRequestModel>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: AppLoadingIndicator());
                }
                if (snapshot.hasError) {
                  return Text(snapshot.error.toString());
                }
                final items = snapshot.data ?? const [];
                if (items.isEmpty) {
                  return const Text('No blood requests found.');
                }

                return Column(
                  children: items
                      .map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(
                            bottom: AppDimensions.sm,
                          ),
                          child: AppCard(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Hospital: ${item.hospitalName ?? 'N/A'}'),
                                Text('Blood: ${item.bloodGroup}'),
                                Text('Units: ${item.unitsNeeded}'),
                                Text('Type: ${item.requestType}'),
                                Text('Status: ${item.status}'),
                              ],
                            ),
                          ),
                        ),
                      )
                      .toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
