'use client'
import * as React from "react";
import CalendarComponent from "./home/CalendarForm";
import ChecklistComponent from "./home/ChecklistForm";
import { TodoComponent } from "./home/TodoForm";

export default function Home() {

  return (
    <>
      <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto pb-20">
        <ChecklistComponent/>
        <TodoComponent/>
        <CalendarComponent/>
      </div>
    </>
  );
}
