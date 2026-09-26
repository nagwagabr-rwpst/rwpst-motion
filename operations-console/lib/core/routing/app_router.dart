import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/application/auth_providers.dart';
import '../../features/auth/domain/auth_status.dart';
import '../../features/auth/login_page.dart';
import '../../features/dashboard/dashboard_page.dart';
import '../../features/settings/settings_page.dart';
import '../../presentation/shell/app_shell.dart';
import 'route_paths.dart';

final class GoRouterRefreshNotifier extends ChangeNotifier {
  void refresh() => notifyListeners();
}

abstract final class AppRouter {
  static final appRouterProvider = Provider<GoRouter>((ref) {
    final refreshNotifier = GoRouterRefreshNotifier();

    ref.listen(authControllerProvider, (_, _) {
      refreshNotifier.refresh();
    });

    ref.onDispose(refreshNotifier.dispose);

    return GoRouter(
      initialLocation: RoutePaths.root,
      refreshListenable: refreshNotifier,
      redirect: (context, state) {
        final authState = ref.read(authControllerProvider);
        final isLoginRoute = state.matchedLocation == RoutePaths.login;

        switch (authState.status) {
          case AuthStatus.unknown:
          case AuthStatus.loading:
            return null;
          case AuthStatus.authenticated:
            return isLoginRoute ? RoutePaths.root : null;
          case AuthStatus.unauthenticated:
          case AuthStatus.error:
            return isLoginRoute ? null : RoutePaths.login;
        }
      },
      routes: [
        GoRoute(
          path: RoutePaths.login,
          builder: (context, state) => const LoginPage(),
        ),
        ShellRoute(
          builder: (context, state, child) => AppShell(child: child),
          routes: [
            GoRoute(
              path: RoutePaths.root,
              builder: (context, state) => const DashboardPage(),
            ),
            GoRoute(
              path: RoutePaths.settings,
              builder: (context, state) => const SettingsPage(),
            ),
          ],
        ),
      ],
    );
  });
}
