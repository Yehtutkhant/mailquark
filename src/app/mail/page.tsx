import Mail from "@/components/app/mail/mail";

export default function page() {
  return (
    <div className="w-full">
      <Mail defaultLayout={[23, 30, 47]} navCollapsedSize={4} />
    </div>
  );
}
