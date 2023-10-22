import { Clockid, Errno, Fd, Fdflags, Pointer, Timestamp } from "./typedef.ts";

const debug = {
  calls: [] as string[],
  stdout: "",
  stderr: "",
};

let memory: WebAssembly.Memory;

const encoder = new TextEncoder();

const decoder = new TextDecoder();

type Exitcode = number | undefined;

let exitcode: Exitcode;

function proc_exit(rval: Exitcode) {
  debug.calls.push("proc_exit");

  exitcode = rval;
  throw `exitcode: ${rval}`;
}

export class Env {
  buffer: Uint8Array;
  constructor(
    name: string,
    value: string,
  ) {
    this.buffer = encoder.encode(`${name}=${value}\0`);
  }

  public toString(): string {
    return decoder.decode(this.buffer);
  }
}

let environments: Env[];

function environ_get(env_p: Pointer, buf_p: Pointer): Errno {
  debug.calls.push("environ_get");

  const data = new DataView(memory.buffer);
  const buffer = new Uint8Array(memory.buffer);
  for (const e of environments) {
    data.setUint32(env_p, buf_p, true);
    env_p += 4;

    buffer.set(e.buffer, buf_p);
    buf_p += e.buffer.length;
  }
  return Errno.Success;
  // return Errno.Notsup;
}

function environ_sizes_get(num_p: Pointer, size_p: Pointer): Errno {
  debug.calls.push("environ_sizes_get");

  const data = new DataView(memory.buffer);
  data.setUint32(num_p, environments.length, true);
  data.setUint32(
    size_p,
    environments.reduce((l, e) => l + e.buffer.length, 0),
    true,
  );
  return Errno.Success;
}

export class Arg {
  buffer: Uint8Array;
  constructor(
    value: string,
  ) {
    this.buffer = encoder.encode(`${value}\0`);
  }

  public toString(): string {
    return decoder.decode(this.buffer);
  }
}

let args: Arg[];

function args_get(arg_p: Pointer, buf_p: Pointer): Errno {
  debug.calls.push("args_get");

  const data = new DataView(memory.buffer);
  const buffer = new Uint8Array(memory.buffer);
  for (const a of args) {
    data.setUint32(arg_p, buf_p, true);
    arg_p += 4;

    buffer.set(a.buffer, buf_p);
    buf_p += a.buffer.length;
  }
  return Errno.Success;
}

function args_sizes_get(num_p: Pointer, size_p: Pointer): Errno {
  debug.calls.push("args_sizes_get");

  const data = new DataView(memory.buffer);
  data.setUint32(num_p, args.length, true);
  data.setUint32(size_p, args.reduce((l, a) => l + a.buffer.length, 0), true);
  return Errno.Success;
}

function clock_time_get(
  id: Clockid,
  _precision: Timestamp,
  timestamp_p: Pointer,
): Errno {
  debug.calls.push("clock_time_get");

  switch (id) {
    case Clockid.Monotonic: {
      const time_ns = BigInt(Math.floor(performance.now() * 1_000_000));
      new DataView(memory.buffer).setBigUint64(timestamp_p, time_ns, true);
      return Errno.Success;
    }
    default:
      return Errno.Notsup;
  }
}

function random_get(buf_p: Pointer, len: number): Errno {
  debug.calls.push("random_get");

  crypto.getRandomValues(new Uint8Array(memory.buffer, buf_p, len));
  return Errno.Success;
}

function sched_yield(): Errno {
  debug.calls.push("sched_yield");

  return Errno.Notsup;
}

function poll_oneoff(
  _inz_p: Pointer,
  _out_p: Pointer,
  _nsubscriptions: number,
  _size_p: Pointer,
): Errno {
  debug.calls.push("poll_oneoff");

  return Errno.Notsup;
}

function fd_close(_fd: Fd): Errno {
  debug.calls.push("fd_close");

  return Errno.Notsup;
}

function fd_fdstat_get(_fd: Fd, _fdstat_p: Pointer): Errno {
  debug.calls.push("fd_fdstat_get");

  return Errno.Notsup;
}

function fd_fdstat_set_flags(_fd: Fd, _flags: Fdflags): Errno {
  debug.calls.push("fd_fdstat_set_flags");

  return Errno.Notsup;
}

function fd_prestat_get(_fd: Fd, _prestat_p: Pointer): Errno {
  debug.calls.push("fd_prestat_get");

  return Errno.Badf;
}

function fd_prestat_dir_name(_fd: Fd, _path_p: Pointer, _len: number): Errno {
  debug.calls.push("fd_prestat_dir_name");

  return Errno.Badf;
}

function fd_write(
  fd: Fd,
  iov_p: Pointer,
  iocnt: number,
  size_p: Pointer,
): Errno {
  debug.calls.push("fd_write");

  const data = new DataView(memory.buffer);
  let str = "";
  let strlen = 0;

  for (let i = 0; i < iocnt; i++) {
    const buf_p = data.getUint32(iov_p, true);
    const len = data.getUint32(iov_p + 4, true);

    str += decoder.decode(memory.buffer.slice(buf_p, buf_p + len));
    strlen += len;
    iov_p += 8;
  }

  switch (fd) {
    case Fd.Stdout:
      debug.stdout += str;
      console.log(str);
      break;
    case Fd.Stderr:
      debug.stderr += str;
      console.error(str);
      break;
    default:
      return Errno.Badf;
  }

  data.setUint32(size_p, strlen, true);
  return Errno.Success;
}

const preview1 = {
  sched_yield,
  args_get,
  args_sizes_get,
  clock_time_get,
  random_get,
  poll_oneoff,
  fd_close,
  fd_fdstat_get,
  fd_fdstat_set_flags,
  fd_prestat_get,
  fd_prestat_dir_name,
  fd_write,
  environ_get,
  environ_sizes_get,
  proc_exit,
};

type DefaultEntry = () => void;

// deno-lint-ignore no-explicit-any
export function isDefaultEntry(entry: any): entry is DefaultEntry {
  return typeof entry === "function";
}

interface Command {
  exports: {
    _start: DefaultEntry;
    memory: WebAssembly.Memory;
  };
}

// deno-lint-ignore no-explicit-any
export function isCommand(instance: any): instance is Command {
  return isDefaultEntry(instance.exports?._start);
}

interface Reactor {
  exports: {
    _initialize: DefaultEntry;
  };
}

// deno-lint-ignore no-explicit-any
function isReactor(instance: any): instance is Reactor {
  return isDefaultEntry(instance.exports?._initialize);
}

type MultipleKinds = Command & Reactor;

// deno-lint-ignore no-explicit-any
export function isMultipleKinds(instance: any): instance is MultipleKinds {
  return isCommand(instance) && isReactor(instance);
}

export default async function (
  path: string,
  env: Env[] = [],
  arg: Arg[] = [],
): Promise<Exitcode> {
  environments = env;
  args = arg;

  const { instance } = await WebAssembly.instantiateStreaming(
    fetch(new URL(path, import.meta.url)),
    {
      wasi_snapshot_preview1: preview1,
    },
  );

  if (isMultipleKinds(instance)) {
    throw Error("[preview1] multiple kinds are not supported");
  }

  if (!isCommand(instance)) {
    throw Error(`[preview1] unsupported kind`);
  }

  memory = instance.exports.memory;

  try {
    instance.exports._start();
    exitcode = 0;
  } catch (err) {
    console.error(err);
  } finally {
    console.debug(debug);
  }
  return exitcode;
}
