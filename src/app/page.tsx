'use client'
import * as React from "react";
import CalendarComponent from "./home/CalendarForm";
import ChecklistComponent from "./home/ChecklistForm";
import { TodoComponent } from "./home/TodoForm";
import TitleComponent from "./home/TitleForm";
import { BoxAd, LineAd } from "./ad/AdForm";
import { useMobileQuery } from "@/utiils/utils";

export default function Home() {
  const isMobile = useMobileQuery();

  return (
    <div className="w-full min-h-[calc(100vh-65px)]">
      <TitleComponent/>
      <div className="p-5 w-full max-w-[1280px] mx-auto pb-20">
        <ChecklistComponent/>
        <TodoComponent/>
        <CalendarComponent/>
        {isMobile ? (
          <div className="w-full min-h-[100px] border-1 mt-8">
            <BoxAd/>
          </div>
        ) : (
          <div className="w-full min-h-[100px] border-1 mt-8">
            <LineAd/>
          </div>
        )}
      </div>
    </div>
  );
}
