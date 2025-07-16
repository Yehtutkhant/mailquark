"use client";

import React from "react";
import Starterkit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { Text } from "@tiptap/extension-text";
import EditorMenuBar from "./editor-menubar";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import TagInput from "./tag-input";
import { Input } from "@/components/ui/input";
import AIComposeButton from "./ai-compose-button";
import { readStreamableValue } from "ai/rsc";
import { autoCompleteEmail } from "@/app/actions/open-ai";

interface Props {
  subject: string;
  setSubject: (subject: string) => void;
  toValues: { label: string; value: string }[];
  setToValues: (values: { label: string; value: string }[]) => void;
  ccValues: { label: string; value: string }[];
  setCcValues: (values: { label: string; value: string }[]) => void;
  defaultExpanded: boolean;
  to: string[];
  handleSend: (value: string) => void;
  isSending: boolean;
}
const EmailEditor = ({
  subject,
  setSubject,
  toValues,
  setToValues,
  ccValues,
  setCcValues,
  defaultExpanded,
  to,
  handleSend,
  isSending,
}: Props) => {
  const [value, setValue] = React.useState<string>("");
  const [token, setToken] = React.useState<string>("");
  const [expanded, setExpanded] = React.useState<boolean>(defaultExpanded);

  const CustomText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          autoComplete(this.editor?.getText());
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: false,
    extensions: [
      Starterkit.configure({
        text: false,
      }),

      CustomText,
    ],
    onUpdate: () => {
      if (editor) {
        setValue(editor.getHTML());
      }
    },
  });

  const autoComplete = async (input: string) => {
    const { output } = await autoCompleteEmail(input);
    for await (const token of readStreamableValue(output)) {
      setToken(token ?? "");
    }
  };

  const onGenerate = (token: string) => {
    editor?.commands.insertContent(token);
  };

  React.useEffect(() => {
    editor?.commands.insertContent(token);
  }, [token, editor]);
  return (
    <div className="w-full">
      <div className="flex border-b p-4 py-2">
        {editor && <EditorMenuBar editor={editor} />}
      </div>
      <div className="space-y-2 p-4 pb-0">
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            <TagInput
              label="To"
              onChange={setToValues}
              placeholder="Add receipients"
              value={toValues}
            />

            <TagInput
              label="Cc"
              onChange={setCcValues}
              placeholder="Add receipients"
              value={ccValues}
            />
            <Input
              id="subject"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </motion.div>
        )}
        <div className="flex items-center gap-2">
          <div
            className="cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="text-sm font-medium text-green-600"> Draft</span>{" "}
            <span>to {to.join(", ")}</span>
          </div>
          <AIComposeButton
            editor={editor}
            isComposing={defaultExpanded}
            onGenerate={onGenerate}
          />
        </div>
      </div>
      <div className="prose h-[100px] w-full max-w-none overflow-y-auto px-4">
        <EditorContent
          editor={editor}
          value={value}
          className="dark:text-gray-200"
        />
      </div>
      <Separator />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs">
          Tip: Press{" "}
          <kbd className="rounded-lg border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800">
            cmd + J
          </kbd>
          for AI autocomplete
        </span>
        <Button
          disabled={isSending}
          onClick={async () => {
            editor?.commands.clearContent();
            handleSend(value);
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default EmailEditor;
