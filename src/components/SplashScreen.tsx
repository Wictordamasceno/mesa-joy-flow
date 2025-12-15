import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  // Temporário: desativar animação de saída para edição da splash screen
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setFadeOut(true);
  //     setTimeout(onComplete, 500);
  //   }, 2500);
  //
  //   return () => clearTimeout(timer);
  // }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      {/* Main Content - ComandaPro is the hero */}
      <div className="flex flex-col items-center gap-8 animate-fade-in">
        {/* ComandaPro - Main Item */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 rounded-3xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="text-6xl font-bold text-primary">C</span>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-accent tracking-tight">
              ComandaPro
            </h1>
            <p className="text-base text-muted-foreground mt-2">
              Gestão de comandas
            </p>
          </div>
        </div>

        {/* Damatech Logo - Secondary/Smaller */}
        <div className="mt-8 flex flex-col items-center gap-1 opacity-70">
          <p className="text-xs text-muted-foreground">powered by</p>
          <span className="text-lg font-medium text-foreground tracking-wide">
            &lt;/<span className="font-bold">damatech</span>&gt;
          </span>
        </div>
      </div>

      {/* Loading indicator */}
      <div className="absolute bottom-20 flex gap-1">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
