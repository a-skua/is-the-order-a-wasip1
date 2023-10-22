import * as esbuild from "https://deno.land/x/esbuild@v0.19.3/mod.js";

await esbuild.build({
  entryPoints: ["./run_wasi.ts"],
  outfile: "./run_wasi.js",
  format: "esm",
  bundle: true,
});

esbuild.stop();
