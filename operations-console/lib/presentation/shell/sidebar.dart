import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/routing/route_paths.dart';

/// Shared navigation destination for the application shell.
class ShellNavItem {
  const ShellNavItem({
    required this.label,
    required this.icon,
    this.route,
    this.enabled = true,
  });

  final String label;
  final IconData icon;
  final String? route;
  final bool enabled;
}

/// Navigation destinations shown across sidebar, rail, and drawer.
const List<ShellNavItem> shellNavItems = [
  ShellNavItem(
    label: 'Dashboard',
    icon: Icons.dashboard_outlined,
    route: RoutePaths.root,
    enabled: true,
  ),
  ShellNavItem(
    label: 'Requests',
    icon: Icons.inbox_outlined,
    enabled: false,
  ),
  ShellNavItem(
    label: 'Files',
    icon: Icons.folder_outlined,
    enabled: false,
  ),
  ShellNavItem(
    label: 'Workflow',
    icon: Icons.account_tree_outlined,
    enabled: false,
  ),
  ShellNavItem(
    label: 'Settings',
    icon: Icons.settings_outlined,
    route: RoutePaths.settings,
    enabled: false,
  ),
];

int shellNavSelectedIndex(String location) {
  for (var i = 0; i < shellNavItems.length; i++) {
    final item = shellNavItems[i];
    if (item.route != null && _routeMatches(location, item.route!)) {
      return i;
    }
  }
  return 0;
}

bool _routeMatches(String location, String route) {
  if (route == '/') {
    return location == '/';
  }
  return location.startsWith(route);
}

class AppSidebar extends StatelessWidget {
  const AppSidebar({
    super.key,
    required this.selectedIndex,
  });

  final int selectedIndex;

  static const double width = 240;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return SizedBox(
      width: width,
      child: Material(
        color: colorScheme.surfaceContainerLow,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'RWPST Motion',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  Text(
                    'Operations Console',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: colorScheme.onSurfaceVariant,
                        ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 8),
                itemCount: shellNavItems.length,
                itemBuilder: (context, index) {
                  final item = shellNavItems[index];
                  final selected = selectedIndex == index;

                  return Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 2,
                    ),
                    child: ListTile(
                      leading: Icon(item.icon),
                      title: Text(item.label),
                      selected: selected,
                      enabled: item.enabled,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      onTap: item.enabled && item.route != null
                          ? () => context.go(item.route!)
                          : null,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
