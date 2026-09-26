export 'auth_controller.dart';
export 'auth_repository_provider.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/auth_state.dart';
import 'auth_controller.dart';

final authControllerProvider =
    NotifierProvider<AuthController, AuthState>(AuthController.new);
