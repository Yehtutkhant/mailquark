import { FREE_CREDITS_PER_DAY } from "@/lib/constants";
import React from "react";
import CheckoutButton from "./checkout-button";
import { useAtom } from "jotai";
import { accountIdAtom, isSubscribedAtom } from "@/lib/atoms";
import Image from "next/image";
import { api } from "@/trpc/react";

const PremiumBanner = () => {
  const [isSubScribed] = useAtom(isSubscribedAtom);
  const [accountId] = useAtom(accountIdAtom);
  const { data } = api.account.getRemainingChatbotCredits.useQuery(
    {
      accountId,
    },
    {
      enabled: !!accountId,
    },
  );

  if (!isSubScribed)
    return (
      <div className="relative mb-2 flex flex-col gap-4 overflow-hidden rounded-lg border bg-gray-900 p-4 md:flex-row">
        <Image
          alt="bot-image"
          width={50}
          height={100}
          src={"/bot.png"}
          className="h-[50px] w-[auto] md:absolute md:-right-10 md:-bottom-6"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Basic Plan</h1>
            <p className="text-sm text-gray-400 md:max-w-full">
              {data?.remainingCredits} / {FREE_CREDITS_PER_DAY}
            </p>
          </div>
          <div className="h4"></div>
          <p className="text-sm text-gray-400 md:max-w-[calc(100%-100px)]">
            Upgrade pro plan to use 3 accounts and unlimited AI features
          </p>
          <div className="h-4"></div>
          <CheckoutButton />
        </div>
      </div>
    );

  if (isSubScribed)
    return (
      <div className="relative mb-2 flex flex-col gap-4 overflow-hidden rounded-lg border bg-gray-900 p-4 md:flex-row">
        <img
          src="./bot.png"
          className="h-[180px] w-auto md:absolute md:-right-10 md:-bottom-6"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Premium Plan</h1>
          </div>
          <div className="h4"></div>
          <p className="text-sm text-gray-400 md:max-w-[calc(100%-100px)]">
            You can use 3 accounts and unlimited AI features
          </p>
          <div className="h-4"></div>
          <CheckoutButton />
        </div>
      </div>
    );
};

export default PremiumBanner;
