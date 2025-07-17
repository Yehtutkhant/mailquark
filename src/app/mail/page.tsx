import Mail from "@/components/app/mail/mail";
import { Separator } from "@/components/ui/separator";

export default function page() {
  return (
    <div className="w-full">
      <Mail defaultLayout={[23, 32, 48]} navCollapsedSize={4} />
    </div>
  );
}
