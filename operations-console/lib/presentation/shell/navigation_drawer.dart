import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'sidebar.dart';

class AppNavigationDrawer extends StatelessWidget {
  const AppNavigationDrawer({
    super.key,
    required this.selectedIndex,
  });

  final int selectedIndex;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Drawer(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          DrawerHeader(
            decoration: BoxDecoration(color: colorScheme.primaryContainer),
            child: Align(
              alignment: Alignment.bottomLeft,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.end,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'RWPST Motion',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: colorScheme.onPrimaryContainer,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  Text(
                    'Operations Console',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: colorScheme.onPrimaryContainer,
                        ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.zero,
              itemCount: shellNavItems.length,
              itemBuilder: (context, index) {
                final item = shellNavItems[index];
                return ListTile(
                  leading: Icon(item.icon),
                  title: Text(item.label),
                  selected: selectedIndex == index,
                  enabled: item.enabled,
                  onTap: item.enabled && item.route != null
                      ? () {
                          context.go(item.route!);
                          Navigator.of(context).pop();
                        }
                      : null,
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
