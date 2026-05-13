import 'package:blood_donation_app/shared/ui/app_style.dart';
import 'package:flutter/material.dart';

class GradientScaffold extends StatelessWidget {
  const GradientScaffold({
    super.key,
    required this.child,
    this.title,
    this.appBarActions,
  });

  final Widget child;
  final String? title;
  final List<Widget>? appBarActions;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: title == null
          ? null
          : AppBar(
              title: Text(title!),
              foregroundColor: Colors.white,
              actions: appBarActions,
              flexibleSpace: Container(
                decoration: const BoxDecoration(gradient: AppStyle.headerGradient),
              ),
            ),
      body: Container(
        decoration: const BoxDecoration(gradient: AppStyle.pageGradient),
        child: SafeArea(child: child),
      ),
    );
  }
}
