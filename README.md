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
```

You can use basic operations (e.g. +, -, \*, /, %, ^ etc.) in you expressions.

### Examples

- 175 + 175 \* 18% + 40 = 246.5
- 10 + (100 - 100 \* 18%) \* 5 + 40 / 20 = 422

> _NOTE_: Floating points must be handled carefully. Use `Number(<number>).toFixed(<digits>)` to fix the digits after
> decimal point.

## Api

### evalExpr

This is the default and only from this package.

```js
evalExpr(expressions: string)
```
