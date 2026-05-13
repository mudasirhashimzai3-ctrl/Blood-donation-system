import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:blood_donation_app/modules/auth/domain/repositories/auth_repository.dart';
import 'package:blood_donation_app/modules/auth/presentation/screens/forgot_password_screen.dart';
import 'package:blood_donation_app/modules/auth/presentation/screens/login_screen.dart';
import 'package:blood_donation_app/modules/auth/presentation/screens/register_screen.dart';
import 'package:blood_donation_app/modules/auth/presentation/screens/splash_screen.dart';
import 'package:blood_donation_app/modules/blood_bank/presentation/screens/blood_bank_list_screen.dart';
import 'package:blood_donation_app/modules/blood_request/presentation/screens/blood_request_screen.dart';
import 'package:blood_donation_app/modules/donation/presentation/screens/donation_detail_screen.dart';
import 'package:blood_donation_app/modules/donation/presentation/screens/donation_history_screen.dart';
import 'package:blood_donation_app/modules/donor/presentation/screens/profile_screen.dart';
import 'package:blood_donation_app/modules/home/presentation/screens/home_screen.dart';
import 'package:blood_donation_app/modules/home/presentation/screens/main_shell.dart';
import 'package:blood_donation_app/modules/notifications/presentation/screens/notifications_screen.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/router/app_routes.dart';

class AppRouter {
  AppRouter._();

  static final _rootNavigatorKey = GlobalKey<NavigatorState>();
  static final _shellNavigatorKey = GlobalKey<NavigatorState>();

  static final GoRouter router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    redirect: _guard,
    routes: _routes,
  );

  static Future<String?> _guard(
    BuildContext context,
    GoRouterState state,
  ) async {
    final isLoggedIn = await getIt<AuthRepository>().isLoggedIn();
    final isOnSplash = state.uri.path == AppRoutes.splash;
    final isOnAuth =
        state.uri.path == AppRoutes.login ||
        state.uri.path == AppRoutes.register ||
        state.uri.path == AppRoutes.forgotPassword;

    if (isOnSplash) return null; // let splash handle navigation itself
    if (!isLoggedIn && !isOnAuth) return AppRoutes.login;
    if (isLoggedIn && isOnAuth) return AppRoutes.home;
    return null;
  }

  static final List<RouteBase> _routes = [
    GoRoute(
      path: AppRoutes.splash,
      name: AppRoutes.splashName,
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: AppRoutes.login,
      name: AppRoutes.loginName,
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: AppRoutes.register,
      name: AppRoutes.registerName,
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: AppRoutes.forgotPassword,
      name: AppRoutes.forgotPasswordName,
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) => MainShell(child: child),
      routes: [
        GoRoute(
          path: AppRoutes.home,
          name: AppRoutes.homeName,
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: AppRoutes.donorProfile,
          name: AppRoutes.donorProfileName,
          builder: (context, state) => const ProfileScreen(),
        ),
        GoRoute(
          path: AppRoutes.donationHistory,
          name: AppRoutes.donationHistoryName,
          builder: (context, state) => const DonationHistoryScreen(),
          routes: [
            GoRoute(
              path: ':id',
              name: AppRoutes.donationDetailName,
              builder: (context, state) => DonationDetailScreen(
                donationId: state.pathParameters['id'] ?? '',
              ),
            ),
          ],
        ),
        GoRoute(
          path: AppRoutes.bloodBanks,
          name: AppRoutes.bloodBanksName,
          builder: (context, state) => const BloodBankListScreen(),
        ),
        GoRoute(
          path: AppRoutes.notifications,
          name: AppRoutes.notificationsName,
          builder: (context, state) => const NotificationsScreen(),
        ),
        GoRoute(
          path: AppRoutes.requestBlood,
          name: AppRoutes.requestBloodName,
          builder: (context, state) => const BloodRequestScreen(),
        ),
      ],
    ),
  ];
}
