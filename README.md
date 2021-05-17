# Evaluate Numerical Expressions

## Installation

```
npm install --save eval-num-expr
```

## Usage

```js
import evalExpr from "eval-num-expr";

const value = evalExpr("100 + 3 * 55 + 73 - 73 * 18%");
// value = 324.86

// With Invalid Expressions handling
try {
  const value = evalExpr("100 + (3 * 55");
} catch (e) {
  // Will throw an exception for invalid expressions
  console.error(e.message)
}
```

You can use basic operations (e.g. +, -, \*, /, %, ^ etc.) in you expressions.

### Examples

- 175 + 175 \* 18% + 40 = 246.5
- 10 + (100 - 100 \* 18%) \* 5 + 40 / 20 = 422

> _NOTE_: Floating points must be handled carefully. Use `Number(<number>).toFixed(<digits>)` to fix the digits after
> decimal point.

## Api

> This package supports TypeScript.

### evalExpr

This is the default and only export from this package.

```typescript
/**
 * Evaluate numeric mathematical expression
 * @param string expression - The expression to evaluate ("24 + 65 * 3 - 48")
 * @return number - The evaluated value.
 *
 * @throws Will throw an error if the expression in invalid.
 * 
 * NOTE: When passing floating points, please handle the digits after decimal point
 * e.g. 2 - 1.1 leads to 0.8999999999999999 intead of .9
 */
evalExpr(expressions: string)
```
