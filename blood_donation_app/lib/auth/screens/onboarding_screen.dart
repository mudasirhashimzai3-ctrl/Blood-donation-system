import 'package:blood_donation_app/auth/widgets/auth_entry_primitives.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/app_session.dart';
import 'package:flutter/material.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int _page = 0;

  final List<_OnboardingItem> _items = const [
    _OnboardingItem(
      icon: Icons.bloodtype_rounded,
      title: 'Emergency Requests In Seconds',
      description:
          'Recipients can create verified blood requests fast and keep everyone informed with real-time status updates.',
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFFD93657), Color(0xFFA22A5B)],
      ),
    ),
    _OnboardingItem(
      icon: Icons.notifications_active_rounded,
      title: 'Smart Donor Alerts',
      description:
          'Donors receive urgent notifications instantly, with request priority and nearby hospital details in one place.',
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF4C73FF), Color(0xFF2A4CD0)],
      ),
    ),
    _OnboardingItem(
      icon: Icons.handshake_rounded,
      title: 'Reliable Connection Journey',
      description:
          'From request to response, every step is designed to make blood support smoother, safer, and more dependable.',
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF914BFF), Color(0xFF5D36CE)],
      ),
    ),
  ];

  bool get _isLastPage => _page == _items.length - 1;

  Future<void> _complete() async {
    await AppSession.setOnboardingDone();
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, AppRoutes.roleSelection);
  }

  Future<void> _skip() async {
    await _controller.animateToPage(
      _items.length - 1,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
    );
  }

  Future<void> _next() async {
    await _controller.nextPage(
      duration: const Duration(milliseconds: 320),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AuthEntryScaffold(
      maxContentWidth: 640,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Text(
                'Blood Bridge',
                style: TextStyle(
                  fontSize: 19,
                  fontWeight: FontWeight.w800,
                  color: AuthEntryPrimitives.ink,
                ),
              ),
              const Spacer(),
              if (!_isLastPage)
                TextButton(
                  onPressed: _skip,
                  child: const Text('Skip'),
                ),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: PageView.builder(
              controller: _controller,
              itemCount: _items.length,
              onPageChanged: (index) => setState(() => _page = index),
              itemBuilder: (context, index) {
                final item = _items[index];
                return _OnboardingPage(item: item);
              },
            ),
          ),
          const SizedBox(height: 18),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_items.length, (index) {
              final selected = index == _page;
              return AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                curve: Curves.easeOutCubic,
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: selected ? 26 : 9,
                height: 9,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: selected
                      ? AuthEntryPrimitives.donorStart
                      : const Color(0xFFD7DBEC),
                ),
              );
            }),
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 54,
            child: FilledButton(
              onPressed: _isLastPage ? _complete : _next,
              style: FilledButton.styleFrom(
                backgroundColor: AuthEntryPrimitives.ink,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
              child: Text(_isLastPage ? 'Get Started' : 'Next'),
            ),
          ),
        ],
      ),
    );
  }
}

class _OnboardingPage extends StatelessWidget {
  const _OnboardingPage({required this.item});

  final _OnboardingItem item;

  @override
  Widget build(BuildContext context) {
    return AuthGlassCard(
      borderRadius: 28,
      padding: const EdgeInsets.fromLTRB(22, 30, 22, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 108,
              height: 108,
              decoration: BoxDecoration(
                gradient: item.gradient,
                borderRadius: BorderRadius.circular(30),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x3A303B87),
                    blurRadius: 26,
                    offset: Offset(0, 14),
                  ),
                ],
              ),
              child: Icon(item.icon, size: 50, color: Colors.white),
            ),
          ),
          const SizedBox(height: 26),
          Text(
            item.title,
            style: const TextStyle(
              color: AuthEntryPrimitives.ink,
              fontSize: 28,
              fontWeight: FontWeight.w800,
              height: 1.15,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            item.description,
            style: const TextStyle(
              color: AuthEntryPrimitives.mutedInk,
              fontSize: 15,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

class _OnboardingItem {
  const _OnboardingItem({
    required this.icon,
    required this.title,
    required this.description,
    required this.gradient,
  });

  final IconData icon;
  final String title;
  final String description;
  final LinearGradient gradient;
}
