"use client";

import { accountIdAtom, tabAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import React from "react";
import { Navbar } from "./navbar";
import { Trash, Inbox, Send } from "lucide-react";
import { api } from "@/trpc/react";
const refetchInterval = 5000;
const Sidebar = () => {
  const [accountId] = useAtom(accountIdAtom);
  const [tab] = useAtom(tabAtom);

  const { data: inboxCount } = api.thread.getThreadsCount.useQuery(
    {
      accountId,
      tab: "inbox",
    },
    {
      enabled: !!accountId && !!tab,
      refetchInterval,
    },
  );
  const { data: trashCount } = api.thread.getThreadsCount.useQuery(
    {
      accountId,
      tab: "trash",
    },
    {
      enabled: !!accountId && !!tab,
      refetchInterval,
    },
  );
  const { data: sentCount } = api.thread.getThreadsCount.useQuery(
    {
      accountId,
      tab: "sent",
    },
    {
      enabled: !!accountId && !!tab,
      refetchInterval,
    },
  );
  return (
    <div>
      <Navbar
        links={[
          {
            title: "Inbox",
            label: inboxCount?.toString(),
            icon: Inbox,
            variant: tab === "inbox" ? "default" : "ghost",
          },
          {
            title: "Trash",
            label: trashCount?.toString(),
            icon: Trash,
            variant: tab === "trash" ? "default" : "ghost",
          },
          {
            title: "Sent",
            label: sentCount?.toString(),
            icon: Send,
            variant: tab === "sent" ? "default" : "ghost",
          },
        ]}
      />
    </div>
  );
};

export default Sidebar;
