#!/usr/bin/env node

import evalNumExpr from "../src/index";

const [, , ...args] = process.argv;

if (args.length) {
  const str = args.join("");
  const value = evalNumExpr(str);
  process.stdout.write(`${str} = ${value}\n`);
} else {
  process.stderr.write("Error: Please provide an expression to evaluate");
}
