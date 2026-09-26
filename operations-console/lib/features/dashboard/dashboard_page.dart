import 'package:flutter/material.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Dashboard',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600),
          ),
          SizedBox(height: 8),
          Text('Foundation Phase'),
        ],
      ),
    );
  }
}
