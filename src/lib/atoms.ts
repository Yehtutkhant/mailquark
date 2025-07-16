import { atom, createStore } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const isCollapsedAtom = atom<boolean>(false);
export const accountIdAtom = atomWithStorage<string>("accountId", "");
export const tabAtom = atom<"inbox" | "draft" | "sent">("inbox");
export const doneAtom = atom<boolean>(false);
export const threadIdAtom = atom<string>("");
export const searchValueAtom = atom<string>("");
export const isSearchingAtom = atom<boolean>(false);
