import 'package:blood_donation_app/models/app_models.dart';
import 'package:blood_donation_app/shared/ui/app_style.dart';
import 'package:blood_donation_app/shared/widgets/mobile_dashboard_widgets.dart';
import 'package:flutter/material.dart';

String _titleCase(String value) {
  if (value.isEmpty) return value;
  return value[0].toUpperCase() + value.substring(1).toLowerCase();
}

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
    final emergencyColor =
        item.isEmergency ? AppStyle.redPrimary : const Color(0xFF16835D);
    final requestType = _titleCase(item.requestType.isEmpty
        ? (item.isEmergency ? 'Emergency' : 'Normal')
        : item.requestType);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: dashboardCardDecoration(),
      child: Padding(
        padding: const EdgeInsets.all(15),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    gradient: item.isEmergency
                        ? AppStyle.headerGradient
                        : const LinearGradient(
                            colors: [Color(0xFF1DAF7A), Color(0xFF0E7C5C)],
                          ),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Icon(
                    Icons.bloodtype_rounded,
                    color: Colors.white,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.hospitalName ?? 'Unknown Hospital',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppStyle.textPrimary,
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        'Request #${item.id}',
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
                  label: item.isEmergency ? 'Emergency' : 'Normal',
                  color: emergencyColor,
                  icon: item.isEmergency
                      ? Icons.priority_high_rounded
                      : Icons.check_circle_rounded,
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: _RequestMeta(
                    icon: Icons.water_drop_rounded,
                    label: 'Blood',
                    value: item.bloodGroup.isEmpty ? '-' : item.bloodGroup,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _RequestMeta(
                    icon: Icons.inventory_2_rounded,
                    label: 'Units',
                    value: formatBloodRequestUnits(item.unitsNeeded),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _RequestMeta(
                    icon: Icons.local_activity_rounded,
                    label: 'Type',
                    value: requestType,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            StatusPill(
              label: 'Status: ${_titleCase(item.status)}',
              color: const Color(0xFF4B5A78),
              icon: Icons.timelapse_rounded,
            ),
            if (trailing != null) ...[
              const SizedBox(height: 12),
              trailing!,
            ],
          ],
        ),
      ),
    );
  }
}

class _RequestMeta extends StatelessWidget {
  const _RequestMeta({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 70),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7F8),
        borderRadius: BorderRadius.circular(17),
        border: Border.all(color: const Color(0xFFFFE0E6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppStyle.redPrimary, size: 18),
          const SizedBox(height: 6),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppStyle.textPrimary,
              fontSize: 14,
              fontWeight: FontWeight.w900,
            ),
          ),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: AppStyle.textMuted,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
