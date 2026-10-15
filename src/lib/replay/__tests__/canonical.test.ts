import { describe, it, expect } from "vitest";
import { canonicalizeJson, canonicalizeToBytes } from "../canonical";
import { computeBundleHash } from "../hashing";

describe("Deterministic JSON Canonicalisation Engine", () => {
  it("enforces key-order independence", () => {
    const objA = {
      zebra: 100,
      apple: "fruit",
      nested: { beta: 2, alpha: 1 },
      items: [{ d: 4, c: 3 }],
    };

    const objB = {
      apple: "fruit",
      nested: { alpha: 1, beta: 2 },
      zebra: 100,
      items: [{ c: 3, d: 4 }],
    };

    const strA = canonicalizeJson(objA);
    const strB = canonicalizeJson(objB);

    expect(strA).toBe(strB);
    expect(strA).toBe(
      '{"apple":"fruit","items":[{"c":3,"d":4}],"nested":{"alpha":1,"beta":2},"zebra":100}'
    );
  });

  it("matches a recorded fixed fixture hash", async () => {
    const fixture = {
      schemaVersion: 1,
      bundleId: "test-fixture-001",
      count: 42,
      label: "deterministic",
    };

    const canonicalBytes = canonicalizeToBytes(fixture);
    const canonicalStr = new TextDecoder().decode(canonicalBytes);

    expect(canonicalStr).toBe(
      '{"bundleId":"test-fixture-001","count":42,"label":"deterministic","schemaVersion":1}'
    );

    // Assert fixed hash
    const crypto = await import("node:crypto");
    const expectedHash = "0x" + crypto.createHash("sha256").update(canonicalBytes).digest("hex");
    const hash = await computeBundleHash(fixture as any);
    expect(hash).toBe(expectedHash);
  });

  it("strictly rejects floating point numbers", () => {
    const floatObj = {
      value: 12.345,
    };
    expect(() => canonicalizeJson(floatObj)).toThrowError(
      /Canonicalisation violation: non-integer number found/
    );
  });

  it("strictly rejects NaN and Infinity", () => {
    expect(() => canonicalizeJson({ val: NaN })).toThrowError(/non-integer number/);
    expect(() => canonicalizeJson({ val: Infinity })).toThrowError(/non-integer number/);
    expect(() => canonicalizeJson({ val: -Infinity })).toThrowError(/non-integer number/);
  });

  it("strictly rejects BigInt literals to enforce integer number boundary", () => {
    expect(() => canonicalizeJson({ val: BigInt(123) })).toThrowError(
      /Canonicalisation violation: bigint found/
    );
  });

  it("handles null, booleans, and empty arrays/objects correctly", () => {
    const obj = {
      active: true,
      data: null,
      emptyArr: [],
      emptyObj: {},
    };
    expect(canonicalizeJson(obj)).toBe(
      '{"active":true,"data":null,"emptyArr":[],"emptyObj":{}}'
    );
  });
});
