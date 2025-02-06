# Miner

Build the WASM module:

```shell
wasm-pack build --target web --release
```

Serve:

```shell
miniserve --header "Cross-Origin-Opener-Policy: same-origin" \
          --header "Cross-Origin-Embedder-Policy: require-corp" \
          --index "index.html" --port 8080 .
```
