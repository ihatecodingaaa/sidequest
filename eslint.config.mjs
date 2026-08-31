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
  ]),
  {
    /*
     * The submission tooling under `docs/` is plain CommonJS run by Node, not
     * app source. It legitimately uses `require()`, and the TypeScript rule
     * banning it was failing `npm run verify` for the whole repository from the
     * commit that added those scripts. Scoping the exemption to `docs/` keeps
     * the rule doing its job everywhere it is actually about ESM, which is
     * everywhere a bundler is involved.
     */
    files: ["docs/**/*.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
]);

export default eslintConfig;
