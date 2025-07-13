"use client";
import { api } from "@/trpc/react";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useAtom } from "jotai";
import { accountIdAtom, isCollapsedAtom } from "@/lib/atoms";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { getAurinkoAuthUrl } from "@/app/actions/aurinko";
import { toast } from "sonner";

const AccountSwitcher = () => {
  const { data } = api.account.getAccounts.useQuery();
  const [accountId, setAccountId] = useAtom(accountIdAtom);
  const [isCollapsed] = useAtom(isCollapsedAtom);
  if (!data) return null;

  return (
    <Select defaultValue={accountId} onValueChange={setAccountId}>
      <SelectTrigger
        className={cn(
          "flex w-full flex-1 items-center gap-2 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate",
          isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden",
        )}
        aria-label="Select account"
      >
        <SelectValue placeholder="Select an account">
          <span className={cn(!isCollapsed && "hidden")}>
            {data.find((account) => account.id === accountId)?.emailAddress[0]}
          </span>
          <span className={cn("ml-2", isCollapsed && "hidden")}>
            {data.find((account) => account.id === accountId)?.emailAddress}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {data.map((acc) => {
          return (
            <SelectItem key={acc.id} value={acc.id}>
              <div className="[&_svg]:text-foreground flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0">
                {" "}
                {acc.emailAddress}
              </div>
            </SelectItem>
          );
        })}
        <div
          className="focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none hover:bg-gray-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          onClick={async () => {
            try {
              const url = await getAurinkoAuthUrl("Google");
              window.location.href = url;
            } catch (error) {
              toast.error((error as Error).message);
            }
          }}
        >
          <Plus className="mr-1 size-4" />
          Add Account
        </div>
      </SelectContent>
    </Select>
  );
};

export default AccountSwitcher;
