"use client";

import { accountIdAtom, tabAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import React from "react";
import { Navbar } from "./navbar";
import { File, Inbox, Send } from "lucide-react";
import { api } from "@/trpc/react";
const refetchInterval = 500000;
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
  const { data: draftCount } = api.thread.getThreadsCount.useQuery(
    {
      accountId,
      tab: "draft",
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
            title: "Draft",
            label: draftCount?.toString(),
            icon: File,
            variant: tab === "draft" ? "default" : "ghost",
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
