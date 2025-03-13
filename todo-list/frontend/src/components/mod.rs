use crate::api::update_todo;
use common::TodoItem;
use web_sys::{console, HtmlInputElement};
use yew::{function_component, html, Callback, Event, Html, Properties, TargetCast};

#[derive(Properties, PartialEq)]
pub struct TodoListProps {
    pub todos: Vec<TodoItem>,
}

#[function_component]
pub fn TodoList(props: &TodoListProps) -> Html {
    html! {
        <div class="max-w-md mx-auto bg-slate-50 text-black border border-slate-500 p-4 rounded-lg shadow-lg">
            <h2 class="text-xl font-bold mb-2">{"Todo List"}</h2>
            <ul>{props
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
                    <li class="flex items-center gap-3 p-2 border-b">
                        <input type="checkbox"
                            class="w-5 h-5 rounded border-gray-300"
                            id={this_todo.id.to_string()}
                            name={this_todo.name.clone()}
                            checked={this_todo.done}
                            onchange={onclick} />
                        <span class={format!("text-lg {}", if this_todo.done { "line-through text-gray-400" } else { "" })}>
                            {&this_todo.name}
                        </span>
                    </li>
                    }
                })
                .collect::<Html>()}
            </ul>
        </div>
    }
}
