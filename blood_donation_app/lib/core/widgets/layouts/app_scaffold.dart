import 'package:flutter/material.dart';

class AppScaffold extends StatelessWidget {

  const AppScaffold({
    super.key,
    this.title,
    required this.body,
    this.actions,
    this.floatingActionButton,
    this.bottomNavigationBar,
    this.bottomSheet,
    this.showBackButton = true,
    this.resizeToAvoidBottomInset = true,
    this.backgroundColor,
    this.leading,
    this.appBar,
  });
  final String? title;
  final Widget body;
  final List<Widget>? actions;
  final Widget? floatingActionButton;
  final Widget? bottomNavigationBar;
  final Widget? bottomSheet;
  final bool showBackButton;
  final bool resizeToAvoidBottomInset;
  final Color? backgroundColor;
  final Widget? leading;
  final PreferredSizeWidget? appBar;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      resizeToAvoidBottomInset: resizeToAvoidBottomInset,
      floatingActionButton: floatingActionButton,
      bottomNavigationBar: bottomNavigationBar,
      bottomSheet: bottomSheet,
      appBar: appBar ??
          (title != null
              ? AppBar(
                  title: Text(title!),
                  actions: actions,
                  leading: leading ??
                      (showBackButton && Navigator.of(context).canPop()
                          ? const BackButton()
                          : null),
                  automaticallyImplyLeading: showBackButton,
                )
              : null),
      body: SafeArea(child: body),
    );
  }
}
