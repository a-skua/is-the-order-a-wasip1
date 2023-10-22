import runtime, { Arg, Env } from "./preview1.ts";

const path = "hello.wasi.wasm";

const env = [
  new Env("FOO", "foo"),
  new Env("RUST_BACKTRACE", "1"),
  new Env("BAR", "bar"),
];

const args = [
  new Arg(path),
  new Arg("-h"),
];

const exitcode = await runtime(path, env, args);
console.log(`exit ${exitcode}`);
