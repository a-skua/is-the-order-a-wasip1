import { assertEquals } from "https://deno.land/std@0.202.0/assert/mod.ts";
import {
  Arg,
  Env,
  isCommand,
  isDefaultEntry,
  isMultipleKinds,
} from "./preview1.ts";

Deno.test("isDefaultEntry@function #1", () => {
  const actual = isDefaultEntry(() => {});
  assertEquals(actual, true);
});

Deno.test("isDefaultEntry@function #2", () => {
  const actual = isDefaultEntry((foo: number) => foo * 2);
  assertEquals(actual, true);
});

Deno.test("isDefaultEntry@number", () => {
  const actual = isDefaultEntry(1);
  assertEquals(actual, false);
});

Deno.test("isDefaultEntry@undefined", () => {
  const actual = isDefaultEntry(undefined);
  assertEquals(actual, false);
});

Deno.test("isCommand@command", () => {
  const actual = isCommand({
    exports: { _start: () => {} },
  });
  assertEquals(actual, true);
});

Deno.test("isCommand@number", () => {
  const actual = isCommand(1);
  assertEquals(actual, false);
});

Deno.test("isMultipleKinds@multiple", () => {
  const actual = isMultipleKinds({
    exports: { _initialize: () => {}, _start: () => {} },
  });
  assertEquals(actual, true);
});

Deno.test("isMultipleKinds@command", () => {
  const actual = isMultipleKinds({
    exports: { _start: () => {} },
  });
  assertEquals(actual, false);
});

Deno.test("isMultipleKinds@reactor", () => {
  const actual = isMultipleKinds({
    exports: { _initialize: () => {} },
  });
  assertEquals(actual, false);
});

Deno.test("Env.toString()", () => {
  const actual = `${new Env("FOO", "BAR")}`;
  assertEquals(actual, "FOO=BAR\0");
});

Deno.test("Env.buffer.length #1", () => {
  const actual = new Env("FOO", "BAR").buffer.length;
  assertEquals(actual, 8);
});

Deno.test("Env.buffer.length #2", () => {
  const actual = new Env("FOO", "𩸽").buffer.length;
  assertEquals(actual, 9);
});

Deno.test("Arg.toString()", () => {
  const actual = `${new Arg("-h")}`;
  assertEquals(actual, "-h\0");
});
