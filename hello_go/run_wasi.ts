import { Fd, WASI } from "@bjorn3/browser_wasi_shim";
import { Ciovec } from "@bjorn3/browser_wasi_shim/typings/wasi_defs.js";

class Stdout extends Fd {
  decoder = new TextDecoder();
  fd_write(view8: Uint8Array, iovs: Array<Ciovec>): {
    ret: number;
    nwritten: number;
  } {
    let nwritten = 0;
    for (const iovec of iovs) {
      console.log(
        this.decoder.decode(
          view8.subarray(iovec.buf, iovec.buf + iovec.buf_len),
        ),
      );
      nwritten += iovec.buf_len;
    }
    return {
      ret: 0,
      nwritten,
    };
  }
}

const wasi = new WASI([], [], [new Fd(), new Stdout(), new Fd()]);

const { instance } = await WebAssembly.instantiateStreaming(
  fetch(new URL("./hello.wasi.wasm", import.meta.url)),
  {
    wasi_snapshot_preview1: wasi.wasiImport,
  },
);

// deno-lint-ignore no-explicit-any
function isInstance(instance: any): instance is {
  exports: {
    memory: WebAssembly.Memory;
    // deno-lint-ignore no-explicit-any
    _start: () => any;
  };
} {
  return instance?.exports?.memory instanceof WebAssembly.Memory &&
    typeof instance?.exports?._start === "function";
}

if (isInstance(instance)) wasi.start(instance);
