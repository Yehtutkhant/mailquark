"use client";

import { getAurinkoAuthUrl } from "@/app/actions/aurinko";
import { Button } from "../ui/button";

export function LinkAccountBtn() {
  return (
    <Button
      onClick={async () => {
        const url = await getAurinkoAuthUrl("Google");
        window.location.href = url;
      }}
    >
      Link Account
    </Button>
  );
}
