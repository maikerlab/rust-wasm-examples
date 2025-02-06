use rand::RngCore;
use sha2::{Digest, Sha256};
use wasm_bindgen::prelude::*;
use console_error_panic_hook;
pub use wasm_bindgen_rayon::init_thread_pool;

#[wasm_bindgen(start)]
pub fn main_js() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub struct Miner {
    prefix: String,
    difficulty: usize,
}

#[wasm_bindgen]
pub struct MiningResult {
    nonce: u64,
    hash: String,
    iterations: u64
}

#[wasm_bindgen]
impl MiningResult {
    #[wasm_bindgen(getter)]
    pub fn nonce(&self) -> u64 {
        self.nonce
    }

    #[wasm_bindgen(getter)]
    pub fn hash(&self) -> String {
        self.hash.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn iterations(&self) -> u64 {
        self.iterations
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
        let mut nonce = rand::rng().next_u64();
        let mut iterations = 1;
        loop {
            let input = format!("{}{}", self.prefix, nonce);
            let hash = sha256(&input);
            if hash.starts_with(&"0".repeat(self.difficulty)) {
                println!("Nonce: {}, Hash: {}", nonce, hash);
                return MiningResult {
                    nonce,
                    hash,
                    iterations,
                }
            }
            nonce += 1;
            iterations += 1;
        }
    }
}

fn sha256(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    format!("{:x}", result)
}
