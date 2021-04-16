/**
 * https://en.wikipedia.org/wiki/Shunting-yard_algorithm
 */
export default function evalNumExpr(
  amount: string,
  digitsAfterDecimal: number = 2
): number {
  // operators with Precedence and Associativity
  const operators = [
    new Operator("-", 2),
    new Operator("+", 2),
    new Operator("/", 3),
    new Operator("*", 3),
    new Operator("^", 4),
  ];
  const tokens = tokenize(amount);
  const outputQueue = new Queue<string>();
  const operatorsStack = new Stack<OperatorFns | "(" | ")">();
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const operator = operators.find((op) => op.fn === token);
    if (!isNaN(Number(token))) {
      outputQueue.push(token);
    } else if (operator) {
      while (
        !operatorsStack.isEmpty() &&
        operatorsStack.top() !== "(" &&
        (operators
          .find((op) => op.fn === operatorsStack.top())
          ?.hasGreaterPrecedenceThan(operator) ||
          (operators
            .find((op) => op.fn === operatorsStack.top())
            ?.hasSamePrecedenceTo(operator) &&
            operator.isLeftAssociative()))
      ) {
        outputQueue.push(operatorsStack.pop());
      }
      operatorsStack.push(operator.fn);
    } else if (token === "(") {
      operatorsStack.push("(");
    } else if (token === ")") {
      while (!operatorsStack.isEmpty() && operatorsStack.top() !== "(") {
        outputQueue.push(operatorsStack.pop());
      }
      if (operatorsStack.top() === "(") {
        operatorsStack.pop();
      }
      if (operatorsStack.isEmpty()) {
        /* If the stack runs out without finding a left parenthesis, then there are mismatched parentheses. */
        throw new Error(`Missing "("`);
      }
    }
  }
  /* After while loop, if operator stack not null, pop everything to output queue */
  while (!operatorsStack.isEmpty()) {
    /* If the operator token on the top of the stack is a parenthesis, then there are mismatched parentheses. */
    if (operatorsStack.top() === "(" || operatorsStack.top() === ")") {
      // mismatched
      throw new Error(`Mismatch "${operatorsStack.top()}"`);
    } else {
      outputQueue.push(operatorsStack.pop());
    }
  }
  // outputQueue is in Reverse Polish notation (RPN)
  // https://en.wikipedia.org/wiki/Reverse_Polish_notation
  // now get the value
  const values = new Stack<number>();
  const firstValue: number = Number(outputQueue.pop());
  if (isNaN(firstValue)) {
    throw new Error(`First value should be a numeric value`);
  }
  values.push(firstValue);
  while (!outputQueue.isEmpty()) {
    const token = outputQueue.pop();
    if (!isNaN(Number(token)) && isFinite(Number(token))) {
      values.push(Number(token));
    } else {
      const operator = new Operator(token as any, 1);
      const a = values.pop();
      const b = values.pop();
      const value = operator.calculate(b, a);
      if (!isNaN(value)) {
        values.push(value);
      } else {
        console.error(`Invalid value: ${value}`);
      }
    }
  }
  if (values.length() > 1) {
    // stack has more than one number and we are out of operators
    throw new Error("Missing operators.");
  }
  return normalizeNumber(values.pop(), digitsAfterDecimal);
}

function normalizeNumber(
  n: number,
  digitsAfterDecimal: number | undefined = 2
): number {
  let str = n.toString();
  if (digitsAfterDecimal !== undefined) {
    str = Number(str).toFixed(digitsAfterDecimal).toString();
  }
  if (parseInt(str) === parseFloat(str)) {
    str = parseInt(str).toString();
  }
  return Number(str);
}
type OperatorFns = "-" | "+" | "/" | "*" | "^";

class Operator {
  static readonly LEFT_ASSOCIATIVE = 0;
  static readonly RIGHT_ASSOCIATIVE = 1;

  fn;
  precedence;
  associativity;

  constructor(fn: OperatorFns, precedence: number) {
    this.fn = fn;
    this.precedence = precedence;
    switch (fn) {
      case "-":
      case "+":
      case "*":
      case "/":
        this.associativity = Operator.LEFT_ASSOCIATIVE;
        break;
      case "^":
        this.associativity = Operator.RIGHT_ASSOCIATIVE;
        break;
      default:
        throw new Error(`Unknown operator ${fn}`);
    }
  }

  hasGreaterPrecedenceThan(op: Operator) {
    return this.precedence > op.precedence;
  }

  hasSamePrecedenceTo(op: Operator) {
    return this.precedence === op.precedence;
  }

  isLeftAssociative() {
    return this.associativity === Operator.LEFT_ASSOCIATIVE;
  }

  protected cast(operand?: number): number {
    if (operand === undefined) {
      switch (this.fn) {
        case "+":
        case "-":
          operand = 0;
          break;
        case "*":
        case "/":
        case "^":
          operand = 1;
          break;
      }
    }
    return Number(operand);
  }

  calculate(operandA?: number, operandB?: number): number {
    switch (this.fn) {
      case "+":
        return (operandA || 0) + (operandB || 0);
      case "-":
        return (operandA || 0) - (operandB || 0);
      case "*":
        return (operandA || 1) * (operandB || 1);
      case "/":
        return (operandA || 1) / (operandB || 1);
      case "^":
        return Math.pow(operandA || 1, operandB || 1);
    }
  }
}

function tokenize(amount: string): Array<OperatorFns | "(" | ")" | string> {
  // sanitize the amount
  amount = amount
    .replace(/\s/gi, "") // replace all spaces
    .replace(/(\d+)%/gi, "($1/100)") // replace percentage
    .replace(/[xX]/gi, "*") // replace the x with multiplier *
    .replace(/[^+-/*^\d().]/g, "")
    // i have no idea why commas were not replaced :(
    // it works in Test Env (NodeJs)
    .replace(/,/g, "");
  const keywords = ["-", "+", "/", "*", "^", "(", ")"];
  const tokens = [];
  let holding: string = "";
  for (let i = 0; i < amount.length; i++) {
    const char = amount[i];
    if (keywords.indexOf(char) !== -1) {
      if (holding) {
        tokens.push(holding);
        holding = "";
      }
      tokens.push(char);
    } else {
      holding += char;
    }
  }
  if (holding) {
    tokens.push(holding);
  }
  return tokens;
}

///////////////////////////////////////////////////
//// Data Structures
//////////////////////////////////////////////////

class Queue<T = any> {
  protected items: Array<T> = [];
  push(item: T) {
    this.items.push(item);
  }
  pop(): T {
    const item = this.items.shift();
    if (!item) {
      throw new Error("Queue is empty");
    }
    return item;
  }
  isEmpty() {
    return this.items.length === 0;
  }

  top(): T {
    return this.items[0];
  }

  toString() {
    return JSON.stringify(this.items);
  }
}

class Stack<T = any> {
  protected items: Array<T> = [];
  push(item: T) {
    this.items.push(item);
  }
  pop(): T {
    return this.items.splice(-1)[0];
  }
  top(): T {
    return this.items[this.items.length - 1];
  }
  length(): number {
    return this.items.length;
  }
  isEmpty() {
    return this.items.length === 0;
  }
  toString() {
    return JSON.stringify(this.items);
  }
}
