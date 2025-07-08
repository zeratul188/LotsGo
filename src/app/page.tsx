'use client'
import * as React from "react";
import CalendarComponent from "./home/CalendarForm";
import ChecklistComponent from "./home/ChecklistForm";
import { TodoComponent } from "./home/TodoForm";
import TitleComponent from "./home/TitleForm";
import { useMobileQuery } from "@/utiils/utils";
import dynamic from "next/dynamic";
import NotLoginComponent from "./home/NotLoginForm";

const BoxAd = dynamic(() => import('./ad/BoxAd'), { ssr: false });
const TwoLineAd = dynamic(() => import('./ad/TwoLineAd'), { ssr: false });

export default function Home() {
  const isMobile = useMobileQuery();
  const [isLoaded, setLoaded] = React.useState(false);
  const [isShowAd, setShowAd] = React.useState(false);

  return (
    <div className="w-full min-h-[calc(100vh-65px)]">
      <TitleComponent/>
      <div className="p-5 w-full max-w-[1280px] mx-auto pb-20">
        <NotLoginComponent/>
        <ChecklistComponent/>
        <TodoComponent/>
        <CalendarComponent setLoaded={setLoaded} setShowAd={setShowAd}/>
        {isLoaded && isShowAd ? isMobile ? (
          <div className="w-full flex justify-center px-4">
            <div className="w-full max-w-[360px] min-h-[100px] mt-8">
              <BoxAd isLoaded={isLoaded}/>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center px-4">
            <div className="w-full mt-8">
              <TwoLineAd isLoaded={isLoaded}/>
            </div>
          </div>
        ) : <></>}
      </div>
    </div>
  );
}
