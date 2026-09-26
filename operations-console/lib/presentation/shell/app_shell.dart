import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_breakpoints.dart';
import 'navigation_drawer.dart';
import 'sidebar.dart';
import 'top_bar.dart';

enum ShellLayout { mobile, tablet, desktop }

ShellLayout shellLayoutForWidth(double width) {
  if (width >= AppBreakpoints.desktop) {
    return ShellLayout.desktop;
  }
  if (width >= AppBreakpoints.mobile) {
    return ShellLayout.tablet;
  }
  return ShellLayout.mobile;
}

class AppShell extends StatelessWidget {
  const AppShell({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    final selectedIndex = shellNavSelectedIndex(location);

    return LayoutBuilder(
      builder: (context, constraints) {
        final layout = shellLayoutForWidth(constraints.maxWidth);

        return switch (layout) {
          ShellLayout.desktop => _DesktopShell(
              selectedIndex: selectedIndex,
              child: child,
            ),
          ShellLayout.tablet => _TabletShell(
              selectedIndex: selectedIndex,
              child: child,
            ),
          ShellLayout.mobile => _MobileShell(
              selectedIndex: selectedIndex,
              child: child,
            ),
        };
      },
    );
  }
}

class _DesktopShell extends StatelessWidget {
  const _DesktopShell({
    required this.selectedIndex,
    required this.child,
  });

  final int selectedIndex;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          AppSidebar(selectedIndex: selectedIndex),
          const VerticalDivider(width: 1),
          Expanded(
            child: Column(
              children: [
                const AppTopBar(),
                Expanded(child: child),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TabletShell extends StatelessWidget {
  const _TabletShell({
    required this.selectedIndex,
    required this.child,
  });

  final int selectedIndex;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar(),
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: selectedIndex,
            labelType: NavigationRailLabelType.all,
            onDestinationSelected: (index) => _onNavSelected(context, index),
            destinations: [
              for (final item in shellNavItems)
                NavigationRailDestination(
                  icon: Icon(item.icon),
                  label: Text(item.label),
                  disabled: !item.enabled,
                ),
            ],
          ),
          const VerticalDivider(width: 1),
          Expanded(child: child),
        ],
      ),
    );
  }
}

class _MobileShell extends StatefulWidget {
  const _MobileShell({
    required this.selectedIndex,
    required this.child,
  });

  final int selectedIndex;
  final Widget child;

  @override
  State<_MobileShell> createState() => _MobileShellState();
}

class _MobileShellState extends State<_MobileShell> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppTopBar(
        showMenuButton: true,
        onMenuPressed: () => _scaffoldKey.currentState?.openDrawer(),
      ),
      drawer: AppNavigationDrawer(selectedIndex: widget.selectedIndex),
      body: widget.child,
    );
  }
}

void _onNavSelected(BuildContext context, int index) {
  final item = shellNavItems[index];
  if (!item.enabled || item.route == null) {
    return;
  }
  context.go(item.route!);
}
