# Testing Guide

## Running Tests

```bash
npm test
```

## Test Coverage

**Created test files:**
1. `validator.spec.ts` - UI-Plan validation (23 tests) ✅
2. `planner.spec.ts` - URL generation, naming (NEW) 
3. `schema-validation.spec.ts` - Component type validation (NEW)
4. `naming.spec.ts` - File/component naming rules (NEW)
5. `components.spec.ts` - Component registry tests (NEW)

**Total:** 36 tests covering:
- ✅ UI-Plan validation
- ✅ toSingular() function
- ✅ URL generation (plural/singular)
- ✅ Component types (VcTable, VcForm)
- ✅ File naming patterns
- ✅ Component registry
- ✅ Fictional components prevention

## Known Issues

Some tests need updating for:
- Old "Form"/"DataTable" → "VcForm"/"VcTable"
- Old "Text"/"Email" → "VcInput"

**Status:** Tests created, minor fixes needed ⚠️

Run tests after each change to verify fixes!

