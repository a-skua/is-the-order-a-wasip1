import runtime from "./preview1.ts";

const result = await runtime(Deno.args[0])
  .catch((e) => {
    console.log(e);
    Deno.exit(1);
  });
console.log(result);
