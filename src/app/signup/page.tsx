'use client'
import { Provider } from "react-redux";
import { LogoComponent, InputsComponent } from "./SignupForm"
import { Divider } from "@heroui/react";
import { getStore } from "./signupStore";

export default function Signup() {
    const store = getStore();
    return (
        <Provider store={store}>
            <div className="min-h-[calc(100vh-65px)] sm:max-w-[640px] w-full mx-auto px-4 box-border">
                <LogoComponent/>
                <Divider className="mt-10 mb-10"/>
                <InputsComponent/>
            </div>
        </Provider>
    ) 
}