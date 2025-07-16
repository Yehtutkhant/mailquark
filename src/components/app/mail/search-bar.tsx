import { Input } from "@/components/ui/input";
import useThreads from "@/hooks/use-threads";
import { isSearchingAtom, searchValueAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { Loader2, Search, X } from "lucide-react";
import React from "react";

const SearchBar = () => {
  const [searchValue, setSearchValue] = useAtom(searchValueAtom);
  const [isSearching, setIsSearching] = useAtom(isSearchingAtom);
  const { isFetching } = useThreads();
  return (
    <div className="relative m-4">
      <Search className="text-muted-foreground absolute top-2.5 left-2 size-4" />
      <Input
        placeholder="Search..."
        className="pl-8"
        onFocus={() => setIsSearching(true)}
        onBlur={() => {
          if (searchValue !== "") return;
          setIsSearching(false);
        }}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <div className="absolute top-2.5 right-2 flex items-center gap-2">
        {isFetching && (
          <Loader2 className="size-4 animate-spin text-gray-400" />
        )}
        <button
          className="cursor-pointer rounded-sm hover:bg-gray-400/20"
          onClick={() => {
            setSearchValue("");
            setIsSearching(false);
          }}
        >
          <X className="size-4 hover:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
