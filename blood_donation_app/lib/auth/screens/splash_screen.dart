import 'package:blood_donation_app/auth/widgets/auth_entry_primitives.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/services/app_services.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/app_session.dart';
import 'package:flutter/material.dart';

class AppSplashScreen extends StatefulWidget {
  const AppSplashScreen({super.key, this.loadUser});

  final Future<AppUser?> Function()? loadUser;

  @override
  State<AppSplashScreen> createState() => _AppSplashScreenState();
}

class _AppSplashScreenState extends State<AppSplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fade;
  late final Animation<double> _badgeScale;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    );
    _fade = CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic);
    _badgeScale = Tween<double>(begin: 0.9, end: 1).animate(_fade);
    _controller.forward();
    _bootstrap();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _bootstrap() async {
    await Future.delayed(const Duration(milliseconds: 900));
    if (!mounted) return;

    if (!AppSession.isOnboardingDone()) {
      Navigator.pushReplacementNamed(context, AppRoutes.onboarding);
      return;
    }

    final user = widget.loadUser != null
        ? await widget.loadUser!.call()
        : await AuthService(getIt()).getCurrentUser();
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
    return AuthEntryScaffold(
      maxContentWidth: 620,
      child: FadeTransition(
        opacity: _fade,
        child: Column(
          children: [
            const Spacer(),
            ScaleTransition(
              scale: _badgeScale,
              child: Container(
                width: 126,
                height: 126,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: AuthEntryPrimitives.splashBadgeGradient,
                  boxShadow: [
                    BoxShadow(
                      color: Color(0x3FD93657),
                      blurRadius: 28,
                      offset: Offset(0, 18),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.bloodtype_rounded,
                  color: Colors.white,
                  size: 56,
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Blood Bridge',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 34,
                fontWeight: FontWeight.w800,
                color: AuthEntryPrimitives.ink,
                letterSpacing: 0.2,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Fast emergency connection between donors and recipients.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 15,
                color: AuthEntryPrimitives.mutedInk,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 32),
            const SizedBox(
              width: 28,
              height: 28,
              child: CircularProgressIndicator(strokeWidth: 2.8),
            ),
            const Spacer(),
          ],
        ),
      ),
    );
  }
}
