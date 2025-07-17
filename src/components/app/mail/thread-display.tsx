import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useThreads from "@/hooks/use-threads";
import { format } from "date-fns";
import { MailMinusIcon, Trash, Loader2 } from "lucide-react";
import React from "react";
import EmailDisplay from "./email-display";
import ReplyBox from "./reply-box";
import { useAtom } from "jotai";
import { isSearchingAtom } from "@/lib/atoms";
import SearchDisplay from "./search-display";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const ThreadDisplay = () => {
  const { threads, isPending, isError, threadId, accountId, isFetching } =
    useThreads();
  const utils = api.useUtils();
  const markAsRead = api.thread.markAsRead.useMutation();
  const deleteEmail = api.thread.deleteEmail.useMutation();
  const [isSearching] = useAtom(isSearchingAtom);
  if (isFetching && isPending) {
    return (
      <div className="flex h-full w-full items-center justify-center pt-20">
        <svg
          aria-hidden="true"
          className="inline h-8 w-8 animate-spin fill-gray-600 text-gray-200 dark:fill-gray-300 dark:text-gray-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-muted-foreground flex min-h-full max-w-full justify-center pt-8 text-xs font-bold">
        Something went wrong
      </div>
    );
  }
  const thread = threads?.find((thread) => thread.id === threadId);

  const handleMarkAsRead = () => {
    markAsRead.mutate(
      {
        accountId,
        messageId: thread?.id,
      },
      {
        onSuccess: () => {
          utils.thread.getThreads.invalidate();
          utils.thread.getThreads.refetch();
          toast.success("Mark as read 🚀");
        },
        onError: (error) => {
          console.log(error);
          toast.error("Email updating failed ⚠️");
        },
      },
    );
  };
  const handleDeleteEmail = () => {
    deleteEmail.mutate(
      {
        accountId,
        messageId: thread?.id,
      },
      {
        onSuccess: () => {
          utils.thread.getThreads.invalidate();
          utils.thread.getThreads.refetch();
          toast.success("Email Deleted 🚀");
        },
        onError: (error) => {
          console.log(error);
          toast.error("Email delete failed ⚠️");
        },
      },
    );
  };
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-15 items-center justify-between px-4 py-2">
        <h1 className="text-xl font-bold">Mail Box</h1>
        {thread && (
          <div className="flex items-center justify-end gap-2">
            {thread.emails[0]?.sysLabels.includes("unread") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleMarkAsRead}
                    className="cursor-pointer hover:bg-yellow-100 hover:text-yellow-500"
                    variant="ghost"
                    size="icon"
                    disabled={isError || isPending || markAsRead.isPending}
                  >
                    {markAsRead.isPending ? (
                      <Loader2 className="size-4 animate-spin text-gray-400" />
                    ) : (
                      <MailMinusIcon className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mark as read</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleDeleteEmail}
                  variant="ghost"
                  className="cursor-pointer hover:bg-red-100 hover:text-red-500"
                  size="icon"
                  disabled={isError || isPending || deleteEmail.isPending}
                >
                  {deleteEmail.isPending ? (
                    <Loader2 className="size-4 animate-spin text-gray-400" />
                  ) : (
                    <Trash className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Move to trash</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
      <Separator />
      {isSearching ? (
        <SearchDisplay />
      ) : (
        <>
          {" "}
          {thread ? (
            <div className="hide-scrollbar flex flex-1 flex-col overflow-scroll">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 text-sm">
                  <Avatar>
                    <AvatarImage alt="avatar" />
                    <AvatarFallback>
                      {thread.emails[0]?.from.name
                        ? thread.emails[0]?.from.name
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                        : "PP"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <div className="font-semibold">
                      {thread.emails[0]?.from.name ??
                        thread.emails[0]?.from.address}
                    </div>
                    <div className="line-clamp-1 text-xs">
                      {thread.emails[0]?.subject}
                    </div>
                    <div className="line-clamp-1 text-xs">
                      <span className="font-medium"> Reply to: </span>
                      {thread.emails[0]?.from.address}
                    </div>
                  </div>
                </div>
                {thread.emails[0]?.sentAt && (
                  <div className="text-muted-foreground text-xs">
                    {format(new Date(thread.emails[0].sentAt), "PPpp")}
                  </div>
                )}
              </div>
              <Separator />
              <div className="hide-scrollbar flex max-h-[calc(100vh-530px)] flex-col overflow-scroll">
                <div className="flex flex-col gap-4 p-4">
                  {thread.emails.map((email) => {
                    return <EmailDisplay key={email.id} email={email} />;
                  })}
                </div>
              </div>
              <div className="flex-1"></div>
              <Separator className="mt-auto" />
              <ReplyBox />
            </div>
          ) : (
            <div className="text-muted-foreground pt-8 text-center text-xs font-semibold">
              No email selected
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ThreadDisplay;
