import evalNumExpr from "./index";

describe("Evaluate Numerical Expressions", () => {
  it("Basic Input", () => {
    expect(evalNumExpr("1+1+2*4/2")).toBe(6);
    expect(evalNumExpr("1+2^4")).toBe(17);
    expect(evalNumExpr("100 + 100*18%")).toBe(118);
    expect(evalNumExpr("-1-1-1")).toBe(-3);
    expect(evalNumExpr("18%")).toBe(0.18);
  });
  it("Handle decimal points", () => {
    expect(evalNumExpr("1+1.3")).toBe(2.3);
  });
  it("Handle spaces", () => {
    expect(evalNumExpr("1 +1 +2  * 4/2")).toBe(6);
  });

  it("Handles missing operands at end", () => {
    expect(evalNumExpr(" 5 + 5 *")).toBe(10);
    expect(evalNumExpr(" 5 + 5 /")).toBe(10);
    expect(evalNumExpr(" (5 + 5) /")).toBe(10);
    expect(evalNumExpr(" (5 + 5) %")).toBe(0.1);
    expect(evalNumExpr("*1")).toBe(1);
    expect(evalNumExpr("-1")).toBe(-1);
  });

  it("Handles missing operands at the begining", () => {
    expect(evalNumExpr("*1")).toBe(1);
    expect(evalNumExpr("-1")).toBe(-1);
    expect(evalNumExpr("2 + (-3 * 3)")).toBe(-7);
  });

  it("Grouping via parenthesis", () => {
    expect(evalNumExpr("1 +(3)")).toBe(4);
    expect(evalNumExpr("1 +(1 +2) * 4/2")).toBe(7);
    expect(evalNumExpr("3 * ((4 + 2) / 2)")).toEqual(9);
    expect(evalNumExpr("3 + 128 x 2 / ( 1 - 3 ) ^ 2 ^ 2")).toEqual(19);
  });

  it("Throws expressions for invalid inputs", () => {
    expect(() => evalNumExpr("1 +(1 +2)) * 4/2")).toThrow();
    expect(() => evalNumExpr("1 + 2 (3)")).toThrowError("Missing operators.");
    expect(() => evalNumExpr("1(3)")).toThrowError("Missing operators.");
  });
});
