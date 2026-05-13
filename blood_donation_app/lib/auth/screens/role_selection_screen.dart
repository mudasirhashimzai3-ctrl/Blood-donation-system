import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/app_session.dart';
import 'package:blood_donation_app/shared/ui/app_style.dart';
import 'package:blood_donation_app/shared/widgets/gradient_scaffold.dart';
import 'package:blood_donation_app/shared/widgets/role_choice_card.dart';
import 'package:flutter/material.dart';

class RoleSelectionScreen extends StatefulWidget {
  const RoleSelectionScreen({super.key});

  @override
  State<RoleSelectionScreen> createState() => _RoleSelectionScreenState();
}

class _RoleSelectionScreenState extends State<RoleSelectionScreen> {
  AppRole _role = AppRole.donor;

  @override
  void initState() {
    super.initState();
    _role = AppSession.getSelectedRole();
  }

  @override
  Widget build(BuildContext context) {
    return GradientScaffold(
      title: 'Select Role',
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            RoleChoiceCard(
              title: 'Donor',
              description: 'Receive emergency requests and donate quickly.',
              icon: Icons.bloodtype,
              selected: _role == AppRole.donor,
              onTap: () => setState(() => _role = AppRole.donor),
            ),
            const SizedBox(height: 12),
            RoleChoiceCard(
              title: 'Recipient',
              description: 'Create blood requests and track donor responses.',
              icon: Icons.emergency,
              selected: _role == AppRole.recipient,
              onTap: () => setState(() => _role = AppRole.recipient),
            ),
            const Spacer(),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: AppStyle.redPrimary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () async {
                  await AppSession.setSelectedRole(_role);
                  if (!context.mounted) return;
                  Navigator.pushReplacementNamed(context, AppRoutes.login);
                },
                child: const Text('Continue'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
