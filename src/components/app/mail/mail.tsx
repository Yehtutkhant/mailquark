"use client";

import React from "react";
import { TooltipProvider } from "../../../components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../../components/ui/resizable";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { doneAtom, isCollapsedAtom } from "@/lib/atoms";
import { Separator } from "../../../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import AccountSwitcher from "./account-switcher";
import Sidebar from "./side-bar";
import ThreadList from "./thread-list";
import ThreadDisplay from "./thread-display";

interface Props {
  defaultLayout: number[] | undefined;
  navCollapsedSize: number;
}
const Mail = ({ defaultLayout = [20, 32, 48], navCollapsedSize }: Props) => {
  const [isCollapsed, setIsCollapsed] = useAtom(isCollapsedAtom);

  const [done, setDone] = useAtom(doneAtom);
  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          // document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
          //   sizes
          // )}`
        }}
        className="h-full min-h-screen items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={40}
          onCollapse={() => {
            setIsCollapsed(true);
            // document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
            //   true
            // )}`
          }}
          onResize={() => {
            setIsCollapsed(false);
            // document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
            //   false
            // )}`
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out",
          )}
        >
          <div className="flex h-full flex-1 flex-col">
            <div
              className={cn(
                "flex h-[52px] items-center justify-center",
                isCollapsed ? "h-[52px] px-2" : "px-2",
              )}
            >
              <AccountSwitcher />
            </div>
            <Separator />
            <Sidebar />
            <div className="flex-1"></div>
            {/* <AskAI isCollapsed={isCollapsed} /> */}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs
            className="gap-0"
            defaultValue="inbox"
            value={done ? "done" : "inbox"}
            onValueChange={(tab) => {
              if (tab === "done") {
                setDone(true);
              } else {
                setDone(false);
              }
            }}
          >
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="inbox"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Inbox
                </TabsTrigger>
                <TabsTrigger
                  value="done"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Done
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            {/* <SearchBar /> */}
            <TabsContent value="inbox" className="m-0">
              <ThreadList />
            </TabsContent>
            <TabsContent value="done" className="m-0">
              <ThreadList />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <ThreadDisplay />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};

export default Mail;
