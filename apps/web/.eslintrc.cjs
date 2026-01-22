module.exports = {
  root: false,
  env: {
    es2022: true,
    browser: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: "latest"
  },
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react/recommended"],
  settings: {
    react: {
      version: "detect"
    }
  },
  ignorePatterns: ["dist", "node_modules"]
};
