import 'package:flutter/material.dart';
import 'package:blood_donation_app/core/theme/app_colors.dart';
import 'package:blood_donation_app/core/theme/app_dimensions.dart';
import 'package:blood_donation_app/core/theme/app_text_styles.dart';
import 'package:blood_donation_app/core/widgets/buttons/app_button.dart';

class AppDialog extends StatelessWidget {

  const AppDialog({
    super.key,
    required this.title,
    this.message,
    this.content,
    this.confirmLabel = 'Confirm',
    this.cancelLabel = 'Cancel',
    this.onConfirm,
    this.onCancel,
    this.isDangerous = false,
    this.showCancel = true,
  });
  final String title;
  final String? message;
  final Widget? content;
  final String confirmLabel;
  final String cancelLabel;
  final VoidCallback? onConfirm;
  final VoidCallback? onCancel;
  final bool isDangerous;
  final bool showCancel;

  static Future<bool?> show(
    BuildContext context, {
    required String title,
    String? message,
    Widget? content,
    String confirmLabel = 'Confirm',
    String cancelLabel = 'Cancel',
    VoidCallback? onConfirm,
    bool isDangerous = false,
    bool showCancel = true,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (_) => AppDialog(
        title: title,
        message: message,
        content: content,
        confirmLabel: confirmLabel,
        cancelLabel: cancelLabel,
        onConfirm: onConfirm,
        isDangerous: isDangerous,
        showCancel: showCancel,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(title, style: AppTextStyles.headlineSmall),
      content:
          content ??
          (message != null
              ? Text(
                  message!,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                )
              : null),
      contentPadding: const EdgeInsets.fromLTRB(
        AppDimensions.lg,
        AppDimensions.md,
        AppDimensions.lg,
        0,
      ),
      actionsPadding: const EdgeInsets.all(AppDimensions.md),
      actions: [
        if (showCancel)
          AppButton(
            label: cancelLabel,
            variant: AppButtonVariant.outlined,
            onPressed: () {
              onCancel?.call();
              Navigator.of(context).pop(false);
            },
          ),
        const SizedBox(height: AppDimensions.sm),
        AppButton(
          label: confirmLabel,
          variant: isDangerous
              ? AppButtonVariant.danger
              : AppButtonVariant.primary,
          onPressed: () {
            onConfirm?.call();
            Navigator.of(context).pop(true);
          },
        ),
      ],
    );
  }
}
