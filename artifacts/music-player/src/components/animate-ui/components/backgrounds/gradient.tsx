import { useTheme } from "@/context/ThemeContext";

interface GradientBackgroundProps {
  className?: string;
}

export function GradientBackground({ className = "" }: GradientBackgroundProps) {
  const { theme } = useTheme();

  const darkOrbs = (
    <>
      <div
        className="absolute rounded-full blur-3xl animate-pulse"
        style={{
          opacity: 0.35,
          width: "65vw",
          height: "65vw",
          maxWidth: 520,
          maxHeight: 520,
          top: "-18%",
          left: "-18%",
          background: "radial-gradient(circle, hsl(263 70% 55%), transparent 70%)",
          animationDuration: "6s",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl animate-pulse"
        style={{
          opacity: 0.28,
          width: "55vw",
          height: "55vw",
          maxWidth: 440,
          maxHeight: 440,
          bottom: "-12%",
          right: "-12%",
          background: "radial-gradient(circle, hsl(220 80% 50%), transparent 70%)",
          animationDuration: "8s",
          animationDelay: "2s",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl animate-pulse"
        style={{
          opacity: 0.18,
          width: "40vw",
          height: "40vw",
          maxWidth: 320,
          maxHeight: 320,
          top: "42%",
          left: "32%",
          background: "radial-gradient(circle, hsl(300 60% 50%), transparent 70%)",
          animationDuration: "10s",
          animationDelay: "4s",
        }}
      />
    </>
  );

  const lightOrbs = (
    <>
      {/* Top-left: warm violet */}
      <div
        className="absolute rounded-full blur-3xl animate-pulse"
        style={{
          opacity: 0.45,
          width: "70vw",
          height: "70vw",
          maxWidth: 560,
          maxHeight: 560,
          top: "-20%",
          left: "-20%",
          background: "radial-gradient(circle, hsl(263 85% 72%), transparent 68%)",
          animationDuration: "6s",
        }}
      />
      {/* Bottom-right: sky blue */}
      <div
        className="absolute rounded-full blur-3xl animate-pulse"
        style={{
          opacity: 0.38,
          width: "60vw",
          height: "60vw",
          maxWidth: 480,
          maxHeight: 480,
          bottom: "-14%",
          right: "-14%",
          background: "radial-gradient(circle, hsl(200 90% 65%), transparent 68%)",
          animationDuration: "8s",
          animationDelay: "2s",
        }}
      />
      {/* Centre: rose / pink */}
      <div
        className="absolute rounded-full blur-3xl animate-pulse"
        style={{
          opacity: 0.28,
          width: "45vw",
          height: "45vw",
          maxWidth: 360,
          maxHeight: 360,
          top: "38%",
          left: "28%",
          background: "radial-gradient(circle, hsl(330 80% 70%), transparent 68%)",
          animationDuration: "10s",
          animationDelay: "3.5s",
        }}
      />
      {/* Extra: top-right teal accent */}
      <div
        className="absolute rounded-full blur-3xl animate-pulse"
        style={{
          opacity: 0.22,
          width: "35vw",
          height: "35vw",
          maxWidth: 280,
          maxHeight: 280,
          top: "-5%",
          right: "5%",
          background: "radial-gradient(circle, hsl(170 70% 60%), transparent 68%)",
          animationDuration: "12s",
          animationDelay: "1s",
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
