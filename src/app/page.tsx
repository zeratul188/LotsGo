'use client'
import * as React from "react";
import Header from "./header/Header";
import {Button} from "@heroui/react";

export default function Home() {
  return (
    <>
      <Header/>
      <div>
        <p className="text-[100pt]">page</p>
        <Button>Button</Button>
      </div>
    </>
  );
}
