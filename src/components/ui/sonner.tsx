import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

// Hook to detect theme from DOM or system preference
function useThemeSafe() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const detectTheme = () => {
      if (typeof window === "undefined") return "light";
      
      // Check if document has dark class (common pattern)
      if (document.documentElement.classList.contains("dark")) {
        return "dark";
      }
      
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark ? "dark" : "light";
    };

    setTheme(detectTheme());

    // Listen for theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setTheme(detectTheme());
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return { theme };
}

// Type for Toaster props (compatible with sonner)
type ToasterProps = {
  theme?: "light" | "dark" | "system";
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
};

// Toaster component with fallback if sonner is not available
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useThemeSafe();
  const [SonnerComponent, setSonnerComponent] = useState<React.ComponentType<ToasterProps> | null>(null);

  useEffect(() => {
    // Try to dynamically import sonner at runtime
    // Using dynamic module name to avoid Vite pre-bundling issues
    const loadSonner = async () => {
      try {
        // Construct module name dynamically so Vite doesn't try to resolve it at build time
        const moduleName = "son" + "ner";
        // @vite-ignore - sonner may not be installed, handle gracefully at runtime
        const sonnerModule = await import(/* @vite-ignore */ moduleName);
        if (sonnerModule?.Toaster) {
          setSonnerComponent(() => sonnerModule.Toaster);
        }
      } catch (error) {
        // sonner not available, component will render nothing
        console.warn("sonner package not found. Toast notifications will be disabled.");
        setSonnerComponent(null);
      }
    };
    
    loadSonner();
  }, []);

  // If sonner is not available, return null (no-op)
  if (!SonnerComponent) {
    return null;
  }

  return (
    <SonnerComponent
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };

