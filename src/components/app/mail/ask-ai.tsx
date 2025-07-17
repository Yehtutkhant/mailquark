import { accountIdAtom, isCollapsedAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Ellipsis, Send, SparklesIcon } from "lucide-react";
import { useChat } from "ai/react";
import PremiumBanner from "./premium-banner";

const AskAI = () => {
  const [isCollapsed] = useAtom(isCollapsedAtom);
  const [accountId] = useAtom(accountIdAtom);
  const { input, handleInputChange, handleSubmit, messages, isLoading } =
    useChat({
      api: "/api/chat",
      body: {
        accountId,
      },
      onError: (error) => {
        console.log(error);
      },
      initialMessages: [],
    });
  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className={cn("mb-2 w-full p-4 pb-0", isCollapsed && "hidden")}>
      <PremiumBanner />
      <motion.div className="flex w-full flex-1 flex-col items-end rounded-lg bg-gray-100 p-4 shadow-inner dark:bg-gray-900">
        <div
          className="hide-scrollbar flex max-h-[50vh] w-full flex-col gap-2 overflow-y-scroll"
          id="message-container"
        >
          <AnimatePresence mode="wait">
            {messages.map((message) => {
              return (
                <motion.div
                  key={message.id}
                  layout="position"
                  className={cn(
                    "z-10 mt-2 max-w-[200px] rounded-2xl bg-gray-200 break-words dark:bg-gray-800",

                    message.role === "user"
                      ? "self-end text-gray-900 dark:text-gray-100"
                      : "self-start bg-blue-500 text-white",
                  )}
                  layoutId={`container-[${messages.length - 1}]`}
                  transition={{
                    type: "spring",
                    ease: "easeInOut",
                    duration: 0.5,
                  }}
                >
                  <div className="px-3 py-2 text-[15px] leading-[15px]">
                    {message.content}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {isLoading && (
          <div className="flex w-full items-start">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Ellipsis className="size-4" />
            </motion.div>
          </div>
        )}
        {messages.length > 0 && <div className="h-4"></div>}
        <div className="w-full">
          {messages.length === 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <SparklesIcon className="size-6 text-gray-500" />
                <div>
                  <p className="text-gray-900 dark:text-gray-100">
                    Ask AI anything about your emails
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get answers to your questions about your emails
                  </p>
                </div>
              </div>
              <div className="h-2"></div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  onClick={() =>
                    handleInputChange({
                      target: { value: "What can I ask?" },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="cursor-pointer rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200 hover:opacity-90"
                >
                  What can I ask?
                </span>
                <span
                  onClick={() =>
                    handleInputChange({
                      target: { value: " When is my math homework dued?" },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="cursor-pointer rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200 hover:opacity-90"
                >
                  When is my math homework due?
                </span>
                <span
                  onClick={() =>
                    handleInputChange({
                      target: { value: "When is my next meeting?" },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="cursor-pointer rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200 hover:opacity-90"
                >
                  When is my next meeting?
                </span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex w-full flex-wrap">
            <input
              type="text"
              placeholder="Ask AI anything related to your emails"
              value={input}
              onChange={handleInputChange}
              className="relative h-9 flex-grow rounded-full border border-gray-200 bg-white px-3 py-2 text-[12px] outline-none placeholder:text-[13px] placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-blue-500/20 focus-visible:ring-offset-1 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus-visible:ring-blue-500/20 dark:focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-700"
            />
            <motion.div
              key={messages.length}
              layout="position"
              className="pointer-events-none absolute z-10 flex h-9 items-center overflow-hidden rounded-full bg-gray-200 break-words [word-break:break-word] dark:bg-gray-800"
              layoutId={`container-[${messages.length - 1}]`}
              transition={{
                type: "spring",
                ease: "linear",
                duration: 0.2,
              }}
              initial={{ opacity: 0.6, zIndex: -1 }}
              animate={{ opacity: 0.6, zIndex: -1 }}
              exit={{ opacity: 1, zIndex: 1 }}
            >
              <div className="px-3 py-2 text-[12px] leading-[15px] text-gray-900 dark:text-gray-100">
                {input}
              </div>
            </motion.div>
            <button
              type="submit"
              className="ml-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800"
            >
              <Send className="size-4 text-gray-500 dark:text-gray-300" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AskAI;
