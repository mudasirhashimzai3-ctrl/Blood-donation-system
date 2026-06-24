import 'package:blood_donation_app/modules/donation/presentation/screens/donation_history_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('history error state shows message and retry action',
      (tester) async {
    var retryCount = 0;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: DonationHistoryErrorState(
            message: 'Network unavailable',
            onRetry: () async {
              retryCount++;
            },
          ),
        ),
      ),
    );

    expect(find.text('Could not load donation history'), findsOneWidget);
    expect(find.text('Network unavailable'), findsOneWidget);
    expect(find.text('Retry'), findsOneWidget);

    await tester.tap(find.text('Retry'));
    await tester.pump();

    expect(retryCount, 1);
  });
}
