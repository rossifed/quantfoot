{% macro validate_constraints() %}

{%- set schema = target.schema -%}

-- ==============================================
-- VALIDATE DATABASE CONSTRAINTS
-- ==============================================

DO $$
DECLARE
    constraint_count INTEGER;
    index_count INTEGER;
    orphan_count INTEGER;
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'VALIDATING MART CONSTRAINTS';
    RAISE NOTICE '==============================================';
    
    -- Check Primary Keys
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE constraint_schema = '{{ schema }}'
    AND constraint_type = 'PRIMARY KEY'
    AND table_name IN ('players', 'teams', 'fixtures');
    
    RAISE NOTICE '';
    RAISE NOTICE '1. PRIMARY KEYS: % found (expected: 3)', constraint_count;
    IF constraint_count < 3 THEN
        RAISE WARNING '   ❌ Missing primary keys!';
    ELSE
        RAISE NOTICE '   ✅ All primary keys present';
    END IF;
    
    -- Check Foreign Keys
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE constraint_schema = '{{ schema }}'
    AND constraint_type = 'FOREIGN KEY';
    
    RAISE NOTICE '';
    RAISE NOTICE '2. FOREIGN KEYS: % found (expected: 3+)', constraint_count;
    IF constraint_count < 3 THEN
        RAISE WARNING '   ❌ Missing foreign keys!';
    ELSE
        RAISE NOTICE '   ✅ Foreign keys present';
    END IF;
    
    -- Check Indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = '{{ schema }}'
    AND tablename IN ('players', 'teams', 'fixtures');
    
    RAISE NOTICE '';
    RAISE NOTICE '3. INDEXES: % found', index_count;
    IF index_count < 10 THEN
        RAISE WARNING '   ⚠️  Consider adding more indexes for performance';
    ELSE
        RAISE NOTICE '   ✅ Good index coverage';
    END IF;
    
    -- Check for orphan players (team_id not in teams)
    SELECT COUNT(*) INTO orphan_count
    FROM {{ schema }}.players p
    WHERE p.team_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM {{ schema }}.teams t 
        WHERE t.team_id = p.team_id
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '4. ORPHAN PLAYERS: % found', orphan_count;
    IF orphan_count > 0 THEN
        RAISE WARNING '   ❌ Data integrity issue: players with invalid team_id';
    ELSE
        RAISE NOTICE '   ✅ No orphan records';
    END IF;
    
    -- Check for orphan fixtures
    SELECT COUNT(*) INTO orphan_count
    FROM {{ schema }}.fixtures f
    WHERE NOT EXISTS (
        SELECT 1 FROM {{ schema }}.teams t 
        WHERE t.team_id = f.home_team_id
    )
    OR NOT EXISTS (
        SELECT 1 FROM {{ schema }}.teams t 
        WHERE t.team_id = f.away_team_id
    );
    
    RAISE NOTICE '';
    RAISE NOTICE '5. ORPHAN FIXTURES: % found', orphan_count;
    IF orphan_count > 0 THEN
        RAISE WARNING '   ❌ Data integrity issue: fixtures with invalid teams';
    ELSE
        RAISE NOTICE '   ✅ No orphan fixtures';
    END IF;
    
    -- Check for duplicate primary keys (shouldn't happen with PK constraint)
    SELECT COUNT(*) - COUNT(DISTINCT player_id) INTO orphan_count
    FROM {{ schema }}.players;
    
    RAISE NOTICE '';
    RAISE NOTICE '6. DUPLICATE PLAYER IDS: % found', orphan_count;
    IF orphan_count > 0 THEN
        RAISE WARNING '   ❌ Critical: Duplicate player_id values!';
    ELSE
        RAISE NOTICE '   ✅ No duplicates';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'VALIDATION COMPLETE';
    RAISE NOTICE '==============================================';
END $$;

-- Show detailed constraint info
SELECT 
    tc.constraint_name,
    tc.table_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_schema = '{{ schema }}'
    AND tc.table_name IN ('players', 'teams', 'fixtures')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

{% endmacro %}
