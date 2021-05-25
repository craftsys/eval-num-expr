export default function evalNumExpr(amount: string): number {
  // operators with Precedence and Associativity
  const operators = [
    new Operator("-", 2),
    new Operator("+", 2),
    new Operator("add_percentage", 2),
    new Operator("sub_percentage", 2),
    new Operator("/", 3),
    new Operator("*", 3),
    new Operator("^", 4),
  ];
  const tokens = tokenize(amount);
  const outputQueue = new Queue<string | number>();
  const operatorsStack = new Stack<OperatorFns | "(" | ")">();
  /**
   * https://en.wikipedia.org/wiki/Shunting-yard_algorithm
   */
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const operator = operators.find((op) => op.fn === token);
    if (!isNaN(Number(token))) {
      outputQueue.push(token);
    } else if (operator) {
      // If we are the end, no need to handle this operator
      if (i === tokens.length - 1) {
        break;
      }
      /**
       * while ((there is an operator at the top of the operator stack)
       *   and ((the operator at the top of the operator stack has greater precedence)
       *       or (the operator at the top of the operator stack has equal precedence and the token is left associative))
       *   and (the operator at the top of the operator stack is not a left parenthesis)):
       */
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
      // push it onto the operator stack.
      operatorsStack.push(operator.fn);
    } else if (token === "(") {
      operatorsStack.push("(");
    } else if (token === ")") {
      while (!operatorsStack.isEmpty() && operatorsStack.top() !== "(") {
        outputQueue.push(operatorsStack.pop());
      }
      if (operatorsStack.top() === "(") {
        operatorsStack.pop();
      } else if (operatorsStack.isEmpty()) {
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
  return values.pop();
}

type OperatorFns =
  | "-"
  | "+"
  | "/"
  | "*"
  | "^"
  | "add_percentage"
  | "sub_percentage";

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
      case "add_percentage":
      case "sub_percentage":
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

  calculate(operandA?: number, operandB?: number): number {
    switch (this.fn) {
      case "+":
        return (operandA || 0) + (operandB || 0);
      case "-":
        return (operandA || 0) - (operandB || 0);
      case "add_percentage":
        return (operandA || 0) + ((operandA || 0) * (operandB || 0)) / 100;
      case "sub_percentage":
        return (operandA || 0) - ((operandA || 0) * (operandB || 0)) / 100;
      case "*":
        return (
          (typeof operandA !== "undefined" ? operandA : 1) *
          (typeof operandB !== "undefined" ? operandB : 1)
        );
      case "/":
        if (operandB === 0) {
          throw new Error(`Can not divide ${operandA} by zero`);
        }
        return (
          (typeof operandA !== "undefined" ? operandA : 1) / (operandB || 1)
        );
      case "^":
        if (operandA === 0 && operandB === 0) {
          throw new Error("0^0 is not a numeric value");
        }
        return Math.pow(
          typeof operandA !== "undefined" ? operandA : 1,
          typeof operandB !== "undefined" ? operandB : 1
        );
    }
  }
}

function tokenize(
  amount: string
): Array<OperatorFns | "(" | ")" | string | number> {
  // sanitize the amount
  amount = amount
    .replace(/\s/gi, "") // replace all spaces
    .replace(/[xX]/gi, "*") // replace the x with multiplier *
    .replace(/[^+-/*^\d().%]/g, "")
    .replace(/\+(\d+)%(?![*/(\d])/gi, "add_percentage$1")
    .replace(/-(\d+)%(?![*/(\d])/gi, "sub_percentage$1")
    .replace(/%([\d(])/gi, "/100*$1")
    .replace(/%/gi, "/100")
    // i have no idea why commas were not replaced :(
    // it works in Test Env (NodeJs)
    .replace(/,/g, "");
  const keywords = ["-", "+", "/", "*", "^", "%", "(", ")"];
  const tokens = [];
  let token: string = "";
  for (let i = 0; i < amount.length; i++) {
    const char = amount[i];
    const nextChar = amount[i + 1] || "";
    token += char;
    switch (true) {
      case !isNaN(Number(token)) &&
        Number.isFinite(Number(token)) &&
        isNaN(Number(nextChar)) &&
        nextChar !== ".":
        tokens.push(Number(token));
        token = "";
        break;
      case keywords.indexOf(token) !== -1:
        tokens.push(token);
        token = "";
        break;
      case token === "add_percentage":
      case token === "sub_percentage":
        tokens.push(token);
        token = "";
        break;
      default:
        break;
    }
  }
  if (token) {
    tokens.push(token);
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
}
