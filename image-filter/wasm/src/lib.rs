use std::io::Cursor;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn apply_grayscale(data: &[u8]) -> Vec<u8> {
    let mut cursor = Cursor::new(data);
    let image = image::ImageReader::new(&mut cursor)
        .with_guessed_format()
        .unwrap()
        .decode()
        .unwrap();

    let grayscale_img = image.grayscale();
    let mut output = Vec::new();
    grayscale_img
        .write_to(&mut Cursor::new(&mut output), image::ImageFormat::Png)
        .unwrap();
    output
}
