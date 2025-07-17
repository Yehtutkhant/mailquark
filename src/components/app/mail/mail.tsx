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
import { doneAtom, isCollapsedAtom, tabAtom } from "@/lib/atoms";
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
import ThemeToggle from "../theme/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import ComposeButton from "./compose-button";
import SearchBar from "./search-bar";
import AskAI from "./ask-ai";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

interface Props {
  defaultLayout: number[] | undefined;
  navCollapsedSize: number;
}
const Mail = ({ defaultLayout = [20, 32, 48], navCollapsedSize }: Props) => {
  const [isCollapsed, setIsCollapsed] = useAtom(isCollapsedAtom);

  const [done, setDone] = useAtom(doneAtom);
  const [tab] = useAtom(tabAtom);
  const panelRef = React.useRef(null);
  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        ref={panelRef}
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
                "flex h-15 items-center justify-center",
                isCollapsed ? "h-15 px-2" : "px-2",
              )}
            >
              <AccountSwitcher />
            </div>
            <Separator />
            <Sidebar />
            <div className="flex-1"></div>

            <AskAI />

            <div>
              <div
                className={cn(
                  "flex items-center gap-2 p-3",
                  isCollapsed ? "flex-col-reverse" : "",
                )}
              >
                <ThemeToggle />
                <UserButton />
                <ComposeButton isCollapsed={isCollapsed} />
              </div>
            </div>
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
            <div className="flex h-15 items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              {tab === "inbox" && (
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
              )}
            </div>
            <Separator />
            <SearchBar />
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
