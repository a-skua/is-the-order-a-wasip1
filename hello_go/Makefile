wasm_exec.js:
	cp "$(shell go env GOROOT)/misc/wasm/wasm_exec.js" .

hello: hello.go
	go build $<

hello.wasm: hello.go
	GOARCH=wasm GOOS=js go build -o $@ $<

hello.wasi.wasm: hello.go
	GOARCH=wasm GOOS=wasip1 go build -o $@ $<

run_wasi.js: bundle.ts run_wasi.ts
	deno run --allow-read --allow-write --allow-net --allow-env --allow-run $<
