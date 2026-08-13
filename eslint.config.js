import neostandard from "neostandard";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import noCommentedCode from "eslint-plugin-no-commented-code";

export default [
  ...neostandard({
    env: ["node", "jest", "browser"],
    ignores: ["app/frontend/dist/**/*", ".public/**/*"],
  }),
  eslintConfigPrettier,
  {
    plugins: { import: importPlugin },
    rules: {
      "import/extensions": ["error", "always", { ignorePackages: true }],
    },
  },
  {
    plugins: { "no-commented-code": noCommentedCode },
    rules: {
      "no-commented-code/no-commented-code": "error",
    },
  },
];
