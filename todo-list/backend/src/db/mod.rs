use anyhow::anyhow;
use common::{AddTodoItem, TodoItem, UpdateTodoItem};
use sqlx::{Error, SqlitePool};

struct TodoItemDAO {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub done: i64,
}

impl Into<TodoItem> for TodoItemDAO {
    fn into(self) -> TodoItem {
        TodoItem {
            id: self.id,
            name: self.name,
            description: self.description,
            done: self.done > 0,
        }
    }
}

pub async fn list_todos(conn: &SqlitePool) -> Result<Vec<TodoItem>, Error> {
    let todos = sqlx::query_as!(
        TodoItemDAO,
        r#"
        SELECT * FROM todos
        "#
    )
    .fetch_all(conn)
    .await?;

    Ok(todos.into_iter().map(|dao| dao.into()).collect())
}

pub async fn find_todo_by_id(conn: &SqlitePool, id: i64) -> anyhow::Result<TodoItem> {
    let todo = sqlx::query_as!(
        TodoItemDAO,
        r#"
        SELECT * FROM todos
        WHERE id = ?1
        "#,
        id
    )
    .fetch_one(conn)
    .await?;

    Ok(todo.into())
}

pub async fn add_todo(conn: &SqlitePool, todo: AddTodoItem) -> anyhow::Result<TodoItem> {
    let id = sqlx::query!(
        r#"
        INSERT INTO todos ( name, description )
        VALUES ( ?1, ?2 )
        "#,
        todo.name,
        todo.description
    )
    .execute(conn)
    .await?
    .last_insert_rowid();

    let created_todo = sqlx::query_as!(
        TodoItemDAO,
        r#"
        SELECT * FROM todos
        WHERE id = ?1
        "#,
        id
    )
    .fetch_one(conn)
    .await?;

    Ok(created_todo.into())
}

pub async fn update_todo(
    conn: &SqlitePool,
    id: i64,
    todo: UpdateTodoItem,
) -> anyhow::Result<TodoItem> {
    sqlx::query!(
        r#"
        UPDATE todos
        SET name = ?2, description = ?3, done = ?4
        WHERE id = ?1
        "#,
        id,
        todo.name,
        todo.description,
        todo.done
    )
    .execute(conn)
    .await?;

    let updated = find_todo_by_id(conn, id).await?;
    Ok(updated)
}

pub async fn delete_todo(conn: &SqlitePool, id: i64) -> anyhow::Result<()> {
    if !todo_exists(conn, id).await? {
        // TODO: create meaningful error type
        return Err(anyhow!("not found"));
    }
    sqlx::query!(
        r#"
        DELETE FROM todos 
        WHERE id = ?1
        "#,
        id,
    )
    .execute(conn)
    .await?;

    Ok(())
}

pub async fn todo_exists(conn: &SqlitePool, id: i64) -> anyhow::Result<bool> {
    let exists: bool =
        sqlx::query_scalar::<_, bool>("SELECT EXISTS(SELECT 1 FROM todos WHERE id = $1)")
            .bind(id)
            .fetch_one(conn)
            .await?;

    Ok(exists)
}
