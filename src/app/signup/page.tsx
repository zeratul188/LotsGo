'use client'
import { LogoComponent, InputsComponent, useSignupForm } from "./SignupForm"
import { Divider } from "@heroui/react";

export default function Signup() {
    const signupForm = useSignupForm();

    return (
        <div className="min-h-[calc(100vh-65px)] sm:max-w-[640px] w-full mx-auto px-4 box-border">
            <LogoComponent/>
            <Divider className="mt-10 mb-10"/>
            <InputsComponent {...signupForm}/>
        </div>
    ) 
}