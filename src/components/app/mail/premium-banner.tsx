import { FREE_CREDITS_PER_DAY } from "@/lib/constants";
import React from "react";
import CheckoutButton from "./checkout-button";

const PremiumBanner = () => {
  const isSub = false;
  const remainCredits = 5;
  if (!isSub)
    return (
      <div className="relative mb-2 flex flex-col gap-4 overflow-hidden rounded-lg border bg-gray-900 p-4 md:flex-row">
        <img
          src="./bot.png"
          className="h-[180px] w-auto md:absolute md:-right-10 md:-bottom-6"
        />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Basic Plan</h1>
            <p className="text-sm text-gray-400 md:max-w-full">
              {remainCredits} / {FREE_CREDITS_PER_DAY}
            </p>
          </div>
          <div className="h4"></div>
          <p className="text-sm text-gray-400 md:max-w-[calc(100%-100px)]">
            Upgrade pro plan to use unlimited AI features
          </p>
          <div className="h-4"></div>
          <CheckoutButton />
        </div>
      </div>
    );
  return <div>PremiumBanner</div>;
};

export default PremiumBanner;
