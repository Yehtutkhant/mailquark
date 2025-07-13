import React from "react";
import EmailEditor from "./email-editor";
import { useAtom } from "jotai";
import { accountIdAtom, threadIdAtom } from "@/lib/atoms";
import { api, type RouterOutputs } from "@/trpc/react";

const ReplyBox = () => {
  const [accountId] = useAtom(accountIdAtom);
  const [threadId] = useAtom(threadIdAtom);
  const { data: replyDetails } = api.thread.getReplyDetails.useQuery({
    accountId,
    threadId,
  });

  if (!replyDetails) return null;
  return <Component replyDetails={replyDetails} threadId={threadId} />;
};

const Component = ({
  replyDetails,
  threadId,
}: {
  replyDetails: RouterOutputs["thread"]["getReplyDetails"];
  threadId: string;
}) => {
  const [subject, setSubject] = React.useState<string>(
    replyDetails.subject.startsWith("Re:")
      ? replyDetails.subject
      : `Re: ${replyDetails.subject}`,
  );

  const [toValues, setToValues] = React.useState<
    { label: string; value: string }[]
  >(replyDetails.to.map((to) => ({ label: to.address, value: to.address })));
  const [ccValues, setCcValues] = React.useState<
    { label: string; value: string }[]
  >(replyDetails.cc.map((cc) => ({ label: cc.address, value: cc.address })));

  const handleSend = async (value: string) => {
    console.log(value);
  };

  React.useEffect(() => {
    if (!threadId || !replyDetails) return;
    if (!replyDetails.subject.startsWith("Re:")) {
      setSubject(`Re: ${replyDetails.subject}`);
    }
    setSubject(replyDetails.subject);
    setToValues(
      replyDetails.to.map((to) => ({ label: to.address, value: to.address })),
    );
    setCcValues(
      replyDetails.cc.map((cc) => ({ label: cc.address, value: cc.address })),
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
        isSending={false}
        defaultExpanded={false}
      />
    </div>
  );
};

export default ReplyBox;
