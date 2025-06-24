#!/bin/bash

# Run tests with Vitest
echo "Running tests for DraggableDashboard component..."
cd $(dirname $0)/..
npx vitest run shared/components/draggable-dashboard/__tests__ --reporter=verbose

# Run tests with coverage
echo "Running tests with coverage..."
npx vitest run shared/components/draggable-dashboard/__tests__ --coverage

echo "Tests completed!"
