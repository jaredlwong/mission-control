/** @type {import("prettier").Config} */
module.exports = {
  plugins: [require.resolve("prettier-plugin-tailwindcss"), require.resolve("prettier-plugin-organize-imports")],
  semi: true,
  trailingComma: "all",
  printWidth: 120,
};
