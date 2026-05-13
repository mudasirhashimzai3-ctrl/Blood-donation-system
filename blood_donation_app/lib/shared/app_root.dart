import 'package:blood_donation_app/auth/screens/login_screen.dart';
import 'package:blood_donation_app/auth/screens/onboarding_screen.dart';
import 'package:blood_donation_app/auth/screens/role_selection_screen.dart';
import 'package:blood_donation_app/auth/screens/signup_screen.dart';
import 'package:blood_donation_app/auth/screens/splash_screen.dart';
import 'package:blood_donation_app/donor/screens/donor_shell_screen.dart';
import 'package:blood_donation_app/recipient/screens/recipient_shell_screen.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/notifications_screen.dart';
import 'package:blood_donation_app/shared/ui/app_style.dart';
import 'package:flutter/material.dart';

class AppRoot extends StatelessWidget {
  const AppRoot({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Blood Donation',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppStyle.redPrimary,
          primary: AppStyle.redPrimary,
          secondary: AppStyle.redDark,
          surface: Colors.white,
        ),
        scaffoldBackgroundColor: Colors.white,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: AppStyle.textPrimary,
          elevation: 0,
        ),
      ),
      initialRoute: AppRoutes.splash,
      routes: {
        AppRoutes.splash: (_) => const AppSplashScreen(),
        AppRoutes.onboarding: (_) => const OnboardingScreen(),
        AppRoutes.roleSelection: (_) => const RoleSelectionScreen(),
        AppRoutes.login: (_) => const AppLoginScreen(),
        AppRoutes.signup: (_) => const AppSignupScreen(),
        AppRoutes.donorDashboard: (_) => const DonorShellScreen(),
        AppRoutes.recipientDashboard: (_) => const RecipientShellScreen(),
        AppRoutes.recipientSettings: (_) => const RecipientSettingsScreen(),
        AppRoutes.notifications: (_) => const AppNotificationsScreen(),
      },
    );
  }
}
