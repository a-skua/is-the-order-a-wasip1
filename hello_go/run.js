import "./wasm_exec.js";

const filepath = new URL(
  "./hello.wasm",
  import.meta.url,
);

const go = new Go();

const { instance } = await WebAssembly.instantiateStreaming(
  fetch(filepath),
  go.importObject,
);

go.run(instance);
