# Agent Guidelines for models.dev

## Commands

- **Validate**: `bun validate` - Validates all provider/model configurations
- **Build web**: `cd packages/web && bun run build` - Builds the web interface
- **Dev server**: `cd packages/web && bun run dev` - Runs development server
- **No test framework** - No dedicated test commands found

## Code Style

- **Runtime**: Bun with TypeScript ESM modules
- **Imports**: Use `.js` extensions for local imports (e.g., `./schema.js`)
- **Types**: Strict Zod schemas for validation, inferred types with `z.infer<typeof Schema>`
- **Naming**: camelCase for variables/functions, PascalCase for types/schemas
- **Error handling**: Use Zod's `safeParse()` with structured error objects including `cause`
- **Async**: Use `async/await`, `for await` loops for file operations
- **File operations**: Use Bun's native APIs (`Bun.Glob`, `Bun.file`, `Bun.write`)

## Architecture

- **Monorepo**: Workspace packages in `packages/` (core, web, function)
- **Config**: TOML files for providers/models in `providers/` directory
- **Validation**: Core package validates all configurations via `generate()` function
- **Web**: Static site generation with Hono server and vanilla TypeScript
- **Deploy**: Cloudflare Workers for function, static assets for web

## Conventions

- Use `export interface` for API types, `export const Schema = z.object()` for validation
- Prefix unused variables with underscore or use `_` for ignored parameters
- Handle undefined values explicitly in comparisons and sorting
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe property access

## Web Table Columns

The models table header and rows are schema-driven: add/reorder columns in one place and the UI stays in sync.

- **Step 1 (Schema)**: Add a new `ColumnKey` and `columns` entry in [packages/web/src/table-schema.ts](packages/web/src/table-schema.ts)
  - Pick `type`: `text` | `number` | `boolean` | `modalities` (drives sorting via `data-type`)
  - Optional: set `desc` to add the small gray sublabel under the header
- **Step 2 (Row Data)**: Ensure the value exists in the client-side row context in [packages/web/src/index.ts](packages/web/src/index.ts)
  - If needed, extend `RowCtx` and populate it inside `populateTableFromApi()`
  - If the value is not present in `/api.json`, you’ll need to add it to the generator output in `packages/core` first
- **Step 3 (Cell Rendering)**: Implement the column rendering in `cellHtml(key, ctx)` in [packages/web/src/index.ts](packages/web/src/index.ts)
  - Keep output stable for sorting: numbers should be parseable (e.g. `1,234` or `$0.25`), booleans should be `Yes`/`No`/`-`
- **Step 4 (Search Index)**: Add the searchable value in `searchValue(key, ctx)` in [packages/web/src/index.ts](packages/web/src/index.ts)
  - This feeds the per-row `data-search` string used by filtering
- **Step 5 (Verify)**: Run `cd packages/web && bun run build` and check that sort + search behave as expected

Notes:

- The sort URL param name is derived from the header label’s text (first ~2 words); renaming a header changes existing shareable sort URLs.
- If you need a new column type, extend `ColumnType` in [packages/web/src/table-schema.ts](packages/web/src/table-schema.ts) and update `getCellValue()` in [packages/web/src/index.ts](packages/web/src/index.ts).
