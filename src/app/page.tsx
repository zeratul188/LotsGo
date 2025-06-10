'use client'
import * as React from "react";
import CalendarComponent from "./home/CalendarForm";
import ChecklistComponent from "./home/ChecklistForm";
import { TodoComponent } from "./home/TodoForm";
import TitleComponent from "./home/TitleForm";

export default function Home() {

  return (
    <div className="w-full min-h-[calc(100vh-65px)]">
      <TitleComponent/>
      <div className="p-5 w-full max-w-[1280px] mx-auto pb-20">
        <ChecklistComponent/>
        <TodoComponent/>
        <CalendarComponent/>
      </div>
    </div>
  );
}
