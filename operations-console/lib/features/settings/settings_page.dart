import 'package:flutter/material.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Settings',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600),
          ),
          SizedBox(height: 8),
          Text('Placeholder'),
        ],
      ),
    );
  }
}
