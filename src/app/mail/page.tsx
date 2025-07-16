import Mail from "@/components/app/mail/mail";

export default function page() {
  return (
    <div>
      <Mail defaultLayout={[20, 32, 48]} navCollapsedSize={4} />
    </div>
  );
}
