import 'package:blood_donation_app/core/constants/app_constants.dart';
import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/services/app_services.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/ui/error_message.dart';
import 'package:blood_donation_app/shared/ui/app_style.dart';
import 'package:blood_donation_app/shared/widgets/request_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

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
      const _RecipientHomeScreen(),
      const _CreateRequestScreen(),
      const _MyRequestsScreen(),
      const _ResponsesScreen(),
      const _RecipientProfileScreen(),
    ];
    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        type: BottomNavigationBarType.fixed,
        onTap: (value) => setState(() => _index = value),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(
              icon: Icon(Icons.add_circle), label: 'Create'),
          BottomNavigationBarItem(
              icon: Icon(Icons.list_alt), label: 'Requests'),
          BottomNavigationBarItem(icon: Icon(Icons.group), label: 'Responses'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class _RecipientHomeScreen extends StatefulWidget {
  const _RecipientHomeScreen();

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recipient Home'),
        foregroundColor: Colors.white,
        flexibleSpace: Container(
          decoration: const BoxDecoration(gradient: AppStyle.headerGradient),
        ),
        actions: [
          IconButton(
            onPressed: () =>
                Navigator.pushNamed(context, AppRoutes.notifications),
            icon: const Icon(Icons.notifications),
          ),
        ],
      ),
      body: SafeArea(
        child: FutureBuilder<Map<String, dynamic>>(
          future: _future,
          builder: (context, snapshot) {
            if (!snapshot.hasData)
              return const Center(child: CircularProgressIndicator());
            final data = snapshot.data ?? {};
            final active =
                (data['activeRequests'] as List?)?.cast<BloodRequestItem>() ??
                    const [];
            final emergency = (data['emergencyRequests'] as List?)
                    ?.cast<BloodRequestItem>() ??
                const [];
            return RefreshIndicator(
              onRefresh: () async => setState(
                  () => _future = RecipientService(getIt()).getDashboard()),
              child: ListView(
                padding: const EdgeInsets.all(14),
                children: [
                  const Text('Active Requests',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ...active.take(3).map((e) => RequestCard(item: e)),
                  const SizedBox(height: 12),
                  const Text('Emergency Requests',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ...emergency.take(3).map((e) => RequestCard(item: e)),
                  const SizedBox(height: 12),
                  Text(
                      'Notifications: ${data['unreadNotifications'] ?? 0} unread'),
                ],
              ),
            );
          },
        ),
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
  final _hospitalController = TextEditingController();
  final _unitsController = TextEditingController(text: '1');
  String _bloodGroup = AppConstants.bloodTypes.first;
  String _level = 'normal';
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _prefillBloodGroupFromProfile();
  }

  Future<void> _prefillBloodGroupFromProfile() async {
    try {
      final profile = await RecipientService(getIt()).getProfile();
      final preferred = profile['required_blood_group']?.toString().trim();
      if (!mounted || preferred == null || preferred.isEmpty) {
        return;
      }
      if (!AppConstants.bloodTypes.contains(preferred)) {
        return;
      }
      setState(() => _bloodGroup = preferred);
    } catch (_) {}
  }

  @override
  void dispose() {
    _hospitalController.dispose();
    _unitsController.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    final hospitalId = int.tryParse(_hospitalController.text.trim());
    final units = int.tryParse(_unitsController.text.trim()) ?? 1;
    if (hospitalId == null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Enter hospital ID')));
      return;
    }
    if (_bloodGroup.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Blood group is required')));
      return;
    }
    setState(() => _loading = true);
    try {
      await RecipientService(getIt()).createRequest(
        hospitalId: hospitalId,
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
    return Scaffold(
      appBar: AppBar(title: const Text('Create Request')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: _hospitalController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Hospital ID'),
          ),
          DropdownButtonFormField<String>(
            value: _bloodGroup,
            items: AppConstants.bloodTypes
                .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                .toList(),
            onChanged: (v) => setState(
                () => _bloodGroup = v ?? AppConstants.bloodTypes.first),
            decoration: const InputDecoration(labelText: 'Blood Type'),
          ),
          TextField(
            controller: _unitsController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Units'),
          ),
          DropdownButtonFormField<String>(
            value: _level,
            items: const [
              DropdownMenuItem(value: 'normal', child: Text('Normal')),
              DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
              DropdownMenuItem(value: 'critical', child: Text('Critical')),
            ],
            onChanged: (v) => setState(() => _level = v ?? 'normal'),
            decoration: const InputDecoration(labelText: 'Emergency Level'),
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _loading ? null : _create,
            child: _loading
                ? const CircularProgressIndicator()
                : const Text('Create Request'),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Requests')),
      body: FutureBuilder<List<BloodRequestItem>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData)
            return const Center(child: CircularProgressIndicator());
          final items = snapshot.data ?? const [];
          final pending = items.where((e) => e.status == 'pending').toList();
          final accepted = items.where((e) => e.status == 'matched').toList();
          final completed =
              items.where((e) => e.status == 'completed').toList();
          return ListView(
            padding: const EdgeInsets.all(12),
            children: [
              const Text('Pending',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              ...pending.map((e) => RequestCard(item: e)),
              const Text('Accepted',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              ...accepted.map((e) => RequestCard(item: e)),
              const Text('Completed',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              ...completed.map((e) => RequestCard(item: e)),
            ],
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Donor Responses')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData)
            return const Center(child: CircularProgressIndicator());
          final items = snapshot.data ?? const [];
          if (items.isEmpty)
            return const Center(child: Text('No responses yet'));
          return ListView.builder(
            itemCount: items.length,
            itemBuilder: (context, index) {
              final request =
                  items[index]['request'] as Map<String, dynamic>? ?? {};
              final responses =
                  (items[index]['responses'] as List?) ?? const [];
              return Card(
                margin: const EdgeInsets.all(10),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Request #${request['id']} - ${request['blood_group'] ?? ''}',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 8),
                      ...responses.take(3).map((entry) {
                        final row = entry as Map<String, dynamic>;
                        return Text(
                          '${row['donor_name']}: ${row['response_status']} (${row['donation_status'] ?? '-'})',
                        );
                      }),
                    ],
                  ),
                ),
              );
            },
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            onPressed: () =>
                Navigator.pushNamed(context, AppRoutes.recipientSettings),
            icon: const Icon(Icons.settings),
          ),
        ],
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData)
            return const Center(child: CircularProgressIndicator());
          final p = snapshot.data ?? {};
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text((p['full_name'] ?? '').toString(),
                  style: const TextStyle(fontSize: 22)),
              const SizedBox(height: 8),
              Text('Phone: ${p['phone'] ?? '-'}'),
              Text('Required Blood Group: ${p['required_blood_group'] ?? '-'}'),
              Text('Hospital: ${p['hospital_name'] ?? '-'}'),
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
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: Center(
        child: FilledButton(
          onPressed: () async {
            await AuthService(getIt()).logout();
            if (!context.mounted) return;
            Navigator.pushNamedAndRemoveUntil(
                context, AppRoutes.login, (route) => false);
          },
          child: const Text('Logout'),
        ),
      ),
    );
  }
}
