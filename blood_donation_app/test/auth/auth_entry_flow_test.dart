import 'package:blood_donation_app/auth/screens/login_screen.dart';
import 'package:blood_donation_app/auth/screens/onboarding_screen.dart';
import 'package:blood_donation_app/auth/screens/role_selection_screen.dart';
import 'package:blood_donation_app/auth/screens/signup_screen.dart';
import 'package:blood_donation_app/auth/screens/splash_screen.dart';
import 'package:blood_donation_app/core/constants/app_constants.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/core/storage/local_storage.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/app_session.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  Future<void> setupStorage([Map<String, Object> values = const {}]) async {
    SharedPreferences.setMockInitialValues(values);
    await getIt.reset();
    final prefs = await SharedPreferences.getInstance();
    getIt.registerSingleton<LocalStorage>(LocalStorage(prefs));
  }

  Widget buildTestApp({
    required Widget splash,
  }) {
    return MaterialApp(
      initialRoute: AppRoutes.splash,
      routes: {
        AppRoutes.splash: (_) => splash,
        AppRoutes.onboarding: (_) =>
            const Scaffold(body: Center(child: Text('onboarding-screen'))),
        AppRoutes.roleSelection: (_) =>
            const Scaffold(body: Center(child: Text('role-screen'))),
        AppRoutes.login: (_) =>
            const Scaffold(body: Center(child: Text('login-screen'))),
        AppRoutes.donorDashboard: (_) =>
            const Scaffold(body: Center(child: Text('donor-dashboard'))),
        AppRoutes.recipientDashboard: (_) =>
            const Scaffold(body: Center(child: Text('recipient-dashboard'))),
      },
    );
  }

  tearDown(() async {
    await getIt.reset();
  });

  group('Splash routing', () {
    testWidgets('routes to onboarding when onboarding is not done',
        (tester) async {
      await setupStorage();

      await tester.pumpWidget(
        buildTestApp(
          splash: const AppSplashScreen(),
        ),
      );

      await tester.pump(const Duration(milliseconds: 980));
      await tester.pumpAndSettle();

      expect(find.text('onboarding-screen'), findsOneWidget);
    });

    testWidgets(
        'routes to role selection when onboarding is done and user is null',
        (tester) async {
      await setupStorage({AppConstants.onboardingDoneKey: true});

      await tester.pumpWidget(
        buildTestApp(
          splash: AppSplashScreen(loadUser: () async => null),
        ),
      );

      await tester.pump(const Duration(milliseconds: 980));
      await tester.pumpAndSettle();

      expect(find.text('role-screen'), findsOneWidget);
    });

    testWidgets('routes to donor dashboard for donor user', (tester) async {
      await setupStorage({AppConstants.onboardingDoneKey: true});

      await tester.pumpWidget(
        buildTestApp(
          splash: AppSplashScreen(
            loadUser: () async => const AppUser(
              id: '1',
              firstName: 'Donor',
              lastName: 'User',
              username: 'donor1',
              email: 'donor@example.com',
              role: AppRole.donor,
            ),
          ),
        ),
      );

      await tester.pump(const Duration(milliseconds: 980));
      await tester.pumpAndSettle();

      expect(find.text('donor-dashboard'), findsOneWidget);
    });

    testWidgets('routes to recipient dashboard for recipient user',
        (tester) async {
      await setupStorage({AppConstants.onboardingDoneKey: true});

      await tester.pumpWidget(
        buildTestApp(
          splash: AppSplashScreen(
            loadUser: () async => const AppUser(
              id: '2',
              firstName: 'Recipient',
              lastName: 'User',
              username: 'recipient1',
              email: 'recipient@example.com',
              role: AppRole.recipient,
            ),
          ),
        ),
      );

      await tester.pump(const Duration(milliseconds: 980));
      await tester.pumpAndSettle();

      expect(find.text('recipient-dashboard'), findsOneWidget);
    });
  });

  group('Onboarding and role selection', () {
    testWidgets('onboarding progresses and completes', (tester) async {
      await setupStorage();

      await tester.pumpWidget(
        MaterialApp(
          initialRoute: AppRoutes.onboarding,
          routes: {
            AppRoutes.onboarding: (_) => const OnboardingScreen(),
            AppRoutes.roleSelection: (_) =>
                const Scaffold(body: Center(child: Text('role-screen'))),
          },
        ),
      );

      expect(find.text('Next'), findsOneWidget);
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Next'));
      await tester.pumpAndSettle();

      expect(find.text('Get Started'), findsOneWidget);
      await tester.tap(find.text('Get Started'));
      await tester.pumpAndSettle();

      expect(find.text('role-screen'), findsOneWidget);
      expect(AppSession.isOnboardingDone(), isTrue);
    });

    testWidgets('role tap selects role and navigates immediately',
        (tester) async {
      await setupStorage();

      await tester.pumpWidget(
        MaterialApp(
          initialRoute: AppRoutes.roleSelection,
          routes: {
            AppRoutes.roleSelection: (_) => const RoleSelectionScreen(),
            AppRoutes.login: (_) =>
                const Scaffold(body: Center(child: Text('login-screen'))),
          },
        ),
      );

      await tester.tap(find.text('Recipient').first);
      await tester.pumpAndSettle();

      expect(find.text('login-screen'), findsOneWidget);
      expect(AppSession.getSelectedRole(), AppRole.recipient);
    });
  });

  group('Role-locked auth screens', () {
    testWidgets('login screen shows selected role context', (tester) async {
      await setupStorage({'selected_mobile_role': 'recipient'});

      await tester.pumpWidget(
        const MaterialApp(
          home: AppLoginScreen(),
        ),
      );

      expect(find.text('Recipient Access'), findsOneWidget);
      expect(find.text('Donor Access'), findsNothing);
    });

    testWidgets('login password has visibility toggle', (tester) async {
      await setupStorage({'selected_mobile_role': 'donor'});

      await tester.pumpWidget(
        const MaterialApp(
          home: AppLoginScreen(),
        ),
      );

      expect(find.byIcon(Icons.visibility_outlined), findsOneWidget);
    });

    testWidgets('donor signup shows location button and password toggles',
        (tester) async {
      await setupStorage({'selected_mobile_role': 'donor'});

      await tester.pumpWidget(
        const MaterialApp(
          home: AppSignupScreen(),
        ),
      );

      expect(find.text('Donor Registration'), findsOneWidget);
      expect(find.text('Register My Location'), findsOneWidget);
      expect(find.byIcon(Icons.visibility_outlined), findsNWidgets(2));
    });

    testWidgets('signup screen hides recipient-only removed inputs',
        (tester) async {
      await setupStorage({'selected_mobile_role': 'recipient'});

      await tester.pumpWidget(
        const MaterialApp(
          home: AppSignupScreen(),
        ),
      );

      expect(find.text('Recipient Registration'), findsOneWidget);
      expect(find.text('Blood Group'), findsNothing);
      expect(find.text('Required Blood Group'), findsNothing);
      expect(find.text('Hospital'), findsNothing);
      expect(find.text('Emergency Level'), findsNothing);
      expect(find.text('Register My Location'), findsNothing);
    });

    testWidgets('signup can navigate back to login', (tester) async {
      await setupStorage({'selected_mobile_role': 'donor'});

      await tester.pumpWidget(
        MaterialApp(
          initialRoute: AppRoutes.login,
          routes: {
            AppRoutes.login: (_) => const AppLoginScreen(),
            AppRoutes.signup: (_) => const AppSignupScreen(),
          },
        ),
      );

      await tester.tap(find.text('Create account'));
      await tester.pumpAndSettle();
      expect(find.text('Donor Registration'), findsOneWidget);

      await tester.ensureVisible(find.text('Already have an account? Sign in'));
      await tester.tap(find.text('Already have an account? Sign in'));
      await tester.pumpAndSettle();
      expect(find.text('Donor Access'), findsOneWidget);
    });
  });
}
