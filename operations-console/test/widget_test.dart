import 'package:flutter_test/flutter_test.dart';

import 'package:operations_console/app.dart';

void main() {
  testWidgets('Dashboard page smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const OperationsConsoleApp());
    await tester.pumpAndSettle();

    expect(find.text('Foundation Phase'), findsOneWidget);
    expect(find.text('RWPST Motion'), findsWidgets);
  });
}
