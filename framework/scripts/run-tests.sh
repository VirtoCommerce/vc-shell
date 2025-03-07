#!/bin/bash

# Запускаем тесты с помощью Vitest
echo "Running tests for DraggableDashboard component..."
cd $(dirname $0)/..
npx vitest run shared/components/draggable-dashboard/__tests__ --reporter=verbose

# Запускаем тесты с покрытием
echo "Running tests with coverage..."
npx vitest run shared/components/draggable-dashboard/__tests__ --coverage

echo "Tests completed!"
