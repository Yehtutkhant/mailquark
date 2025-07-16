"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Pencil } from "lucide-react";
import React from "react";
import EmailEditor from "./email-editor";
import { api } from "@/trpc/react";
import useThreads from "@/hooks/use-threads";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  isCollapsed: boolean;
}
const ComposeButton = ({ isCollapsed }: Props) => {
  const [open, setOpen] = React.useState(false);
  const { account } = useThreads();

  const [toValues, setToValues] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [ccValues, setCcValues] = React.useState<
    { label: string; value: string }[]
  >([]);
  const [subject, setSubject] = React.useState<string>("");
  const sendEmail = api.thread.sendEmail.useMutation();
  const handleSend = async (values: string) => {
    if (!account) return;
    if (toValues.length < 1) {
      toast.error("Please add receipent ⚠️");
      return;
    }
    sendEmail.mutate(
      {
        accountId: account.id,
        threadId: undefined,
        subject,
        body: values,
        from: { name: account.name ?? "Me", address: account.emailAddress },
        to: toValues.map((t) => ({ name: t.value, address: t.value })),
        cc: ccValues.map((c) => ({ name: c.value, address: c.value })),
        replyTo: { name: account.name ?? "Me", address: account.emailAddress },
        inReplyTo: undefined,
      },
      {
        onSuccess: () => {
          toast.success("Email Sent 🚀");
          setOpen(false);
        },
        onError: (error) => {
          console.log(error);
          toast.error("Email send failed ⚠️");
        },
      },
    );
  };
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          size={isCollapsed ? "icon" : "default"}
          className="flex cursor-pointer items-center justify-center"
        >
          <Pencil className={cn("size-4", !isCollapsed && "mr-1")} />
          {!isCollapsed && "Compose"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Compose Email</DrawerTitle>
        </DrawerHeader>
        <EmailEditor
          toValues={toValues}
          setToValues={setToValues}
          ccValues={ccValues}
          setCcValues={setCcValues}
          subject={subject}
          setSubject={setSubject}
          handleSend={handleSend}
          to={toValues.map((to) => to.value)}
          isSending={sendEmail.isPending}
          defaultExpanded={true}
        />
      </DrawerContent>
    </Drawer>
  );
};

export default ComposeButton;
