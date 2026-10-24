"use client";

import { useSyncExternalStore } from "react";
import { BsEmojiSunglasses, BsEmojiSunglassesFill } from "react-icons/bs";
import { useTheme } from "next-themes";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => { finished: Promise<void> };
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isDark = mounted && resolvedTheme === "dark";

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";
    const viewTransition = (document as ViewTransitionDocument).startViewTransition?.bind(document);

    if (viewTransition) {
      viewTransition(() => setTheme(nextTheme));
      return;
    }

    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className="inline-flex size-12 items-center justify-center rounded-lg border border-line bg-subtle text-muted transition-colors hover:bg-surface hover:text-fg"
    >
      {isDark ? <BsEmojiSunglassesFill aria-hidden="true" className="size-5" /> : <BsEmojiSunglasses aria-hidden="true" className="size-5" />}
    </button>
  );
}
