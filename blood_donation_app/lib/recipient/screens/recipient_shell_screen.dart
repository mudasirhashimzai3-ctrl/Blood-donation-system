import 'package:blood_donation_app/core/constants/app_constants.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/services/app_services.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/ui/app_style.dart';
import 'package:blood_donation_app/shared/ui/error_message.dart';
import 'package:blood_donation_app/shared/widgets/mobile_dashboard_widgets.dart';
import 'package:blood_donation_app/shared/widgets/request_card.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class RecipientShellScreen extends StatefulWidget {
  const RecipientShellScreen({super.key});

  @override
  State<RecipientShellScreen> createState() => _RecipientShellScreenState();
}

class _RecipientShellScreenState extends State<RecipientShellScreen> {
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
      _RecipientHomeScreen(
        onNavigate: (value) => setState(() => _index = value),
      ),
      const _CreateRequestScreen(),
      const _MyRequestsScreen(),
      const _ResponsesScreen(),
      const _RecipientProfileScreen(),
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
          icon: Icons.add_circle_outline_rounded,
          activeIcon: Icons.add_circle_rounded,
          label: 'Create',
        ),
        DashboardNavItem(
          icon: Icons.assignment_outlined,
          activeIcon: Icons.assignment_rounded,
          label: 'Requests',
        ),
        DashboardNavItem(
          icon: Icons.groups_outlined,
          activeIcon: Icons.groups_rounded,
          label: 'Donors',
        ),
        DashboardNavItem(
          icon: Icons.person_outline_rounded,
          activeIcon: Icons.person_rounded,
          label: 'Profile',
        ),
      ],
    );
  }
}

class _RecipientHomeScreen extends StatefulWidget {
  const _RecipientHomeScreen({required this.onNavigate});

  final ValueChanged<int> onNavigate;

  @override
  State<_RecipientHomeScreen> createState() => _RecipientHomeScreenState();
}

class _RecipientHomeScreenState extends State<_RecipientHomeScreen> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = RecipientService(getIt()).getDashboard();
  }

  Future<void> _refresh() async {
    setState(() => _future = RecipientService(getIt()).getDashboard());
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
          title: 'Recipient Dashboard',
          subtitle:
              'Create requests, monitor matches, and view donor responses.',
          icon: Icons.local_hospital_rounded,
          actions: [
            DashboardIconButton(
              icon: Icons.notifications_rounded,
              badgeCount: unread,
              onPressed: () =>
                  Navigator.pushNamed(context, AppRoutes.notifications),
            ),
          ],
          child: snapshot.hasData
              ? _RecipientHomeContent(
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

class _RecipientHomeContent extends StatelessWidget {
  const _RecipientHomeContent({
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
    final active =
        (data['activeRequests'] as List?)?.cast<BloodRequestItem>() ?? const [];
    final emergency =
        (data['emergencyRequests'] as List?)?.cast<BloodRequestItem>() ??
            const [];
    final unread = (data['unreadNotifications'] as int?) ?? 0;
    final name = (profile['full_name'] ?? '').toString().trim();
    final requiredBlood = (profile['required_blood_group'] ?? '-').toString();
    final level = normalizeRequestType(
      (profile['emergency_level'] ?? 'normal').toString(),
    );

    return RefreshIndicator(
      color: AppStyle.redPrimary,
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(18, 0, 18, 22),
        children: [
          HeroSummaryCard(
            title: name.isEmpty ? 'Blood request hub' : 'Hi, $name',
            subtitle:
                'Manage your active requests and keep donor matching moving.',
            icon: Icons.medical_services_rounded,
            stats: [
              StatItem(
                value: requiredBlood,
                label: 'Needed',
                icon: Icons.water_drop_rounded,
              ),
              StatItem(
                value: '${active.length}',
                label: 'Active',
                icon: Icons.assignment_rounded,
              ),
              StatItem(
                value: _titleCase(level),
                label: 'Priority',
                icon: Icons.priority_high_rounded,
              ),
            ],
          ),
          const SizedBox(height: 16),
          QuickActionCard(
            icon: Icons.add_circle_rounded,
            title: 'Create a blood request',
            subtitle: 'Start a new request and auto-match donors.',
            onTap: () => onNavigate(1),
          ),
          const SectionTitle(
            title: 'Active Requests',
            subtitle: 'Open requests currently being matched',
          ),
          if (active.isEmpty)
            const EmptyDashboardCard(
              icon: Icons.assignment_late_rounded,
              title: 'No active requests',
              message: 'Create a request when you need blood support.',
            )
          else
            ...active.take(4).map((item) => RequestCard(item: item)),
          const SectionTitle(
            title: 'Emergency Requests',
            subtitle: 'Critical requests remain visible here',
          ),
          if (emergency.isEmpty)
            const EmptyDashboardCard(
              icon: Icons.health_and_safety_rounded,
              title: 'No emergency requests',
              message: 'Critical requests will be highlighted immediately.',
            )
          else
            ...emergency.take(3).map((item) => RequestCard(item: item)),
          if (unread > 0) ...[
            const SizedBox(height: 4),
            QuickActionCard(
              icon: Icons.notifications_rounded,
              title: '$unread unread notification${unread == 1 ? '' : 's'}',
              subtitle: 'Check updates from donors and hospitals.',
              onTap: () =>
                  Navigator.pushNamed(context, AppRoutes.notifications),
            ),
          ],
        ],
      ),
    );
  }
}

class _CreateRequestScreen extends StatefulWidget {
  const _CreateRequestScreen();

  @override
  State<_CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<_CreateRequestScreen> {
  final _unitsController = TextEditingController(text: '1');
  String _bloodGroup = AppConstants.bloodTypes.first;
  String _level = 'normal';
  bool _loading = false;
  bool _loadingHospitals = true;
  List<HospitalItem> _hospitals = const [];
  int? _selectedHospitalId;

  @override
  void initState() {
    super.initState();
    _prefillBloodGroupFromProfile();
    _loadHospitals();
  }

  Future<void> _prefillBloodGroupFromProfile() async {
    try {
      final profile = await RecipientService(getIt()).getProfile();
      final preferred = profile['required_blood_group']?.toString().trim();
      if (!mounted || preferred == null || preferred.isEmpty) return;
      if (!AppConstants.bloodTypes.contains(preferred)) return;
      setState(() => _bloodGroup = preferred);
    } catch (_) {}
  }

  Future<void> _loadHospitals() async {
    setState(() => _loadingHospitals = true);
    try {
      final hospitals = await RecipientService(getIt()).getHospitals();
      if (!mounted) return;
      setState(() {
        _hospitals = hospitals;
        if (_selectedHospitalId == null && hospitals.isNotEmpty) {
          _selectedHospitalId = hospitals.first.id;
        }
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _hospitals = const []);
    } finally {
      if (mounted) setState(() => _loadingHospitals = false);
    }
  }

  @override
  void dispose() {
    _unitsController.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    final units = int.tryParse(_unitsController.text.trim()) ?? 1;
    if (_selectedHospitalId == null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Select a hospital')));
      return;
    }
    if (_bloodGroup.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Blood group is required')),
      );
      return;
    }
    setState(() => _loading = true);
    try {
      await RecipientService(getIt()).createRequest(
        hospitalId: _selectedHospitalId!,
        bloodGroup: _bloodGroup,
        units: units,
        emergencyLevel: _level,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Request created')));
    } catch (error) {
      if (!mounted) return;
      if (kDebugMode) {
        debugPrint('Create request error: $error');
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(toUserMessage(error))),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return MobileDashboardScaffold(
      title: 'Create Request',
      subtitle: 'Tell nearby donors exactly what is needed.',
      icon: Icons.add_circle_rounded,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(18, 0, 18, 22),
        children: [
          HeroSummaryCard(
            title: 'New Blood Request',
            subtitle:
                'Choose a hospital, blood group, units, and urgency level.',
            icon: Icons.bloodtype_rounded,
            stats: [
              StatItem(
                value: _bloodGroup,
                label: 'Blood',
                icon: Icons.water_drop_rounded,
              ),
              StatItem(
                value: _unitsController.text.trim().isEmpty
                    ? '1'
                    : _unitsController.text.trim(),
                label: 'Units',
                icon: Icons.inventory_2_rounded,
              ),
              StatItem(
                value: _titleCase(_level),
                label: 'Priority',
                icon: Icons.priority_high_rounded,
              ),
            ],
          ),
          const SectionTitle(title: 'Request Details'),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: dashboardCardDecoration(),
            child: Column(
              children: [
                DropdownButtonFormField<int>(
                  initialValue: _selectedHospitalId,
                  isExpanded: true,
                  items: _hospitals
                      .map(
                        (hospital) => DropdownMenuItem<int>(
                          value: hospital.id,
                          child: Text(
                            '${hospital.name} (${hospital.city ?? "-"})',
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      )
                      .toList(),
                  onChanged: _loadingHospitals
                      ? null
                      : (value) => setState(() => _selectedHospitalId = value),
                  decoration: const InputDecoration(
                    labelText: 'Hospital',
                    prefixIcon: Icon(Icons.local_hospital_rounded),
                  ),
                ),
                if (_loadingHospitals)
                  const Padding(
                    padding: EdgeInsets.only(top: 10),
                    child: LinearProgressIndicator(
                      color: AppStyle.redPrimary,
                      minHeight: 3,
                    ),
                  ),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  initialValue: _bloodGroup,
                  items: AppConstants.bloodTypes
                      .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                      .toList(),
                  onChanged: (v) => setState(
                    () => _bloodGroup = v ?? AppConstants.bloodTypes.first,
                  ),
                  decoration: const InputDecoration(
                    labelText: 'Blood Type',
                    prefixIcon: Icon(Icons.water_drop_rounded),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _unitsController,
                  keyboardType: TextInputType.number,
                  onChanged: (_) => setState(() {}),
                  decoration: const InputDecoration(
                    labelText: 'Units',
                    prefixIcon: Icon(Icons.inventory_2_rounded),
                  ),
                ),
                const SizedBox(height: 14),
                DropdownButtonFormField<String>(
                  initialValue: _level,
                  items: const [
                    DropdownMenuItem(value: 'normal', child: Text('Normal')),
                    DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
                    DropdownMenuItem(
                        value: 'critical', child: Text('Critical')),
                  ],
                  onChanged: (v) => setState(() => _level = v ?? 'normal'),
                  decoration: const InputDecoration(
                    labelText: 'Emergency Level',
                    prefixIcon: Icon(Icons.priority_high_rounded),
                  ),
                ),
                const SizedBox(height: 18),
                FilledButton.icon(
                  onPressed: _loading ? null : _create,
                  icon: _loading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.send_rounded),
                  label: Text(_loading ? 'Creating...' : 'Create Request'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MyRequestsScreen extends StatefulWidget {
  const _MyRequestsScreen();

  @override
  State<_MyRequestsScreen> createState() => _MyRequestsScreenState();
}

class _MyRequestsScreenState extends State<_MyRequestsScreen> {
  late Future<List<BloodRequestItem>> _future;

  @override
  void initState() {
    super.initState();
    _future = RecipientService(getIt()).getMyRequests();
  }

  Future<void> _refresh() async {
    setState(() => _future = RecipientService(getIt()).getMyRequests());
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return MobileDashboardScaffold(
      title: 'My Requests',
      subtitle: 'Follow pending, accepted, and completed requests.',
      icon: Icons.assignment_rounded,
      child: FutureBuilder<List<BloodRequestItem>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const _LoadingView();
          final items = snapshot.data ?? const [];
          final pending = items.where((e) => e.status == 'pending').toList();
          final accepted = items.where((e) => e.status == 'matched').toList();
          final completed =
              items.where((e) => e.status == 'completed').toList();
          return RefreshIndicator(
            color: AppStyle.redPrimary,
            onRefresh: _refresh,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(18, 0, 18, 22),
              children: [
                HeroSummaryCard(
                  title:
                      '${items.length} total request${items.length == 1 ? '' : 's'}',
                  subtitle: 'Grouped by current request status.',
                  icon: Icons.fact_check_rounded,
                  stats: [
                    StatItem(
                      value: '${pending.length}',
                      label: 'Pending',
                      icon: Icons.schedule_rounded,
                    ),
                    StatItem(
                      value: '${accepted.length}',
                      label: 'Accepted',
                      icon: Icons.handshake_rounded,
                    ),
                    StatItem(
                      value: '${completed.length}',
                      label: 'Complete',
                      icon: Icons.check_circle_rounded,
                    ),
                  ],
                ),
                _RequestGroup(
                  title: 'Pending',
                  items: pending,
                  emptyMessage: 'No pending requests right now.',
                ),
                _RequestGroup(
                  title: 'Accepted',
                  items: accepted,
                  emptyMessage: 'Matched requests will appear here.',
                ),
                _RequestGroup(
                  title: 'Completed',
                  items: completed,
                  emptyMessage: 'Completed requests will appear here.',
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _ResponsesScreen extends StatefulWidget {
  const _ResponsesScreen();

  @override
  State<_ResponsesScreen> createState() => _ResponsesScreenState();
}

class _ResponsesScreenState extends State<_ResponsesScreen> {
  late Future<List<Map<String, dynamic>>> _future;

  @override
  void initState() {
    super.initState();
    _future = RecipientService(getIt()).getDonorResponses();
  }

  Future<void> _refresh() async {
    setState(() => _future = RecipientService(getIt()).getDonorResponses());
    await _future;
  }

  @override
  Widget build(BuildContext context) {
    return MobileDashboardScaffold(
      title: 'Donor Responses',
      subtitle: 'Review donor replies for each request.',
      icon: Icons.groups_rounded,
      child: FutureBuilder<List<Map<String, dynamic>>>(
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
                      '${items.length} response group${items.length == 1 ? '' : 's'}',
                  subtitle: 'Donor replies are grouped by blood request.',
                  icon: Icons.diversity_1_rounded,
                  stats: [
                    StatItem(
                      value: '${items.length}',
                      label: 'Requests',
                      icon: Icons.assignment_rounded,
                    ),
                    StatItem(
                      value: '${_totalResponses(items)}',
                      label: 'Donors',
                      icon: Icons.people_rounded,
                    ),
                    const StatItem(
                      value: 'Live',
                      label: 'Updates',
                      icon: Icons.sensors_rounded,
                    ),
                  ],
                ),
                const SectionTitle(title: 'Responses'),
                if (items.isEmpty)
                  const EmptyDashboardCard(
                    icon: Icons.group_off_rounded,
                    title: 'No responses yet',
                    message:
                        'Donor responses will appear after matching starts.',
                  )
                else
                  ...items.map((item) => _ResponseGroupCard(item: item)),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _RecipientProfileScreen extends StatefulWidget {
  const _RecipientProfileScreen();

  @override
  State<_RecipientProfileScreen> createState() =>
      _RecipientProfileScreenState();
}

class _RecipientProfileScreenState extends State<_RecipientProfileScreen> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = RecipientService(getIt()).getProfile();
  }

  Future<void> _openEditDialog(Map<String, dynamic> profile) async {
    final fullNameController =
        TextEditingController(text: (profile['full_name'] ?? '').toString());
    final phoneController =
        TextEditingController(text: (profile['phone'] ?? '').toString());
    final emailController =
        TextEditingController(text: (profile['email'] ?? '').toString());
    var selectedBloodGroup =
        (profile['required_blood_group'] ?? AppConstants.bloodTypes.first)
            .toString();
    var selectedLevel = normalizeRequestType(
      (profile['emergency_level'] ?? 'normal').toString(),
    );
    int? selectedHospitalId =
        int.tryParse((profile['hospital'] ?? '').toString());
    var saving = false;

    List<HospitalItem> hospitals = const [];
    try {
      hospitals = await RecipientService(getIt()).getHospitals();
    } catch (_) {}
    if (selectedHospitalId == null && hospitals.isNotEmpty) {
      selectedHospitalId = hospitals.first.id;
    }

    if (!mounted) return;

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
                      controller: fullNameController,
                      decoration: const InputDecoration(labelText: 'Full Name'),
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
                      decoration: const InputDecoration(
                          labelText: 'Required Blood Group'),
                    ),
                    DropdownButtonFormField<String>(
                      initialValue: selectedLevel,
                      items: const [
                        DropdownMenuItem(
                            value: 'normal', child: Text('Normal')),
                        DropdownMenuItem(
                            value: 'urgent', child: Text('Urgent')),
                        DropdownMenuItem(
                          value: 'critical',
                          child: Text('Critical'),
                        ),
                      ],
                      onChanged: (value) => setDialogState(
                          () => selectedLevel = value ?? selectedLevel),
                      decoration:
                          const InputDecoration(labelText: 'Emergency Level'),
                    ),
                    DropdownButtonFormField<int>(
                      initialValue: selectedHospitalId,
                      isExpanded: true,
                      items: hospitals
                          .map(
                            (hospital) => DropdownMenuItem<int>(
                              value: hospital.id,
                              child: Text(
                                '${hospital.name} (${hospital.city ?? "-"})',
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: (value) =>
                          setDialogState(() => selectedHospitalId = value),
                      decoration: const InputDecoration(labelText: 'Hospital'),
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
                            await RecipientService(getIt()).updateProfile(
                              fullName: fullNameController.text,
                              phone: phoneController.text,
                              email: emailController.text,
                              requiredBloodGroup: selectedBloodGroup,
                              emergencyLevel: selectedLevel,
                              hospitalId: selectedHospitalId,
                            );
                            if (!context.mounted) return;
                            Navigator.pop(context);
                            if (!mounted) return;
                            setState(() {
                              _future = RecipientService(getIt()).getProfile();
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
      subtitle: 'Keep recipient details ready for matching.',
      icon: Icons.person_rounded,
      actions: [
        DashboardIconButton(
          icon: Icons.settings_rounded,
          onPressed: () =>
              Navigator.pushNamed(context, AppRoutes.recipientSettings),
        ),
      ],
      child: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const _LoadingView();
          final p = snapshot.data ?? {};
          final name = (p['full_name'] ?? '').toString();
          return ListView(
            padding: const EdgeInsets.fromLTRB(18, 0, 18, 22),
            children: [
              HeroSummaryCard(
                title: name.isEmpty ? 'Recipient Profile' : name,
                subtitle: 'Profile details used for blood request matching.',
                icon: Icons.badge_rounded,
                stats: [
                  StatItem(
                    value: (p['required_blood_group'] ?? '-').toString(),
                    label: 'Needed',
                    icon: Icons.water_drop_rounded,
                  ),
                  StatItem(
                    value: _titleCase(
                      normalizeRequestType(
                        (p['emergency_level'] ?? 'normal').toString(),
                      ),
                    ),
                    label: 'Priority',
                    icon: Icons.priority_high_rounded,
                  ),
                  const StatItem(
                    value: 'Ready',
                    label: 'Status',
                    icon: Icons.verified_rounded,
                  ),
                ],
              ),
              const SectionTitle(title: 'Recipient Details'),
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
                      icon: Icons.local_hospital_rounded,
                      label: 'Hospital',
                      value: (p['hospital_name'] ?? '-').toString(),
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

class RecipientSettingsScreen extends StatelessWidget {
  const RecipientSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MobileDashboardScaffold(
      title: 'Settings',
      subtitle: 'Manage your recipient session.',
      icon: Icons.settings_rounded,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(18, 0, 18, 22),
        children: [
          const HeroSummaryCard(
            title: 'Account Settings',
            subtitle: 'Your recipient account is ready for secure requests.',
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
                value: 'Patient',
                label: 'Role',
                icon: Icons.local_hospital_rounded,
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

class _RequestGroup extends StatelessWidget {
  const _RequestGroup({
    required this.title,
    required this.items,
    required this.emptyMessage,
  });

  final String title;
  final List<BloodRequestItem> items;
  final String emptyMessage;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionTitle(title: title),
        if (items.isEmpty)
          EmptyDashboardCard(
            icon: Icons.inbox_rounded,
            title: 'No $title requests',
            message: emptyMessage,
          )
        else
          ...items.map((item) => RequestCard(item: item)),
      ],
    );
  }
}

class _ResponseGroupCard extends StatelessWidget {
  const _ResponseGroupCard({required this.item});

  final Map<String, dynamic> item;

  @override
  Widget build(BuildContext context) {
    final request = item['request'] as Map<String, dynamic>? ?? {};
    final responses = (item['responses'] as List?) ?? const [];
    final bloodGroup = (request['blood_group'] ?? '-').toString();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: dashboardCardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  gradient: AppStyle.headerGradient,
                  borderRadius: BorderRadius.circular(17),
                ),
                child: const Icon(
                  Icons.bloodtype_rounded,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Request #${request['id'] ?? '-'}',
                      style: const TextStyle(
                        color: AppStyle.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$bloodGroup blood request',
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
                label:
                    '${responses.length} donor${responses.length == 1 ? '' : 's'}',
                color: const Color(0xFF4B5A78),
                icon: Icons.groups_rounded,
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (responses.isEmpty)
            const Text(
              'No donor responses for this request yet.',
              style: TextStyle(
                color: AppStyle.textMuted,
                fontWeight: FontWeight.w600,
              ),
            )
          else
            ...responses.take(3).map((entry) {
              final row = Map<String, dynamic>.from(entry as Map);
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 17,
                      backgroundColor:
                          AppStyle.redPrimary.withValues(alpha: 0.10),
                      child: const Icon(
                        Icons.person_rounded,
                        color: AppStyle.redPrimary,
                        size: 19,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        (row['donor_name'] ?? 'Donor').toString(),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppStyle.textPrimary,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    StatusPill(
                      label: _titleCase(
                        (row['response_status'] ?? '-').toString(),
                      ),
                      color: _statusColor(
                        (row['response_status'] ?? '').toString(),
                      ),
                    ),
                  ],
                ),
              );
            }),
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

int _totalResponses(List<Map<String, dynamic>> items) {
  return items.fold<int>(0, (total, item) {
    return total + (((item['responses'] as List?) ?? const []).length);
  });
}

String _titleCase(String value) {
  final cleaned = value.trim();
  if (cleaned.isEmpty) return '-';
  return cleaned[0].toUpperCase() + cleaned.substring(1).toLowerCase();
}

Color _statusColor(String status) {
  switch (status.toLowerCase()) {
    case 'accepted':
    case 'matched':
    case 'completed':
      return const Color(0xFF16835D);
    case 'declined':
    case 'rejected':
    case 'cancelled':
      return AppStyle.redPrimary;
    default:
      return const Color(0xFFB65B00);
  }
}
