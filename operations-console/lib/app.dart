import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/application/auth_providers.dart';

class OperationsConsoleApp extends ConsumerStatefulWidget {
  const OperationsConsoleApp({super.key});

  @override
  ConsumerState<OperationsConsoleApp> createState() =>
      _OperationsConsoleAppState();
}

class _OperationsConsoleAppState extends ConsumerState<OperationsConsoleApp> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(authControllerProvider.notifier).initialize(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(AppRouter.appRouterProvider);

    return MaterialApp.router(
      title: 'RWPST Motion Operations Console',
      theme: AppTheme.light,
      routerConfig: router,
    );
  }
}
