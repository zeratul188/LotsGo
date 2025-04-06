import { Provider } from "react-redux";
import { getStore } from "./headerStore";

export default function Header() {
    const store = getStore();
    return (
        <Provider store={store}>
            <div>
                
            </div>
        </Provider>
    )
}