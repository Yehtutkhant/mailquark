import { accountIdAtom } from "@/lib/atoms";
import { api } from "@/trpc/react";
import { useAtom } from "jotai";
import React from "react";
import Select, { type MultiValue } from "react-select";
import Avatar from "react-avatar";

interface Props {
  placeholder: string;
  label: string;
  value: { label: string; value: string }[];
  onChange: (values: { label: string; value: string }[]) => void;
}
const TagInput = ({ placeholder, label, value, onChange }: Props) => {
  const [accountId] = useAtom(accountIdAtom);
  const [inputValue, setInputValue] = React.useState<string>("");
  const { data: suggestions } = api.emailAddress.getAddressesByAccount.useQuery(
    {
      accountId,
    },
  );

  const options =
    suggestions?.map((sugesstion) => {
      return {
        label: (
          <div className="flex items-center gap-2">
            <Avatar
              name={sugesstion.address}
              textSizeRatio={2}
              size="25"
              round={true}
            />
            {sugesstion.address}
          </div>
        ),
        value: sugesstion.address,
      };
    }) ?? [];

  return (
    <div className="flex items-center rounded-md border">
      <span className="ml-3 text-xs text-gray-500">{label}</span>
      <Select
        onInputChange={setInputValue}
        className="w-full flex-1"
        //@ts-ignore
        onChange={onChange}
        values={value}
        //@ts-ignore
        options={
          inputValue
            ? options.concat({
                //@ts-ignore
                label: inputValue,
                value: inputValue,
              })
            : options
        }
        placeholder={placeholder}
        isMulti
        classNames={{
          control: () =>
            "!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none dark:!bg-transparent",
          menu: () => "dark:!bg-gray-900",
          option: () => "dark:!bg-gray-900 dark:!text-white",
          multiValue: () => "dark:!bg-gray-900",
          multiValueLabel: () =>
            "dark:!text-white dark:!bg-gray-900 rounded-md",
          multiValueRemove: () => "dark:!bg-gray-900 dark:!text-white",
          menuPortal: () => "dark",
        }}
      />
    </div>
  );
};

export default TagInput;
