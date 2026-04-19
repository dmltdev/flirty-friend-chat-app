<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## **Naming conventions:**

- Component files use **PascalCase** (e.g., `MyComponent.tsx`). **Exception:** primitive components under `src/components/ui/` (shadcn scaffolds) keep their original kebab-case filenames — don't rename them.
- Hook files use **kebab-case** with `use-` prefix (e.g., `use-my-hook.ts`).
- Variables and functions use **camelCase**.
- Interfaces use **PascalCase** (e.g., `MyInterface`).
- Types use **PascalCase** without prefixes (e.g., `MyType`).
- Enum values use **PascalCase** (e.g., `MyEnum.SomeValue`).
- Constants use **SCREAMING_SNAKE_CASE**.
- Event handlers start with `handle` (e.g., `handleClick`).
- CSS classes follow Tailwind conventions or kebab-case for custom classes.
- Directory names use **kebab-case**.
- Service objects use **camelCase** (e.g., `myService`). **If violated:** Blocking - request renaming (file/symbol) with a minimal diff.
