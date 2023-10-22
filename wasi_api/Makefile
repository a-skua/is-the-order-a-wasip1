.PHONY: init
init: command.wasm index.js

index.js: bundle.ts index.ts preview1.ts typedef.ts
	deno run --allow-read --allow-write --allow-net --allow-env --allow-run $<

%.wasm: %.wat
	wat2wasm  -o $@ $<
