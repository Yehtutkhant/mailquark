import {
  createBillingPortalSession,
  createCheckoutSession,
} from "@/app/actions/stripe-action";
import { Button } from "@/components/ui/button";
import { isSubscribedAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import React from "react";

const CheckoutButton = () => {
  const [isSubScribed] = useAtom(isSubscribedAtom);
  const handleCheckout = async () => {
    if (!isSubScribed) {
      await createCheckoutSession();
    } else {
      await createBillingPortalSession();
    }
  };
  return (
    <div>
      <Button
        variant="outline"
        size="lg"
        onClick={handleCheckout}
        className="cursor-pointer hover:opacity-85"
      >
        {isSubScribed ? "Manage Plan" : "Upgrade Plan"}
      </Button>
    </div>
  );
};

export default CheckoutButton;
