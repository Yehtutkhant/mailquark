import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import useThreads from "@/hooks/use-threads";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import DOMPurify from "dompurify";
import React, { type ComponentProps } from "react";

const ThreadList = () => {
  const { threads, threadId, setThreadId, isFetching, isPending, isError } =
    useThreads();
  const groupedThreads = threads?.reduce(
    (acc, thread) => {
      const date = format(
        thread.emails[0]?.sentAt ?? new Date(),
        "MMMM dd, yyyy",
      );
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(thread);
      return acc;
    },
    {} as Record<string, typeof threads>,
  );

  if (isFetching && isPending) {
    return (
      <div className="flex min-h-full max-w-full flex-col gap-4 p-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Skeleton className="h-[150px] w-full" key={idx} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-muted-foreground flex min-h-full max-w-full justify-center pt-8 text-xs font-semibold">
        Something went wrong
      </div>
    );
  }

  if (!threads || threads.length < 1) {
    return (
      <div className="text-muted-foreground flex min-h-full max-w-full justify-center pt-8 text-xs font-semibold">
        No emails to show
      </div>
    );
  }

  return (
    <ScrollArea>
      <div className="hide-scrollbar mt-3 max-h-[calc(100vh-150px)] max-w-full overflow-y-scroll">
        <div className="flex flex-col gap-4 p-4 pt-0">
          {Object.entries(groupedThreads ?? {}).map(([date, threads]) => {
            return (
              <React.Fragment key={date}>
                <div className="text-muted-foreground mt-5 text-xs font-medium first:mt-0">
                  {date}
                </div>

                {threads.map((thread) => {
                  return (
                    <button
                      onClick={() => setThreadId(thread.id)}
                      key={thread.id}
                      className={cn(
                        "hover:bg-accent relative flex cursor-pointer flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                        { "bg-accent": threadId === thread.id },
                      )}
                    >
                      <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "text-lg font-semibold",
                                thread.emails[0]?.sysLabels.includes("unread")
                                  ? "font-medium"
                                  : "text-muted-foreground",
                              )}
                            >
                              {thread.emails.at(-1)?.from.name ??
                                thread.emails.at(-1)?.from.address}
                            </div>
                          </div>
                          <div
                            className={cn(
                              "text-muted-foreground ml-auto text-[12px]",
                            )}
                          >
                            {formatDistanceToNow(
                              thread.emails.at(-1)?.sentAt ?? new Date(),
                              { addSuffix: true },
                            )}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "line-clamp-1 text-sm",
                            thread.emails[0]?.sysLabels.includes("unread")
                              ? "font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {thread.emails.at(-1)?.subject}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "line-clamp-2 text-xs",
                          thread.emails[0]?.sysLabels.includes("unread")
                            ? "font-medium"
                            : "text-muted-foreground",
                        )}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            thread.emails.at(-1)?.bodySnippet ?? "",
                            {
                              USE_PROFILES: { html: true },
                            },
                          ),
                        }}
                      ></div>
                      {thread.emails[0]?.sysLabels.length && (
                        <div className="flex items-center gap-2">
                          {thread.emails[0].sysLabels.map((label) => {
                            return (
                              <Badge
                                key={label}
                                variant={getBadgeVariant(label)}
                              >
                                {label}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
};

function getBadgeVariant(
  label: string,
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }
  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }
  return "secondary";
}

export default ThreadList;
