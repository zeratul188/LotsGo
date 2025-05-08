'use client'
import { InputsComponent, LogoComponent } from "./LoginForm";
import { useLoginForm } from "./LoginForm";

export default function Login() {
    const loginForm = useLoginForm();

    return (
        <div className="min-h-[calc(100vh-65px)] flex justify-center items-center flex-col p-5 sm:p-0">
            <LogoComponent/>
            <div className="mt-8 w-full sm:w-100">
                <InputsComponent {...loginForm}/>
            </div>
        </div>
    )
}