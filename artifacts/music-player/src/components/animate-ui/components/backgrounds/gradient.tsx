import { useTheme } from "@/context/ThemeContext";

interface GradientBackgroundProps {
  className?: string;
}

export function GradientBackground({ className = "" }: GradientBackgroundProps) {
  const { theme } = useTheme();

  const darkOrbs = (
    <>
      {/* Top-left orb */}
      <div
        className="absolute rounded-full blur-3xl opacity-30 animate-pulse"
        style={{
          width: "60vw",
          height: "60vw",
          maxWidth: 480,
          maxHeight: 480,
          top: "-15%",
          left: "-15%",
          background: "radial-gradient(circle, hsl(263 70% 55%), transparent 70%)",
          animationDuration: "6s",
        }}
      />
      {/* Bottom-right orb */}
      <div
        className="absolute rounded-full blur-3xl opacity-25 animate-pulse"
        style={{
          width: "50vw",
          height: "50vw",
          maxWidth: 400,
          maxHeight: 400,
          bottom: "-10%",
          right: "-10%",
          background: "radial-gradient(circle, hsl(220 80% 50%), transparent 70%)",
          animationDuration: "8s",
          animationDelay: "2s",
        }}
      />
      {/* Center accent */}
      <div
        className="absolute rounded-full blur-3xl opacity-15 animate-pulse"
        style={{
          width: "40vw",
          height: "40vw",
          maxWidth: 320,
          maxHeight: 320,
          top: "40%",
          left: "30%",
          background: "radial-gradient(circle, hsl(300 60% 50%), transparent 70%)",
          animationDuration: "10s",
          animationDelay: "4s",
        }}
      />
    </>
  );

  const lightOrbs = (
    <>
      {/* Top-left orb */}
      <div
        className="absolute rounded-full blur-3xl opacity-20 animate-pulse"
        style={{
          width: "60vw",
          height: "60vw",
          maxWidth: 480,
          maxHeight: 480,
          top: "-15%",
          left: "-15%",
          background: "radial-gradient(circle, hsl(263 70% 75%), transparent 70%)",
          animationDuration: "6s",
        }}
      />
      {/* Bottom-right orb */}
      <div
        className="absolute rounded-full blur-3xl opacity-15 animate-pulse"
        style={{
          width: "50vw",
          height: "50vw",
          maxWidth: 400,
          maxHeight: 400,
          bottom: "-10%",
          right: "-10%",
          background: "radial-gradient(circle, hsl(220 80% 70%), transparent 70%)",
          animationDuration: "8s",
          animationDelay: "2s",
        }}
      />
      {/* Center accent */}
      <div
        className="absolute rounded-full blur-3xl opacity-10 animate-pulse"
        style={{
          width: "40vw",
          height: "40vw",
          maxWidth: 320,
          maxHeight: 320,
          top: "40%",
          left: "30%",
          background: "radial-gradient(circle, hsl(300 60% 70%), transparent 70%)",
          animationDuration: "10s",
          animationDelay: "4s",
        }}
      />
    </>
  );

  return (
    <div
      className={`fixed inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {theme === "dark" ? darkOrbs : lightOrbs}
    </div>
  );
}
