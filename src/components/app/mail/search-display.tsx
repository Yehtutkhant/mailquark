import { accountIdAtom, searchValueAtom } from "@/lib/atoms";
import { api } from "@/trpc/react";
import DOMPurify from "dompurify";
import { useAtom } from "jotai";
import React from "react";

import { useDebounceValue } from "usehooks-ts";

const SearchDisplay = () => {
  const [searchValue] = useAtom(searchValueAtom);
  const [accountId] = useAtom(accountIdAtom);
  const [debounceSearchValue] = useDebounceValue(searchValue, 500);
  const search = api.thread.searchEmails.useMutation();
  React.useEffect(() => {
    if (!debounceSearchValue) return;
    search.mutate({
      accountId,
      search: debounceSearchValue,
    });
  }, [debounceSearchValue, accountId]);

  {
    search.isError && (
      <p className="p-4 text-sm text-gray-600 dark:text-gray-400">
        Error occurred while searching.
      </p>
    );
  }
  return (
    <div className="hide-scrollbar max-h-[calc(100vh-50px)] max-w-full overflow-y-auto p-4">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm text-gray-600 dark:text-gray-400">
          Your search for &quot;{searchValue}&quot; came back with ...
        </h2>
      </div>
      {search.data?.hits.length === 0 ? (
        <>
          <p className="pt-5 text-sm text-gray-600 dark:text-gray-200">
            No results found
          </p>
        </>
      ) : (
        <ul className="space-y-4">
          {search.data?.hits.map((hit) => {
            return (
              <li
                key={hit.id}
                className="cursor-pointer list-none rounded-md border p-4 transition-all hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <h3 className="mb-2 text-base font-medium">
                  {hit.document.subject}
                </h3>
                <p className="text-sm text-gray-500">
                  From: {hit.document.from}
                </p>
                <p className="text-sm text-gray-500">
                  To: {hit.document.to.join(", ")}
                </p>
                <p
                  className="mt-2 text-sm"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(hit.document.rawBody, {
                      USE_PROFILES: { html: true },
                    }),
                  }}
                ></p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SearchDisplay;
