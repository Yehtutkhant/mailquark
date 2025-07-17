import KBar from "@/components/app/kbar/KBar";
import Mail from "@/components/app/mail/mail";

export default function page() {
  return (
    <KBar>
      <div className="w-full">
        <Mail defaultLayout={[23, 30, 47]} navCollapsedSize={4} />
      </div>
    </KBar>
  );
}
