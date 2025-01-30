# Hello (WASM) World

## Project Setup

Create a new library with `cargo new --lib hello-world`.

Open `Cargo.toml` and add:
```toml
[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2.100"

[dependencies.web-sys]
version = "0.3.4"
features = ['Document', 'Element', 'HtmlElement', 'Node', 'Window']
```

## Build & Run

```shell
wasm-pack build --target web
miniserve . --index "index.html" -p 8080
```

## Test

Run unit tests of the Rust wasm library with `cargo test`.
