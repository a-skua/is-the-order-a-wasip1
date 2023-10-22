const filepath = new URL(
  "../target/wasm32-unknown-unknown/release/hello.wasm",
  import.meta.url,
);

const textDecoder = new TextDecoder();

function write(pointer, length) {
  console.log(
    textDecoder.decode(memory?.subarray(pointer, pointer + length)),
  );
}

const imports = {
  syscall: {
    write,
  },
};

const { instance } = await WebAssembly.instantiateStreaming(
  fetch(filepath),
  imports,
);

const memory = new Uint8Array(instance?.exports?.memory?.buffer);

instance?.exports?.exec();
