import Mail from "@/components/app/mail/mail";
import ThemeToggle from "@/components/app/theme/theme-toggle";

export default function page() {
  return (
    <div>
      <div className="absolute bottom-4 left-4">
        <ThemeToggle />
      </div>
      <Mail defaultLayout={[20, 32, 48]} navCollapsedSize={4} />
    </div>
  );
}
