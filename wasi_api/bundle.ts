import * as esbuild from "https://deno.land/x/esbuild@v0.19.3/mod.js";

await esbuild.build({
  entryPoints: ["./index.ts"],
  outfile: "./index.js",
  format: "esm",
  bundle: true,
});

esbuild.stop();
