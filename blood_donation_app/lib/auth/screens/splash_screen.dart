import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/services/app_services.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/app_session.dart';
import 'package:flutter/material.dart';

class AppSplashScreen extends StatefulWidget {
  const AppSplashScreen({super.key});

  @override
  State<AppSplashScreen> createState() => _AppSplashScreenState();
}

class _AppSplashScreenState extends State<AppSplashScreen> {
  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    await Future.delayed(const Duration(milliseconds: 900));
    if (!mounted) return;

    if (!AppSession.isOnboardingDone()) {
      Navigator.pushReplacementNamed(context, AppRoutes.onboarding);
      return;
    }

    final auth = AuthService(getIt());
    final user = await auth.getCurrentUser();
    if (!mounted) return;
    if (user == null) {
      Navigator.pushReplacementNamed(context, AppRoutes.roleSelection);
      return;
    }
    _goDashboard(user.role);
  }

  void _goDashboard(AppRole role) {
    if (role == AppRole.recipient) {
      Navigator.pushReplacementNamed(context, AppRoutes.recipientDashboard);
      return;
    }
    Navigator.pushReplacementNamed(context, AppRoutes.donorDashboard);
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.bloodtype, color: Colors.red, size: 64),
            SizedBox(height: 12),
            Text('Fast Emergency Blood Connection'),
          ],
        ),
      ),
    );
  }
}
