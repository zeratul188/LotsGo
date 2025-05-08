'use client'
import { useEffect } from 'react';
import { useDispatch } from "react-redux";
import type { AppDispatch } from "./store/store";
import { logined } from "./store/loginSlice";

export default function StoreClient({children}: { children: React.ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        dispatch(logined(JSON.parse(storedUser)));
      }
    }, []);

    return (<>{children}</>);
}