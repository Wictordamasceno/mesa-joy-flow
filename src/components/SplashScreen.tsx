import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Logo/Brand */}
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center">
          <span className="text-5xl font-bold text-primary">D</span>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Damatech
          </h1>
          <p className="text-lg text-primary font-medium mt-1">
            Soluções
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold text-accent">
            ComandaPro
          </h2>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Gestão de comandas
          </p>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-20 flex gap-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
      </div>

      {/* Footer */}
      <p className="absolute bottom-8 text-xs text-muted-foreground">
        © 2024 Damatech Soluções
      </p>
    </div>
  );
}
