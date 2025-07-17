"use client";

import { accountIdAtom, doneAtom, tabAtom, threadIdAtom } from "@/lib/atoms";
import { api } from "@/trpc/react";
import { keepPreviousData } from "@tanstack/react-query";
import { useAtom } from "jotai";

const useThreads = () => {
  const [accountId, setAccountId] = useAtom(accountIdAtom);

  const [tab] = useAtom(tabAtom);
  const [done] = useAtom(doneAtom);
  const [threadId, setThreadId] = useAtom(threadIdAtom);

  const { data: accounts } = api.account.getAccounts.useQuery();
  const {
    data: threads,
    isFetching,
    isPending,
    isError,
    refetch,
  } = api.thread.getThreads.useQuery(
    {
      accountId,
      tab,
      done,
    },
    {
      enabled: !!accountId && !!tab,
      placeholderData: keepPreviousData,
      refetchInterval: 5000,
    },
  );
  return {
    threads,
    isPending,
    isError,
    isFetching,
    refetch,
    accountId,
    setAccountId,
    threadId,
    setThreadId,
    account: accounts?.find((acc) => acc.id === accountId),
  };
};

export default useThreads;
