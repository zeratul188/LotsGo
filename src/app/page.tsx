'use client'
import * as React from "react";
import CalendarComponent from "./home/CalendarForm";

export default function Home() {

  return (
    <>
      <div className="min-h-[calc(100vh-65px)] p-5 w-full max-w-[1280px] mx-auto">
        <CalendarComponent/>
      </div>
    </>
  );
}
