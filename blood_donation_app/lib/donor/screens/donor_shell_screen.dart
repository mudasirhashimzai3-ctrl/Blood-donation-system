import 'package:blood_donation_app/core/constants/app_constants.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/services/app_services.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/ui/app_style.dart';
import 'package:blood_donation_app/shared/ui/error_message.dart';
import 'package:blood_donation_app/shared/widgets/mobile_dashboard_widgets.dart';
import 'package:blood_donation_app/shared/widgets/request_card.dart';
import 'package:flutter/material.dart';

class DonorShellScreen extends StatefulWidget {
  const DonorShellScreen({super.key});

  @override
  State<DonorShellScreen> createState() => _DonorShellScreenState();
}

class _DonorShellScreenState extends State<DonorShellScreen> {
  int _index = 0;
  final _realtime = RealtimeNotificationsService.instance;

  @override
  void initState() {
    super.initState();
    _realtime.connect();
  }

  @override
  void dispose() {
    _realtime.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      _DonorHomeScreen(onNavigate: (value) => setState(() => _index = value)),
      const _DonorDonateScreen(),
      const _DonorHistoryScreen(),
      const _DonorProfileScreen(),
      const _DonorSettingsScreen(),
    ];

    return MobileDashboardShell(
      currentIndex: _index,
      onChanged: (value) => setState(() => _index = value),
      pages: pages,
      items: const [
        DashboardNavItem(
          icon: Icons.home_outlined,
          activeIcon: Icons.home_rounded,
          label: 'Home',
        ),
        DashboardNavItem(
          icon: Icons.favorite_border_rounded,
          activeIcon: Icons.favorite_rounded,
          label: 'Donate',
        ),
        DashboardNavItem(
          icon: Icons.history_rounded,
          activeIcon: Icons.history_toggle_off_rounded,
          label: 'History',
        ),
        DashboardNavItem(
          icon: Icons.person_outline_rounded,
          activeIcon: Icons.person_rounded,
          label: 'Profile',
        ),
        DashboardNavItem(
          icon: Icons.settings_outlined,
          activeIcon: Icons.settings_rounded,
          label: 'More',
        ),
      ],
    );
  }
}

class _DonorHomeScreen extends StatefulWidget {
  const _DonorHomeScreen({required this.onNavigate});

  final ValueChanged<int> onNavigate;

  @override
  State<_DonorHomeScreen> createState() => _DonorHomeScreenState();
}

class _DonorHomeScreenState extends State<_DonorHomeScreen> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = DonorService(getIt()).getDashboard();
  }

  Future<void> _refresh() async {
    setState(() => _future = DonorService(getIt()).getDashboard());
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _future,
      builder: (context, snapshot) {
        final data = snapshot.data ?? {};
        final unread = (data['unreadNotifications'] as int?) ?? 0;

        return MobileDashboardScaffold(
          title: 'Donor Dashboard',
          subtitle: 'Find urgent requests and manage your donation journey.',
          icon: Icons.volunteer_activism_rounded,
          actions: [
            DashboardIconButton(
              icon: Icons.notifications_rounded,
              badgeCount: unread,
              onPressed: () =>
                  Navigator.pushNamed(context, AppRoutes.notifications),
            ),
          ],
          child: snapshot.hasData
              ? _DonorHomeContent(
                  data: data,
                  onRefresh: _refresh,
                  onNavigate: widget.onNavigate,
                )
              : const _LoadingView(),
        );
      },
    );
  }
}

class _DonorHomeContent extends StatelessWidget {
  const _DonorHomeContent({
    required this.data,
    required this.onRefresh,
    required this.onNavigate,
  });

  final Map<String, dynamic> data;
  final Future<void> Function() onRefresh;
  final ValueChanged<int> onNavigate;

  @override
  Widget build(BuildContext context) {
    final profile = Map<String, dynamic>.from((data['profile'] as Map?) ?? {});
    final nearby =
        (data['nearbyRequests'] as List?)?.cast<BloodRequestItem>() ?? const [];
    final emergency =
        (data['emergencyRequests'] as List?)?.cast<BloodRequestItem>() ??
            const [];
    final historyCount = (data['historyCount'] as int?) ?? 0;
    final unread = (data['unreadNotifications'] as int?) ?? 0;
    final name = _donorName(profile);
    final bloodGroup = (profile['blood_group'] ?? '-').toString();

    return RefreshIndicator(
      color: AppStyle.redPrimary,
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(18, 0, 18, 22),
        children: [
          HeroSummaryCard(
            title: name.isEmpty ? 'Ready to save lives' : 'Hi, $name',
            subtitle:
                'Your profile is active. Nearby hospitals can reach you for compatible requests.',
            icon: Icons.bloodtype_rounded,
            stats: [
              StatItem(
                value: bloodGroup,
                label: 'Blood',
                icon: Icons.water_drop_rounded,
              ),
              StatItem(
                value: '${nearby.length + emergency.length}',
                label: 'Nearby',
                icon: Icons.place_rounded,
              ),
              StatItem(
                value: '$historyCount',
                label: 'Donated',
                icon: Icons.favorite_rounded,
              ),
            ],
          ),
          const SizedBox(height: 16),
          QuickActionCard(
            icon: Icons.favorite_rounded,
            title: 'Review donation requests',
            subtitle: 'Accept or reject pending requests near you.',
            onTap: () => onNavigate(1),
          ),
          const SectionTitle(
            title: 'Emergency Matches',
            subtitle: 'Requests that need attention first',
          ),
          if (emergency.isEmpty)
            const EmptyDashboardCard(
              icon: Icons.verified_user_rounded,
              title: 'No emergency requests',
              message: 'You are all caught up for critical alerts.',
            )
          else
            ...emergency.take(3).map((item) => RequestCard(item: item)),
          const SectionTitle(
            title: 'Nearby Requests',
            subtitle: 'Hospitals currently looking for donors',
          ),
          if (nearby.isEmpty)
            const EmptyDashboardCard(
              icon: Icons.location_off_rounded,
              title: 'No nearby requests',
              message: 'New compatible requests will appear here.',
            )
          else
            ...nearby.take(4).map((item) => RequestCard(item: item)),
          if (unread > 0) ...[
            const SizedBox(height: 4),
            QuickActionCard(
              icon: Icons.notifications_rounded,
              title: '$unread unread notification${unread == 1 ? '' : 's'}',
              subtitle: 'Open alerts and updates from hospitals.',
              onTap: () =>
                  Navigator.pushNamed(context, AppRoutes.notifications),
            ),
          ],
        ],
      ),
    );
  }
}

class _DonorDonateScreen extends StatefulWidget {
  const _DonorDonateScreen();

  @override
  State<_DonorDonateScreen> createState() => _DonorDonateScreenState();
}

class _DonorDonateScreenState extends State<_DonorDonateScreen> {
  late Future<List<DonationItem>> _future;

  @override
  void initState() {
    super.initState();
    _future = DonorService(getIt()).getDonationRequests();
  }

  Future<void> _refresh() async {
    setState(() => _future = DonorService(getIt()).getDonationRequests());
    await _future;
  }

  Future<void> _respond(DonationItem item, String action) async {
    await DonorService(getIt()).respondToDonation(
      donationId: item.id,
      action: action,
    );
    if (!mounted) return;
    await _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return MobileDashboardScaffold(
      title: 'Donate',
      subtitle: 'Respond quickly to pending hospital requests.',
      icon: Icons.favorite_rounded,
      child: FutureBuilder<List<DonationItem>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const _LoadingView();
          final items = snapshot.data ?? const [];
          return RefreshIndicator(
            color: AppStyle.redPrimary,
            onRefresh: _refresh,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(18, 0, 18, 22),
              children: [
                HeroSummaryCard(
                  title:
                      '${items.length} pending request${items.length == 1 ? '' : 's'}',
                  subtitle:
                      'Accept the request you can confidently support today.',
                  icon: Icons.local_hospital_rounded,
                  stats: [
                    StatItem(
                      value: '${items.length}',
                      label: 'Pending',
                      icon: Icons.pending_actions_rounded,
                    ),
                    StatItem(
                      value: items.isEmpty
                          ? '-'
                          : items.first.distanceKm.toStringAsFixed(1),
                      label: 'Nearest km',
                      icon: Icons.near_me_rounded,
                    ),
                    const StatItem(
                      value: 'Live',
                      label: 'Status',
                      icon: Icons.sensors_rounded,
                    ),
                  ],
                ),
                const SectionTitle(
                  title: 'Donation Requests',
                  subtitle: 'Swipe down to refresh the queue',
                ),
                if (items.isEmpty)
                  const EmptyDashboardCard(
                    icon: Icons.inbox_rounded,
                    title: 'No pending donation requests',
                    message:
                        'When hospitals request your help, they will show here.',
                  )
                else
                  ...items.map(
                    (item) => _DonationRequestCard(
                      item: item,
                      onAccept: () => _respond(item, 'accept'),
                      onReject: () => _respond(item, 'decline'),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _DonorHistoryScreen extends StatefulWidget {
  const _DonorHistoryScreen();

  @override
  State<_DonorHistoryScreen> createState() => _DonorHistoryScreenState();
}

class _DonorHistoryScreenState extends State<_DonorHistoryScreen> {
  late Future<List<DonationItem>> _future;

  @override
  void initState() {
    super.initState();
    _future = DonorService(getIt()).getDonationHistory();
  }

  Future<void> _refresh() async {
    setState(() => _future = DonorService(getIt()).getDonationHistory());
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return MobileDashboardScaffold(
      title: 'History',
      subtitle: 'Track every donation and response status.',
      icon: Icons.history_toggle_off_rounded,
      child: FutureBuilder<List<DonationItem>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const _LoadingView();
          final items = snapshot.data ?? const [];
          return RefreshIndicator(
            color: AppStyle.redPrimary,
            onRefresh: _refresh,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(18, 0, 18, 22),
              children: [
                HeroSummaryCard(
                  title: 'Donation Timeline',
                  subtitle: 'A clear record of your blood donation activity.',
                  icon: Icons.timeline_rounded,
                  stats: [
                    StatItem(
                      value: '${items.length}',
                      label: 'Total',
                      icon: Icons.list_alt_rounded,
                    ),
                    StatItem(
                      value:
                          '${items.where((e) => e.status == 'completed').length}',
                      label: 'Complete',
                      icon: Icons.check_circle_rounded,
                    ),
                    StatItem(
                      value:
                          '${items.where((e) => e.status == 'pending').length}',
                      label: 'Pending',
                      icon: Icons.schedule_rounded,
                    ),
                  ],
                ),
                const SectionTitle(title: 'Recent Activity'),
                if (items.isEmpty)
                  const EmptyDashboardCard(
                    icon: Icons.history_rounded,
                    title: 'No previous donations',
                    message:
                        'Accepted and completed donations will appear here.',
                  )
                else
                  ...items.map((item) => _HistoryDonationCard(item: item)),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _DonorProfileScreen extends StatefulWidget {
  const _DonorProfileScreen();

  @override
  State<_DonorProfileScreen> createState() => _DonorProfileScreenState();
}

class _DonorProfileScreenState extends State<_DonorProfileScreen> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = DonorService(getIt()).getProfile();
  }

  Future<void> _openEditDialog(Map<String, dynamic> profile) async {
    final firstNameController =
        TextEditingController(text: (profile['first_name'] ?? '').toString());
    final lastNameController =
        TextEditingController(text: (profile['last_name'] ?? '').toString());
    final phoneController =
        TextEditingController(text: (profile['phone'] ?? '').toString());
    final emailController =
        TextEditingController(text: (profile['email'] ?? '').toString());
    final localAddressController = TextEditingController(
      text: (profile['local_address_city'] ?? '').toString(),
    );
    final permanentAddressController = TextEditingController(
      text: (profile['permanent_address_city'] ?? '').toString(),
    );
    final ageController =
        TextEditingController(text: (profile['age'] ?? '').toString());
    var selectedBloodGroup =
        (profile['blood_group'] ?? AppConstants.bloodTypes.first).toString();
    var saving = false;

    await showDialog<void>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Update Profile'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: firstNameController,
                      decoration:
                          const InputDecoration(labelText: 'First Name'),
                    ),
                    TextField(
                      controller: lastNameController,
                      decoration: const InputDecoration(labelText: 'Last Name'),
                    ),
                    TextField(
                      controller: phoneController,
                      decoration: const InputDecoration(labelText: 'Phone'),
                      keyboardType: TextInputType.phone,
                    ),
                    TextField(
                      controller: emailController,
                      decoration: const InputDecoration(labelText: 'Email'),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    DropdownButtonFormField<String>(
                      initialValue: selectedBloodGroup,
                      items: AppConstants.bloodTypes
                          .map((value) => DropdownMenuItem(
                                value: value,
                                child: Text(value),
                              ))
                          .toList(),
                      onChanged: (value) => setDialogState(() =>
                          selectedBloodGroup = value ?? selectedBloodGroup),
                      decoration:
                          const InputDecoration(labelText: 'Blood Group'),
                    ),
                    TextField(
                      controller: ageController,
                      decoration: const InputDecoration(labelText: 'Age'),
                      keyboardType: TextInputType.number,
                    ),
                    TextField(
                      controller: localAddressController,
                      decoration: const InputDecoration(
                          labelText: 'Local Address City'),
                    ),
                    TextField(
                      controller: permanentAddressController,
                      decoration: const InputDecoration(
                          labelText: 'Permanent Address City'),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: saving ? null : () => Navigator.pop(context),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: saving
                      ? null
                      : () async {
                          setDialogState(() => saving = true);
                          try {
                            await DonorService(getIt()).updateProfile(
                              firstName: firstNameController.text,
                              lastName: lastNameController.text,
                              phone: phoneController.text,
                              email: emailController.text,
                              bloodGroup: selectedBloodGroup,
                              age: int.tryParse(ageController.text.trim()),
                              localAddressCity: localAddressController.text,
                              permanentAddressCity:
                                  permanentAddressController.text,
                            );
                            if (!context.mounted) return;
                            Navigator.pop(context);
                            if (!mounted) return;
                            setState(() {
                              _future = DonorService(getIt()).getProfile();
                            });
                            ScaffoldMessenger.of(this.context).showSnackBar(
                              const SnackBar(content: Text('Profile updated')),
                            );
                          } catch (error) {
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(this.context).showSnackBar(
                              SnackBar(content: Text(toUserMessage(error))),
                            );
                          } finally {
                            if (context.mounted) {
                              setDialogState(() => saving = false);
                            }
                          }
                        },
                  child: saving
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Save'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return MobileDashboardScaffold(
      title: 'Profile',
      subtitle: 'Keep your contact and blood information ready.',
      icon: Icons.person_rounded,
      child: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const _LoadingView();
          final p = snapshot.data ?? {};
          final name = _donorName(p);
          final city =
              (p['local_address_city'] ?? p['permanent_address_city'] ?? '-')
                  .toString();
          return ListView(
            padding: const EdgeInsets.fromLTRB(18, 0, 18, 22),
            children: [
              HeroSummaryCard(
                title: name.isEmpty ? 'Donor Profile' : name,
                subtitle: 'Available donor profile for hospital matching.',
                icon: Icons.badge_rounded,
                stats: [
                  StatItem(
                    value: (p['blood_group'] ?? '-').toString(),
                    label: 'Blood',
                    icon: Icons.water_drop_rounded,
                  ),
                  StatItem(
                    value: (p['age'] ?? '-').toString(),
                    label: 'Age',
                    icon: Icons.cake_rounded,
                  ),
                  const StatItem(
                    value: 'Active',
                    label: 'Status',
                    icon: Icons.verified_rounded,
                  ),
                ],
              ),
              const SectionTitle(title: 'Personal Details'),
              Container(
                padding: const EdgeInsets.all(18),
                decoration: dashboardCardDecoration(),
                child: Column(
                  children: [
                    Align(
                      alignment: Alignment.centerRight,
                      child: OutlinedButton.icon(
                        onPressed: () => _openEditDialog(p),
                        icon: const Icon(Icons.edit_rounded),
                        label: const Text('Edit Profile'),
                      ),
                    ),
                    InfoRow(
                      icon: Icons.phone_rounded,
                      label: 'Phone',
                      value: (p['phone'] ?? '-').toString(),
                    ),
                    InfoRow(
                      icon: Icons.email_rounded,
                      label: 'Email',
                      value: (p['email'] ?? '-').toString(),
                    ),
                    InfoRow(
                      icon: Icons.location_city_rounded,
                      label: 'City',
                      value: city,
                    ),
                    const InfoRow(
                      icon: Icons.event_available_rounded,
                      label: 'Availability',
                      value: 'Always Available',
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _DonorSettingsScreen extends StatelessWidget {
  const _DonorSettingsScreen();

  @override
  Widget build(BuildContext context) {
    return MobileDashboardScaffold(
      title: 'Settings',
      subtitle: 'Manage your session and app preferences.',
      icon: Icons.settings_rounded,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(18, 0, 18, 22),
        children: [
          const HeroSummaryCard(
            title: 'Account Settings',
            subtitle: 'Your donor account is protected and ready for use.',
            icon: Icons.shield_rounded,
            stats: [
              StatItem(
                value: 'Secure',
                label: 'Session',
                icon: Icons.lock_rounded,
              ),
              StatItem(
                value: 'Live',
                label: 'Alerts',
                icon: Icons.sensors_rounded,
              ),
              StatItem(
                value: 'Donor',
                label: 'Role',
                icon: Icons.favorite_rounded,
              ),
            ],
          ),
          const SectionTitle(title: 'Account'),
          QuickActionCard(
            icon: Icons.logout_rounded,
            title: 'Logout',
            subtitle: 'Sign out and return to role selection.',
            onTap: () async {
              await AuthService(getIt()).logout();
              if (!context.mounted) return;
              await Navigator.pushNamedAndRemoveUntil(
                context,
                AppRoutes.roleSelection,
                (route) => false,
              );
            },
          ),
        ],
      ),
    );
  }
}

class _DonationRequestCard extends StatelessWidget {
  const _DonationRequestCard({
    required this.item,
    required this.onAccept,
    required this.onReject,
  });

  final DonationItem item;
  final VoidCallback onAccept;
  final VoidCallback onReject;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: dashboardCardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  gradient: AppStyle.headerGradient,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Icon(
                  Icons.local_hospital_rounded,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.hospitalName ?? 'Hospital',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: AppStyle.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      'Request #${item.requestId}',
                      style: const TextStyle(
                        color: AppStyle.textMuted,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              StatusPill(
                label: _titleCase(item.status),
                color: const Color(0xFFB65B00),
                icon: Icons.schedule_rounded,
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: InfoRow(
                  icon: Icons.water_drop_rounded,
                  label: 'Blood',
                  value: item.requestBloodGroup ?? '-',
                ),
              ),
              Expanded(
                child: InfoRow(
                  icon: Icons.near_me_rounded,
                  label: 'Distance',
                  value: '${item.distanceKm.toStringAsFixed(1)} km',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onReject,
                  icon: const Icon(Icons.close_rounded),
                  label: const Text('Reject'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton.icon(
                  onPressed: onAccept,
                  icon: const Icon(Icons.check_rounded),
                  label: const Text('Accept'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HistoryDonationCard extends StatelessWidget {
  const _HistoryDonationCard({required this.item});

  final DonationItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: dashboardCardDecoration(),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppStyle.redPrimary.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(17),
            ),
            child: const Icon(
              Icons.bloodtype_rounded,
              color: AppStyle.redPrimary,
            ),
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.hospitalName ?? 'Hospital',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppStyle.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${item.requestBloodGroup ?? '-'} blood request',
                  style: const TextStyle(
                    color: AppStyle.textMuted,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          StatusPill(
            label: _titleCase(item.status),
            color: _statusColor(item.status),
          ),
        ],
      ),
    );
  }
}

class _LoadingView extends StatelessWidget {
  const _LoadingView();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: CircularProgressIndicator(color: AppStyle.redPrimary),
    );
  }
}

String _donorName(Map<String, dynamic> profile) {
  return '${profile['first_name'] ?? ''} ${profile['last_name'] ?? ''}'.trim();
}

String _titleCase(String value) {
  final cleaned = value.trim();
  if (cleaned.isEmpty) return '-';
  return cleaned[0].toUpperCase() + cleaned.substring(1).toLowerCase();
}

Color _statusColor(String status) {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'accepted':
    case 'matched':
      return const Color(0xFF16835D);
    case 'declined':
    case 'rejected':
    case 'cancelled':
      return AppStyle.redPrimary;
    default:
      return const Color(0xFFB65B00);
  }
}
