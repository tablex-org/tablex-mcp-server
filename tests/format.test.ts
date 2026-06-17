import test from "node:test";
import assert from "node:assert/strict";
import { mdTable, redactConnectionURI } from "../src/format.js";

test("redactConnectionURI removes credentials", () => {
  const redacted = redactConnectionURI("postgresql://user:secret@example.com:5432/app");
  assert.equal(redacted, "example.com:5432/app");
  assert.equal(redacted.includes("secret"), false);
  assert.equal(redacted.includes("user:"), false);
});

test("mdTable renders rows", () => {
  const table = mdTable(["Name", "Type"], [["prod", "postgresql"]]);
  assert.match(table, /\| Name \| Type \|/);
  assert.match(table, /\| prod \| postgresql \|/);
});
