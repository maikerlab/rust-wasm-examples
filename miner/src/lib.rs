use rand::{Rng, RngCore};
use sha2::{Digest, Sha256};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Miner {
    prefix: String,
    difficulty: usize,
}

#[wasm_bindgen]
impl Miner {
    #[wasm_bindgen(constructor)]
    pub fn new(prefix: String, difficulty: usize) -> Miner {
        Miner { prefix, difficulty }
    }

    #[wasm_bindgen]
    pub fn mine(&self) -> String {
        loop {
            let nonce = rand::rng().next_u64();
            let input = format!("{}{}", self.prefix, nonce);
            let hash = sha256(&input);
            if hash.starts_with(&"0".repeat(self.difficulty)) {
                return format!("Nonce: {}, Hash: {}", nonce, hash);
            }
        }
    }
}

fn sha256(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    format!("{:x}", result)
}
