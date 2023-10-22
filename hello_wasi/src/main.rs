#[export_name = "hello"]
pub fn hello() {
    println!("Hello, world!");
}

fn main() {
    println!("Default Entrypoint!");
    hello();
}
