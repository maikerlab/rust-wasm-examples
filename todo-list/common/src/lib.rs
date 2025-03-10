use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct TodoItem {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub done: bool,
}

#[derive(Debug, Deserialize)]
pub struct AddTodoItem {
    pub name: String,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UpdateTodoItem {
    pub name: String,
    pub description: Option<String>,
    pub done: bool,
}
