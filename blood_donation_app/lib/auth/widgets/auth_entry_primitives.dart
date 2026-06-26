import 'dart:ui';

import 'package:flutter/material.dart';

class AuthEntryPrimitives {
  AuthEntryPrimitives._();

  static const Color ink = Color(0xFF1A1D34);
  static const Color mutedInk = Color(0xFF5B607A);
  static const Color donorStart = Color(0xFFD93657);
  static const Color donorEnd = Color(0xFF9A2052);
  static const Color recipientStart = Color(0xFF4C73FF);
  static const Color recipientEnd = Color(0xFF2A4CD0);

  static const LinearGradient pageGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFFF0F4), Color(0xFFFCE4EE), Color(0xFFE6EEFF)],
  );

  static const LinearGradient splashBadgeGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFE73E67), Color(0xFFA3285E)],
  );
}

class AuthEntryScaffold extends StatelessWidget {
  const AuthEntryScaffold({
    super.key,
    required this.child,
    this.appBar,
    this.maxContentWidth = 560,
  });

  final Widget child;
  final PreferredSizeWidget? appBar;
  final double maxContentWidth;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: appBar,
      body: Container(
        decoration:
            const BoxDecoration(gradient: AuthEntryPrimitives.pageGradient),
        child: Stack(
          children: [
            const _BackgroundBlobs(),
            SafeArea(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final width = constraints.maxWidth;
                  final horizontalPadding = width < 400
                      ? 16.0
                      : width < 768
                          ? 20.0
                          : 28.0;
                  return Align(
                    alignment: Alignment.topCenter,
                    child: ConstrainedBox(
                      constraints: BoxConstraints(maxWidth: maxContentWidth),
                      child: Padding(
                        padding: EdgeInsets.fromLTRB(
                            horizontalPadding, 16, horizontalPadding, 20),
                        child: child,
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AuthGlassCard extends StatelessWidget {
  const AuthGlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(18),
    this.borderRadius = 24,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.86),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(color: Colors.white.withValues(alpha: 0.8)),
            boxShadow: const [
              BoxShadow(
                color: Color(0x220E1438),
                blurRadius: 24,
                offset: Offset(0, 14),
              ),
            ],
          ),
          child: child,
        ),
      ),
    );
  }
}

class _BackgroundBlobs extends StatelessWidget {
  const _BackgroundBlobs();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: -80,
          left: -40,
          child: _blob(
            size: 220,
            gradient: const LinearGradient(
              colors: [Color(0xFFFFA4BA), Color(0x00FFA4BA)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        Positioned(
          top: 180,
          right: -70,
          child: _blob(
            size: 260,
            gradient: const LinearGradient(
              colors: [Color(0xFFBFD3FF), Color(0x00BFD3FF)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
        Positioned(
          bottom: -100,
          left: 40,
          child: _blob(
            size: 240,
            gradient: const LinearGradient(
              colors: [Color(0xFFFFCCD9), Color(0x00FFCCD9)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
      ],
    );
  }

  Widget _blob({required double size, required Gradient gradient}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: gradient,
      ),
    );
  }
}
