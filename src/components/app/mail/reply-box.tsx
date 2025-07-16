import React from "react";
import EmailEditor from "./email-editor";
import { useAtom } from "jotai";
import { accountIdAtom, tabAtom, threadIdAtom } from "@/lib/atoms";
import { api, type RouterOutputs } from "@/trpc/react";
import { toast } from "sonner";

const ReplyBox = () => {
  const [accountId] = useAtom(accountIdAtom);
  const [threadId] = useAtom(threadIdAtom);
  const [tab] = useAtom(tabAtom);
  const { data: replyDetails } = api.thread.getReplyDetails.useQuery(
    {
      accountId,
      threadId,
    },
    {
      enabled: tab === "inbox",
    },
  );

  if (!replyDetails) return null;
  return (
    <Component
      replyDetails={replyDetails}
      threadId={threadId}
      accountId={accountId}
    />
  );
};

const Component = ({
  replyDetails,
  threadId,
  accountId,
}: {
  replyDetails: RouterOutputs["thread"]["getReplyDetails"];
  threadId: string;
  accountId: string;
}) => {
  const [subject, setSubject] = React.useState<string>(
    replyDetails.subject.startsWith("Re:")
      ? replyDetails.subject
      : `Re: ${replyDetails.subject}`,
  );

  const [toValues, setToValues] = React.useState<
    { label: string; value: string }[]
  >(
    replyDetails.to.map((to) => ({
      label: to.address,
      value: to.address,
    })),
  );
  const [ccValues, setCcValues] = React.useState<
    { label: string; value: string }[]
  >(
    replyDetails.cc.map((cc) => ({
      label: cc.address,
      value: cc.address,
    })),
  );

  const sendEmail = api.thread.sendEmail.useMutation();
  const handleSend = async (value: string) => {
    if (toValues.length < 1) {
      toast.error("Please add receipent ⚠️");
      return;
    }
    sendEmail.mutate(
      {
        accountId,
        threadId: threadId ?? undefined,
        body: value,
        subject,
        from: replyDetails.from,
        to: toValues.map((to) => ({ name: to.value, address: to.value })),
        cc: ccValues.map((cc) => ({ name: cc.value, address: cc.value })),
        replyTo: replyDetails.from,
        inReplyTo: replyDetails.id,
      },
      {
        onSuccess: () => {
          toast.success("Email Sent 🚀");
        },
        onError: () => {
          toast.error("Email send failed ⚠️");
        },
      },
    );
  };

  React.useEffect(() => {
    if (!threadId || !replyDetails) return;
    if (!replyDetails.subject.startsWith("Re:")) {
      setSubject(`Re: ${replyDetails.subject}`);
    }
    setSubject(replyDetails.subject);
    setToValues(
      replyDetails.to.map((to) => ({
        label: to.address,
        value: to.address,
      })),
    );
    setCcValues(
      replyDetails.cc.map((cc) => ({
        label: cc.address,
        value: cc.address,
      })),
    );
  }, [threadId, replyDetails]);

  return (
    <div>
      <EmailEditor
        subject={subject}
        setSubject={setSubject}
        toValues={toValues}
        setToValues={setToValues}
        ccValues={ccValues}
        setCcValues={setCcValues}
        to={replyDetails.to.map((to) => to.address)}
        handleSend={handleSend}
        isSending={sendEmail.isPending}
        defaultExpanded={false}
      />
    </div>
  );
};

export default ReplyBox;
