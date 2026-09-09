import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scratch worktrees are whole copies of the repo, build output and all.
    // The ignores above are root-relative, so without this `npm run lint`
    // walks into every worktree and reports thousands of problems that CI,
    // running on a fresh checkout, never sees.
    ".claude/**",
  ]),
]);

export default eslintConfig;
