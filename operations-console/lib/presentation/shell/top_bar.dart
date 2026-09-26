import 'package:flutter/material.dart';

class AppTopBar extends StatelessWidget implements PreferredSizeWidget {
  const AppTopBar({
    super.key,
    this.showMenuButton = false,
    this.onMenuPressed,
  });

  final bool showMenuButton;
  final VoidCallback? onMenuPressed;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      leading: showMenuButton
          ? IconButton(
              icon: const Icon(Icons.menu),
              onPressed: onMenuPressed,
            )
          : null,
      title: Column(
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
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
      actions: const [
        IconButton(
          icon: Icon(Icons.brightness_6_outlined),
          tooltip: 'Theme toggle',
          onPressed: null,
        ),
        IconButton(
          icon: Icon(Icons.account_circle_outlined),
          tooltip: 'User',
          onPressed: null,
        ),
        SizedBox(width: 8),
      ],
    );
  }
}
