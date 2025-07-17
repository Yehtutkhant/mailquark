import { createCheckoutSession } from "@/app/actions/stripe-action";
import { Button } from "@/components/ui/button";
import React from "react";

const CheckoutButton = () => {
  const isSub = false;
  const handleCheckout = async () => {
    await createCheckoutSession();
  };
  return (
    <div>
      <Button
        variant="outline"
        size="lg"
        onClick={handleCheckout}
        className="cursor-pointer hover:opacity-85"
      >
        {isSub ? "Manage Subscription" : "Upgrade Plan"}
      </Button>
    </div>
  );
};

export default CheckoutButton;
