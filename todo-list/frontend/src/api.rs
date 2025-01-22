use common::{TodoItem, UpdateTodoItem};
use gloo_net::{http::Request, Error};

pub async fn fetch_todos() -> Result<Vec<TodoItem>, Error> {
    let fetched_todos: Vec<TodoItem> = Request::get("/api/v1/todo").send().await?.json().await?;
    Ok(fetched_todos)
}

pub async fn update_todo(
    id: i64,
    name: String,
    description: Option<String>,
    done: bool,
) -> Result<TodoItem, Error> {
    let update_todo = UpdateTodoItem {
        name,
        description,
        done,
    };
    let body = serde_json::to_string(&update_todo)?;
    let response = Request::put(format!("/api/v1/todo/{}", id).as_str())
        .body(body)
        .header("Content-Type", "application/json")
        .send()
        .await?
        .json()
        .await?;
    Ok(response)
}
