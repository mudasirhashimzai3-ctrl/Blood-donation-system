import 'package:blood_donation_app/models/app_models.dart';
import 'package:flutter/material.dart';

class RequestCard extends StatelessWidget {
  const RequestCard({
    super.key,
    required this.item,
    this.trailing,
  });

  final BloodRequestItem item;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    final emergencyColor = item.isEmergency ? Colors.red : Colors.green;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    item.hospitalName ?? 'Unknown Hospital',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: emergencyColor.withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    item.isEmergency ? 'Emergency' : 'Normal',
                    style: TextStyle(
                      color: emergencyColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('Blood: ${item.bloodGroup}   Units: ${item.unitsNeeded}'),
            Text('Status: ${item.status}   Type: ${item.requestType}'),
            if (trailing != null) ...[
              const SizedBox(height: 8),
              trailing!,
            ],
          ],
        ),
      ),
    );
  }
}
