#[link(wasm_import_module = "syscall")]
extern "C" {
    fn write(poiner: i32, length: i32);
}

#[no_mangle]
pub fn exec() {
    let msg = "Hello, World".as_bytes();
    unsafe {
        let p = msg.as_ptr() as i32;
        let l = msg.len() as i32;
        write(p, l);
    }
}
