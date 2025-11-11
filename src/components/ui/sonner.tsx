import { useEffect, useState } from "react";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(darkMode.matches ? "dark" : "light");

    const listener = (e: MediaQueryListEvent) =>
      setTheme(e.matches ? "dark" : "light");

    darkMode.addEventListener("change", listener);
    return () => darkMode.removeEventListener("change", listener);
  }, []);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
