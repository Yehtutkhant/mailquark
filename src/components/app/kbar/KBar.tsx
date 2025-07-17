"use client";
import React from "react";
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
  type Action,
} from "kbar";
import RenderResult from "./render-result";
import { useAtom } from "jotai";
import { doneAtom, tabAtom } from "@/lib/atoms";
import useThemeSwitch from "@/hooks/use-theme-switch";
import useAccountSwitch from "@/hooks/use-account-switch";

const KBar = ({ children }: { children: React.ReactNode }) => {
  const [_, setTab] = useAtom(tabAtom);
  const [__, setDone] = useAtom(doneAtom);
  const actions: Action[] = [
    {
      id: "inboxAction",
      name: "Inbox",
      keywords: "inbox",
      shortcut: ["g", "i"],
      section: "Navigation",
      subtitle: "View your inbox",
      perform: () => {
        setTab("inbox");
      },
    },
    {
      id: "draftAction",
      name: "Trash",
      keywords: "trash",
      shortcut: ["g", "t"],
      section: "Navigation",
      subtitle: "View your trash",
      perform: () => {
        setTab("trash");
      },
    },
    {
      id: "sentAction",
      name: "Sent",
      keywords: "sent",
      section: "Navigation",
      shortcut: ["g", "s"],
      subtitle: "View your sent mails",
      perform: () => {
        setTab("sent");
      },
    },
    {
      id: "pendingAction",
      name: "See done",
      shortcut: ["g", "d"],
      keywords: "done",
      section: "Navigation",
      subtitle: "View the done emails",
      perform: () => {
        setDone(true);
      },
    },
    {
      id: "doneAction",
      name: "See Pending",
      shortcut: ["g", "u"],
      keywords: "pending, undone, not done",
      section: "Navigation",
      subtitle: "View the pending emails",
      perform: () => {
        setDone(false);
      },
    },
  ];
  return (
    <KBarProvider actions={actions}>
      <KBarWrapper>{children}</KBarWrapper>
    </KBarProvider>
  );
};
const KBarWrapper = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitch();
  useAccountSwitch();
  return (
    <>
      <KBarPortal>
        <KBarPositioner className="hide-scrollbar fixed inset-0 z-[999] bg-black/40 !p-0 backdrop-blur-sm dark:bg-black/60">
          <KBarAnimator className="text-foreground relative !mt-64 w-full max-w-[600px] !-translate-y-2 overflow-hidden rounded-lg border bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
            <div className="dark:gray-800 bg-white">
              <div className="border-x-0 border-b-2 dark:border-gray-700">
                <KBarSearch className="w-full border-none bg-white px-6 py-4 text-lg outline-none focus:ring-0 focus:ring-offset-0 focus:outline-none dark:bg-gray-800" />
              </div>
              <RenderResult />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};

export default KBar;
