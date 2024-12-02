use common::TodoItem;
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct TodoListProps {
    pub todos: Vec<TodoItem>,
}

#[function_component]
pub fn TodoList(props: &TodoListProps) -> Html {
    html! {
    <>
        <ul>
            {props
                .todos
                .iter()
                .map(|todo| {
                    html! {
                        <li key={todo.id} style="color: blue;">{format!("{} - {}", todo.name, todo.done)}</li>
                    }
                })
                .collect::<Html>()}
        </ul>
    </>
    }
}
