fn main() {
    // Make sure DATABASE_URL is set for the build process.
    let db_url = option_env!("DATABASE_URL").unwrap_or("sqlite://./backend/todos.db");
    println!("cargo:rustc-env=DATABASE_URL={db_url}");
}
