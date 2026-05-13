import 'package:blood_donation_app/shared/ui/app_style.dart';
import 'package:flutter/material.dart';

class RoleChoiceCard extends StatelessWidget {
  const RoleChoiceCard({
    super.key,
    required this.title,
    required this.description,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final String description;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? AppStyle.softRose : AppStyle.pureWhite,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected ? AppStyle.redPrimary : const Color(0xFFFFC1CB),
            width: selected ? 2 : 1,
          ),
          boxShadow: const [
            BoxShadow(
              color: Color(0x14000000),
              blurRadius: 8,
              offset: Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            CircleAvatar(
              backgroundColor: selected ? AppStyle.redPrimary : AppStyle.softRose,
              child: Icon(icon, color: selected ? Colors.white : AppStyle.redPrimary),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: const TextStyle(color: AppStyle.textMuted),
                  ),
                ],
              ),
            ),
            if (selected) const Icon(Icons.check_circle, color: AppStyle.redPrimary),
          ],
        ),
      ),
    );
  }
}
