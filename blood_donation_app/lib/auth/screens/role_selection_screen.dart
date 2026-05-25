import 'package:blood_donation_app/auth/widgets/auth_entry_primitives.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/app_session.dart';
import 'package:flutter/material.dart';

class RoleSelectionScreen extends StatelessWidget {
  const RoleSelectionScreen({super.key});

  Future<void> _selectRole(BuildContext context, AppRole role) async {
    await AppSession.setSelectedRole(role);
    if (!context.mounted) return;
    Navigator.pushNamed(context, AppRoutes.login);
  }

  @override
  Widget build(BuildContext context) {
    return AuthEntryScaffold(
      maxContentWidth: 860,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final wide = constraints.maxWidth >= 760;
          final cards = wide
              ? Row(
                  children: [
                    Expanded(
                      child: _RoleHeroCard(
                        title: 'Donor',
                        subtitle:
                            'Share life by responding to urgent blood requests quickly.',
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            AuthEntryPrimitives.donorStart,
                            AuthEntryPrimitives.donorEnd
                          ],
                        ),
                        icon: Icons.volunteer_activism_rounded,
                        onTap: () => _selectRole(context, AppRole.donor),
                      ),
                    ),
                    const SizedBox(width: 18),
                    Expanded(
                      child: _RoleHeroCard(
                        title: 'Recipient',
                        subtitle:
                            'Create a request and coordinate blood support with confidence.',
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            AuthEntryPrimitives.recipientStart,
                            AuthEntryPrimitives.recipientEnd,
                          ],
                        ),
                        icon: Icons.medical_services_rounded,
                        onTap: () => _selectRole(context, AppRole.recipient),
                      ),
                    ),
                  ],
                )
              : Column(
                  children: [
                    Expanded(
                      child: _RoleHeroCard(
                        title: 'Donor',
                        subtitle:
                            'Share life by responding to urgent blood requests quickly.',
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            AuthEntryPrimitives.donorStart,
                            AuthEntryPrimitives.donorEnd
                          ],
                        ),
                        icon: Icons.volunteer_activism_rounded,
                        onTap: () => _selectRole(context, AppRole.donor),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Expanded(
                      child: _RoleHeroCard(
                        title: 'Recipient',
                        subtitle:
                            'Create a request and coordinate blood support with confidence.',
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            AuthEntryPrimitives.recipientStart,
                            AuthEntryPrimitives.recipientEnd,
                          ],
                        ),
                        icon: Icons.medical_services_rounded,
                        onTap: () => _selectRole(context, AppRole.recipient),
                      ),
                    ),
                  ],
                );

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 6),
              const Text(
                'Choose your role',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  color: AuthEntryPrimitives.ink,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Continue as a donor or recipient to unlock role-specific sign in and sign up.',
                style: TextStyle(
                  color: AuthEntryPrimitives.mutedInk,
                  fontSize: 15,
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 18),
              Expanded(child: cards),
            ],
          );
        },
      ),
    );
  }
}

class _RoleHeroCard extends StatelessWidget {
  const _RoleHeroCard({
    required this.title,
    required this.subtitle,
    required this.gradient,
    required this.icon,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final Gradient gradient;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final compact = constraints.maxHeight < 250;
        return Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(30),
            child: Ink(
              decoration: BoxDecoration(
                gradient: gradient,
                borderRadius: BorderRadius.circular(30),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x400A1235),
                    blurRadius: 26,
                    offset: Offset(0, 16),
                  ),
                ],
              ),
              padding: EdgeInsets.fromLTRB(
                  22, compact ? 18 : 24, 22, compact ? 18 : 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: compact ? 56 : 72,
                    height: compact ? 56 : 72,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.22),
                      borderRadius: BorderRadius.circular(compact ? 18 : 22),
                    ),
                    child: Icon(icon,
                        size: compact ? 30 : 40, color: Colors.white),
                  ),
                  SizedBox(height: compact ? 12 : 18),
                  Text(
                    title,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: compact ? 26 : 34,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Expanded(
                    child: Text(
                      subtitle,
                      maxLines: compact ? 2 : 4,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Color(0xFFF4F6FF),
                        fontSize: 15,
                        height: 1.45,
                      ),
                    ),
                  ),
                  if (!compact) ...[
                    const SizedBox(height: 16),
                    const Row(
                      children: [
                        Text(
                          'Continue',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
                          ),
                        ),
                        SizedBox(width: 6),
                        Icon(Icons.arrow_forward_rounded, color: Colors.white),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
