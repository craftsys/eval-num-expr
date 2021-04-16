import evalNumExpr from "./index";

describe("Evaluate Numerical Expressions", () => {
  it("Basic Input", () => {
    expect(evalNumExpr("1+1+2*4/2")).toBe(6);
    expect(evalNumExpr("1+2^4")).toBe(17);
    expect(evalNumExpr("100 + 100*18%")).toBe(118);
    expect(evalNumExpr("-1-1-1")).toBe(-3);
  });
  it("Handle decimal points", () => {
    expect(evalNumExpr("1+1.3")).toBe(2.3);
  });
  it("Handle spaces", () => {
    expect(evalNumExpr("1 +1 +2  * 4/2")).toBe(6);
  });

  it("Grouping via parenthesis", () => {
    expect(evalNumExpr("1 +(1 +2) * 4/2")).toBe(7);
    expect(evalNumExpr("3 * ((4 + 2) / 2)")).toEqual(9);
    expect(evalNumExpr("3 + 4 x 2 / ( 1 - 5 ) ^ 2 ^ 3")).toEqual(3);
  });

  it("Throws expressions for invalid inputs", () => {
    expect(() => evalNumExpr("1 +(1 +2)) * 4/2")).toThrow();
    expect(() => evalNumExpr("*")).toThrow(
      "First value should be a numeric value"
    );
    expect(() => evalNumExpr("1 + 2 (3)")).toThrowError("Missing operators.");
  });
});
