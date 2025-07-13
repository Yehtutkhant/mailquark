import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useThreads from "@/hooks/use-threads";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import { Letter } from "react-letter";

import React from "react";

interface Props {
  email: RouterOutputs["thread"]["getThreads"][0]["emails"][0];
}
const EmailDisplay = ({ email }: Props) => {
  const { account } = useThreads();
  const isMe = account?.emailAddress === email.from.address;

  return (
    <div
      className={cn(
        "rounded-md border p-4 transition-all hover:translate-x-2",
        {
          "border-l-4 border-l-gray-900": isMe,
        },
      )}
    >
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          {!isMe && (
            <Avatar>
              <AvatarImage alt="avatar" />
              <AvatarFallback className="bg-teal-700 text-white dark:text-zinc-200">
                {email.from.name
                  ? email.from.name
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                  : email.from.address
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
              </AvatarFallback>
            </Avatar>
          )}
          <span className="font-medium">
            {" "}
            {isMe ? "Me" : email.from.address}
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          {formatDistanceToNow(email.sentAt ?? new Date(), { addSuffix: true })}
        </p>
      </div>
      <div className="h-6"></div>
      <Letter
        html={email.body ?? ""}
        className="rounded-md bg-white text-black"
      />
    </div>
  );
};

export default EmailDisplay;
