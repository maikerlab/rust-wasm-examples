use rand::RngCore;
use sha2::{Digest, Sha256};
use wasm_bindgen::prelude::*;
use console_error_panic_hook;
use serde::{Deserialize, Serialize};
use wasm_bindgen_futures::{future_to_promise, spawn_local};
use wasm_bindgen_futures::js_sys::Promise;
pub use wasm_bindgen_rayon::init_thread_pool;
use gloo_timers::future::TimeoutFuture;

#[wasm_bindgen(start)]
pub fn main_js() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(text: &str);
}

#[wasm_bindgen]
pub struct Miner {
    prefix: String,
    difficulty: usize,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct MiningResult {
    nonce: String,
    hash: String,
    iterations: String
}

#[wasm_bindgen]
impl MiningResult {
    #[wasm_bindgen(getter)]
    pub fn nonce(&self) -> String {
        self.nonce.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn hash(&self) -> String {
        self.hash.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn iterations(&self) -> String {
        self.iterations.clone()
    }
}

fn mine(prefix: String, difficulty: usize) -> MiningResult {
    let mut nonce = rand::rng().next_u64();
    let mut iterations = 1;
    loop {
        let input = format!("{}{}", prefix, nonce);
        let hash = sha256(&input);
        if hash.starts_with(&"0".repeat(difficulty)) {
            log(format!("Nonce: {}, Hash: {}", nonce, hash).as_str());
            return MiningResult {
                nonce: nonce.to_string(),
                hash,
                iterations: iterations.to_string(),
            }
        }
        nonce += 1;
        iterations += 1;
    }
}

#[wasm_bindgen]
impl Miner {
    #[wasm_bindgen(constructor)]
    pub fn new(prefix: String, difficulty: usize) -> Miner {
        Miner { prefix, difficulty }
    }

    #[wasm_bindgen]
    pub fn mine(&self) -> MiningResult {
        mine(self.prefix.clone(), self.difficulty)
    }

    #[wasm_bindgen]
    pub fn mine_async(&self) -> Promise {
        let prefix = self.prefix.clone();
        let difficulty = self.difficulty;

        future_to_promise(async move {
            log("WASM: start mining...");
            let result = mine(prefix, difficulty);
            log("WASM: mining done!");
            return Ok(serde_wasm_bindgen::to_value(&result)?);
        })
    }
}

fn sha256(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    format!("{:x}", result)
}
