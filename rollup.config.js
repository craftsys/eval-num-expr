import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";

export default [
  // UMD
  {
    input: "src/index.ts",
    output: {
      name: "evalNumExpr",
      file: pkg.browser,
      format: "umd",
    },
    plugins: [typescript({ sourceMap: false })],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  {
    input: "src/index.ts",
    output: [
      { file: pkg.main, format: "cjs", exports: "auto" },
      { file: pkg.module, format: "es" },
    ],
    plugins: [typescript({ sourceMap: false })],
  },
];
