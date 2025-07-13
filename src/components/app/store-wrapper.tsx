"use client";

import { myStore } from "@/lib/store";
import { Provider } from "jotai";

const StoreWrapper = ({ children }: { children: React.ReactNode }) => {
  return <Provider store={myStore}>{children}</Provider>;
};

export default StoreWrapper;
