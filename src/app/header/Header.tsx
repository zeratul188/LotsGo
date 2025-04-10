import { Provider } from "react-redux";
import { getStore } from "./headerStore";

import Nav from "./Nav";

export default function Header() {
    const store = getStore();
    return (
        <Provider store={store}>
            <Nav/>
        </Provider>
    )
}