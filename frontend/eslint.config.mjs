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
    // Custom rules configuration
    rules: {
      // Ignore implicit any type errors
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // Alternative: Warn but don't fail for implicit any
      "@typescript-eslint/no-implicit-any-catch": "warn",

      // If you want to completely disable no-explicit-any
      "no-explicit-any": "off",
    },
    settings: {
      // Additional settings if needed
    },
  },
]);

export default eslintConfig;
