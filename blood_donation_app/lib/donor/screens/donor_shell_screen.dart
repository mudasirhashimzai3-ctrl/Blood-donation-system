import 'package:blood_donation_app/core/di/injection.dart';
import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/services/app_services.dart';
import 'package:blood_donation_app/shared/app_routes.dart';
import 'package:blood_donation_app/shared/ui/app_style.dart';
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
      const _DonorHomeScreen(),
      const _DonorDonateScreen(),
      const _DonorHistoryScreen(),
      const _DonorProfileScreen(),
      const _DonorSettingsScreen(),
    ];
    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        type: BottomNavigationBarType.fixed,
        onTap: (value) => setState(() => _index = value),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.favorite), label: 'Donate'),
          BottomNavigationBarItem(icon: Icon(Icons.history), label: 'History'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }
}

class _DonorHomeScreen extends StatefulWidget {
  const _DonorHomeScreen();

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Donor Home'),
        foregroundColor: Colors.white,
        flexibleSpace: Container(
          decoration: const BoxDecoration(gradient: AppStyle.headerGradient),
        ),
        actions: [
          IconButton(
            onPressed: () => Navigator.pushNamed(context, AppRoutes.notifications),
            icon: const Icon(Icons.notifications),
          ),
        ],
      ),
      body: SafeArea(
      child: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final data = snapshot.data ?? {};
final nearby = (data['nearbyRequests'] as List?)?.cast<BloodRequestItem>() ?? const [];
           return RefreshIndicator(
             onRefresh: () async {
               setState(() => _future = DonorService(getIt()).getDashboard());
             },
             child: ListView(
               padding: const EdgeInsets.all(14),
               children: [
                 const Text('Nearby Blood Requests', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                 ...nearby.take(3).map((e) => RequestCard(item: e)),
                 const SizedBox(height: 12),
                 Text('Notifications: ${data['unreadNotifications'] ?? 0} unread'),
               ],
             ),
           );
        },
      ),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Donate')),
      body: FutureBuilder<List<DonationItem>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final items = snapshot.data ?? const [];
          if (items.isEmpty) {
            return const Center(child: Text('No pending donation requests'));
          }
          return ListView.builder(
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return Card(
                margin: const EdgeInsets.all(10),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Hospital: ${item.hospitalName ?? '-'}'),
                      Text('Blood: ${item.requestBloodGroup ?? '-'}'),
                      Text('Distance: ${item.distanceKm.toStringAsFixed(1)} km'),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () async {
                                await DonorService(getIt()).respondToDonation(
                                  donationId: item.id,
                                  action: 'decline',
                                );
                                if (!mounted) return;
                                setState(() => _future = DonorService(getIt()).getDonationRequests());
                              },
                              child: const Text('Reject'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: FilledButton(
                              onPressed: () async {
                                await DonorService(getIt()).respondToDonation(
                                  donationId: item.id,
                                  action: 'accept',
                                );
                                if (!mounted) return;
                                setState(() => _future = DonorService(getIt()).getDonationRequests());
                              },
                              child: const Text('Accept'),
                            ),
                          ),
                        ],
                      ),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('History')),
      body: FutureBuilder<List<DonationItem>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final items = snapshot.data ?? const [];
          if (items.isEmpty) return const Center(child: Text('No previous donations'));
          return ListView(
            children: items
                .map(
                  (e) => ListTile(
                    title: Text(e.hospitalName ?? 'Hospital'),
                    subtitle: Text('Status: ${e.status}'),
                    trailing: Text(e.requestBloodGroup ?? ''),
                  ),
                )
                .toList(),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          final p = snapshot.data ?? {};
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Text('${p['first_name'] ?? ''} ${p['last_name'] ?? ''}', style: const TextStyle(fontSize: 22)),
              const SizedBox(height: 8),
              Text('Blood Group: ${p['blood_group'] ?? '-'}'),
              Text('Phone: ${p['phone'] ?? '-'}'),
              Text('Address: ${p['local_address_city'] ?? p['permanent_address_city'] ?? '-'}'),
              const Text('Availability: Always Available'),
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
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: Center(
        child: FilledButton(
          onPressed: () async {
            await AuthService(getIt()).logout();
            if (!context.mounted) return;
            Navigator.pushNamedAndRemoveUntil(context, AppRoutes.login, (route) => false);
          },
          child: const Text('Logout'),
        ),
      ),
    );
  }
}
