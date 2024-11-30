mod db;

use actix_web::http::header::ContentType;
use actix_web::http::StatusCode;
use actix_web::{get, post, put, web, App, HttpResponse, HttpServer, ResponseError};
use common::{AddTodoItem, UpdateTodoItem};
use derive_more::derive::{Add, From};
use derive_more::{Display, Error};
use sqlx::{Pool, Sqlite, SqlitePool};
use std::env;
use std::sync::Arc;

#[derive(Debug, PartialEq, From, Add, Display, Error)]
enum ApiError {
    #[display("Database Error")]
    DatabaseError,
    #[display("Entity not found")]
    EntityNotFoundError,
}

type ApiResult = Result<HttpResponse, ApiError>;

impl ResponseError for ApiError {
    fn status_code(&self) -> StatusCode {
        match *self {
            ApiError::DatabaseError { .. } => StatusCode::BAD_REQUEST,
            ApiError::EntityNotFoundError => StatusCode::NOT_FOUND,
        }
    }
    fn error_response(&self) -> HttpResponse {
        HttpResponse::build(self.status_code())
            .insert_header(ContentType::html())
            .body(self.to_string())
    }
}

#[get("/")]
async fn get_todos(data: web::Data<AppState>) -> ApiResult {
    let db = &data.db_handle;
    let todos = db::list_todos(db)
        .await
        .map_err(|_| ApiError::DatabaseError)?;
    Ok(HttpResponse::Ok().json(&todos))
}

#[get("/{id}")]
async fn get_todo_by_id(data: web::Data<AppState>, path: web::Path<i64>) -> ApiResult {
    let id = path.into_inner();
    let db = &data.db_handle;
    let todo = db::find_todo_by_id(db, id)
        .await
        .map_err(|_| ApiError::EntityNotFoundError)?;
    Ok(HttpResponse::Ok().json(&todo))
}

#[post("/")]
async fn add_todo(data: web::Data<AppState>, todo: web::Json<AddTodoItem>) -> ApiResult {
    let db = &data.db_handle;
    let todo = todo.into_inner();
    let created = db::add_todo(&db, todo)
        .await
        .map_err(|_| ApiError::DatabaseError)?;
    Ok(HttpResponse::Ok().json(&created))
}

#[put("/{id}")]
async fn update_todo(
    data: web::Data<AppState>,
    path: web::Path<i64>,
    todo: web::Json<UpdateTodoItem>,
) -> ApiResult {
    let id = path.into_inner();
    let todo = todo.into_inner();
    let db = &data.db_handle;
    let updated = db::update_todo(&db, id, todo)
        .await
        .map_err(|_| ApiError::DatabaseError)?;
    Ok(HttpResponse::Ok().json(&updated))
}
struct AppState {
    db_handle: Arc<Pool<Sqlite>>,
}

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    let db_url = env::var("DATABASE_URL")?;
    let db_pool = SqlitePool::connect(&db_url).await?;
    let app_state = web::Data::new(AppState {
        db_handle: Arc::new(db_pool),
    });
    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .service(get_todos)
            .service(get_todo_by_id)
            .service(add_todo)
            .service(update_todo)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await?;
    Ok(())
}
