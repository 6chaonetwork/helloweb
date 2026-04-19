import { CtaFooter } from "@/components/CtaFooter";
import { Navbar } from "@/components/Navbar";
import { Scenarios } from "@/components/Scenarios";

export default function ScenariosPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dark-base text-gray-200">
        <Scenarios />
        <CtaFooter />
      </main>
    </>
  );
}
