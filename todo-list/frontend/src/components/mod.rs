use crate::api::update_todo;
use common::{TodoItem, UpdateTodoItem};
use web_sys::{console, HtmlInputElement};
use yew::{function_component, html, Callback, Event, Html, Properties, TargetCast};

#[derive(Properties, PartialEq)]
pub struct TodoListProps {
    pub todos: Vec<TodoItem>,
}

#[function_component]
pub fn TodoList(props: &TodoListProps) -> Html {
    html! {
    <>
        <div class="todo-list">
            {props
                .todos
                .iter()
                .map(|todo| {
                    let todo = todo.clone();
                    let this_todo = todo.clone();
                    let onclick = Callback::from(move |e: Event| {
                        let todo_id = todo.id;
                        let todo_name = todo.name.clone();
                        let todo_description = todo.description.clone();
                        if let Some(input) = e.target_dyn_into::<HtmlInputElement>() {
                            let checked = input.checked();
                            wasm_bindgen_futures::spawn_local(async move {
                                let success = update_todo(todo_id, todo_name.clone(), todo_description.clone(), checked).await;
                                match success {
                                    Ok(response) => console::log_1(&format!("TODO was updated: {:?}", response).into()),
                                    Err(_) => console::log_1(&format!("Error updating TODO").into()),
                                }
                            });
                        }
                    });
                    html! {
                    <div class="todo-item">
                        <input id={this_todo.id.to_string()} type="checkbox" name={this_todo.name.clone()} checked={this_todo.done} onchange={onclick} />
                        <label for={this_todo.id.to_string()}>{&this_todo.name}</label>
                    </div>
                    }
                })
                .collect::<Html>()}
        </div>
    </>
    }
}
