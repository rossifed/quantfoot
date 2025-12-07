#!/bin/bash

# Script to build marts with constraints and tests

set -e

echo "=========================================="
echo "Building dbt marts with constraints"
echo "=========================================="

# Navigate to dbt project
cd "$(dirname "$0")"

# Step 1: Build the marts (creates tables with indexes + post-hooks appliquent contraintes AUTO!)
echo ""
echo "Step 1: Building marts tables with automatic constraints..."
echo "   → post-hooks apply PK, FK, CHECK, NOT NULL automatically"
dbt build --select marts --target prod

# Step 2: Run tests to validate data quality
echo ""
echo "Step 2: Running data quality tests..."
dbt test --select marts --target prod

# Step 3: Validate constraints are in place
echo ""
echo "Step 3: Validating database constraints..."
dbt run-operation validate_constraints --target prod

# Step 4: Generate documentation
echo ""
echo "Step 4: Generating documentation..."
dbt docs generate --target prod

echo ""
echo "=========================================="
echo "✅ Marts built successfully with:"
echo "   - Unique indexes on primary keys"
echo "   - Non-unique indexes on foreign keys"
echo "   - Primary key constraints (via post-hooks)"
echo "   - Foreign key constraints (via post-hooks)"
echo "   - NOT NULL constraints (via post-hooks)"
echo "   - CHECK constraints (via post-hooks)"
echo "   - Data quality tests passed"
echo ""
echo "💡 NOTE: Constraints are applied AUTOMATICALLY"
echo "   after each 'dbt run' via post-hooks config!"
echo "   No need to run add_mart_constraints separately."
echo "=========================================="
