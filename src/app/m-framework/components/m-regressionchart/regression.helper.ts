// Least-squares polynomial regression helpers used by m-regressionchart.

// Fits a polynomial of the given degree to (x, y) data and returns its
// coefficients in ascending power order: [a0, a1, ..., aDegree].
export function polynomialRegression(
  xData: number[],
  yData: number[],
  degree: number
): number[] {
  const n = xData.length;
  const cols = degree + 1;

  // Build the Vandermonde matrix and solve the normal equations
  // (XtX) * coeffs = Xty via Gaussian elimination.
  const XtX: number[][] = Array.from({ length: cols }, () => new Array(cols).fill(0));
  const Xty: number[] = new Array(cols).fill(0);

  for (let row = 0; row < n; row++) {
    const powers: number[] = new Array(cols);
    powers[0] = 1;
    for (let p = 1; p < cols; p++) {
      powers[p] = powers[p - 1] * xData[row];
    }
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < cols; j++) {
        XtX[i][j] += powers[i] * powers[j];
      }
      Xty[i] += powers[i] * yData[row];
    }
  }

  return solveLinearSystem(XtX, Xty);
}

// Evaluates a polynomial (ascending power coefficients) at x.
export function evaluatePolynomial(coeffs: number[], x: number): number {
  let result = 0;
  let power = 1;
  for (const c of coeffs) {
    result += c * power;
    power *= x;
  }
  return result;
}

// Gaussian elimination with partial pivoting.
function solveLinearSystem(matrix: number[][], rhs: number[]): number[] {
  const n = rhs.length;
  const a = matrix.map((row, i) => [...row, rhs[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(a[r][col]) > Math.abs(a[pivot][col])) pivot = r;
    }
    [a[col], a[pivot]] = [a[pivot], a[col]];

    const pivotVal = a[col][col];
    if (pivotVal === 0) continue;

    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = a[r][col] / pivotVal;
      for (let c = col; c <= n; c++) {
        a[r][c] -= factor * a[col][c];
      }
    }
  }

  return a.map((row, i) => (a[i][i] !== 0 ? row[n] / a[i][i] : 0));
}
