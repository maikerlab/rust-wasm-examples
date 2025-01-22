use yew::prelude::*;

use crate::api::fetch_todos;
use crate::components::TodoList;

#[function_component]
pub fn HomePage() -> Html {
    let todos = use_state(|| vec![]);
    {
        let todos = todos.clone();
        use_effect_with((), move |_| {
            let todos = todos.clone();
            wasm_bindgen_futures::spawn_local(async move {
                let fetched_todos = fetch_todos().await.unwrap_or(vec![]);
                todos.set(fetched_todos);
            });
            || ()
        });
    }
    html! {
    <>
        <b>{"All TODO's:"}</b>
        <TodoList todos={(*todos).clone()} />
    </>
    }
}
