use common::TodoItem;
use gloo_net::http::Request;
use yew::prelude::*;
use yew_router::prelude::*;

#[derive(Clone, Routable, PartialEq)]
enum Route {
    #[at("/")]
    Home,
    #[at("/:id")]
    TodoDetails { id: String },
    #[not_found]
    #[at("/404")]
    NotFound,
}

fn switch(routes: Route) -> Html {
    match routes {
        Route::Home => html! { <HomePage /> },
        Route::TodoDetails { id } => html! {
            <h1>{ "TODO "}{id}</h1>
        },
        Route::NotFound => html! { <h1>{ "404" }</h1> },
    }
}

#[function_component]
fn App() -> Html {
    html! {
        <BrowserRouter>
            <Switch<Route> render={switch} />
        </BrowserRouter>
    }
}

fn main() {
    yew::Renderer::<App>::new().render();
}

#[function_component]
fn HomePage() -> Html {
    let todos = use_state(|| vec![]);
    {
        let todos = todos.clone();
        use_effect_with((), move |_| {
            let todos = todos.clone();
            wasm_bindgen_futures::spawn_local(async move {
                let fetched_todos: Vec<TodoItem> = Request::get("/api/v1/todo")
                    .send()
                    .await
                    .unwrap()
                    .json()
                    .await
                    .unwrap();
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

#[derive(Properties, PartialEq)]
struct TodoListProps {
    todos: Vec<TodoItem>,
}

#[function_component]
fn TodoList(props: &TodoListProps) -> Html {
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
