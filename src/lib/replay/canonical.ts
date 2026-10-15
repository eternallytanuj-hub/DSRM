/**
 * Deterministic JSON Canonicalisation Engine
 * Strictly enforces integer-only values (rejects IEEE 754 floats / NaN / Infinity).
 * Recursively sorts keys alphabetically and outputs compact UTF-8 bytes.
 */

function validateAndSort(val: unknown, path = "root"): unknown {
  if (val === null || val === undefined) {
    return null;
  }

  if (typeof val === "number") {
    if (!Number.isFinite(val) || !Number.isInteger(val)) {
      throw new Error(
        `Canonicalisation violation: non-integer number found at '${path}': ${val}`
      );
    }
    return val;
  }

  if (typeof val === "boolean" || typeof val === "string") {
    return val;
  }

  if (typeof val === "bigint") {
    throw new Error(
      `Canonicalisation violation: bigint found at '${path}'. Convert to integer number.`
    );
  }

  if (Array.isArray(val)) {
    return val.map((item, i) => validateAndSort(item, `${path}[${i}]`));
  }

  if (typeof val === "object") {
    const keys = Object.keys(val as Record<string, unknown>).sort();
    const sortedObj: Record<string, unknown> = {};
    for (const key of keys) {
      const childVal = (val as Record<string, unknown>)[key];
      if (childVal !== undefined) {
        sortedObj[key] = validateAndSort(
          childVal,
          path === "root" ? key : `${path}.${key}`
        );
      }
    }
    return sortedObj;
  }

  throw new Error(
    `Canonicalisation violation: unsupported type '${typeof val}' at '${path}'`
  );
}

/**
 * Returns canonical JSON string with sorted keys and no whitespace.
 */
export function canonicalizeJson(obj: unknown): string {
  const sorted = validateAndSort(obj);
  return JSON.stringify(sorted);
}

/**
 * Returns canonical UTF-8 bytes representation of the JSON object.
 */
export function canonicalizeToBytes(obj: unknown): Uint8Array {
  const canonicalString = canonicalizeJson(obj);
  return new TextEncoder().encode(canonicalString);
}
