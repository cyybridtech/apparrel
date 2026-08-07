import { useEffect, useState } from "react";
import { IconChevronUp } from "@/components/icons";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="animate-toast-in fixed right-5 bottom-20 z-[50] grid h-12 w-12 place-items-center border border-line bg-ink-2 text-dust shadow-[4px_4px_0_rgba(0,0,0,0.45)] transition-all hover:-translate-y-1 hover:border-volt hover:text-volt active:translate-y-0"
      aria-label="Back to top"
    >
      <IconChevronUp width={20} height={20} strokeWidth={2.4} />
    </button>
  );
}
