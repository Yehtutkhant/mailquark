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
type Props = {
  isComposing: boolean;
  context?: string;
  onGenerate: (token: string) => void;
};

const AIComposeButton = ({ isComposing, context, onGenerate }: Props) => {
  const [prompt, setPrompt] = React.useState<string>("");
  const [open, setOpen] = React.useState<boolean>(false);

  const aiGenerate = async () => {
    const { output } = await generateEmail("", prompt);
    let result = "hello";
    for await (const token of readStreamableValue(output)) {
      result += token ?? "";
    }
    console.log(result);
    onGenerate(result);
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
