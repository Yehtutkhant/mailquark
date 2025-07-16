import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { generateEmail } from "@/app/actions/open-ai";
import { readStreamableValue } from "ai/rsc";
import useThreads from "@/hooks/use-threads";
import { turndown } from "@/lib/turndown";
import type { Editor } from "@tiptap/react";

type Props = {
  isComposing: boolean;
  onGenerate: (token: string) => void;
  editor: Editor | null;
};

const AIComposeButton = ({ isComposing, onGenerate, editor }: Props) => {
  const [prompt, setPrompt] = React.useState<string>("");
  const [open, setOpen] = React.useState<boolean>(false);

  const { threads, threadId, account } = useThreads();
  const thread = threads?.find((thread) => thread.id === threadId);

  const aiGenerate = async () => {
    let context = "";

    if (!isComposing) {
      for (const email of thread?.emails ?? []) {
        context = `
           Subject; ${email.subject}
           From: ${email.from}
           Sent: ${new Date(email.sentAt).toLocaleString()}
           Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? "")}
          `;
      }
    }
    context += `My name is ${account?.name} and my email is ${account?.emailAddress}.`;

    const { output } = await generateEmail(context, prompt);

    for await (const token of readStreamableValue(output)) {
      onGenerate(token ?? "");
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(true)}
          className="cursor-pointer"
        >
          <Bot className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Smart Compose</DialogTitle>
          <DialogDescription>
            AI will help you compose your mail
          </DialogDescription>
          <div className="h-2"></div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt"
          />
          <div className="h-2"></div>
          <Button
            className="cursor-pointer"
            onClick={() => {
              editor?.commands.clearContent();
              setOpen(false);
              setPrompt("");
              aiGenerate();
            }}
          >
            Generate
          </Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AIComposeButton;
