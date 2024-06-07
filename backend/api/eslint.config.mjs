import globals from "globals";
import tseslint from "typescript-eslint";


export default [
  {files: ["**/*.ts"], languageOptions: {sourceType: "script"}},
  {languageOptions: { globals: globals.browser }},
  ...tseslint.configs.recommended,
];