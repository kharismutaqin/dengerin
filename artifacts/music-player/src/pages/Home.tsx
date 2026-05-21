import { GradientBackground } from "@/components/animate-ui/components/backgrounds/gradient";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FolderImport } from "@/components/FolderImport";
import { FolderList } from "@/components/FolderList";
import { MiniPlayer } from "@/components/MiniPlayer";
import { usePlayer } from "@/context/PlayerContext";

export function Home() {
  const { currentTrack } = usePlayer();

  return (
    <>
      {/* Gradient background — sits behind everything */}
      <GradientBackground />

      {/* Main layout */}
      <div
        className="relative z-10 min-h-screen flex flex-col"
        style={{ paddingBottom: currentTrack ? "5.5rem" : "1rem" }}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <img
              src={`${import.meta.env.BASE_URL}favicon.svg`}
              alt=""
              className="w-6 h-6"
              style={{ filter: "drop-shadow(0 0 4px rgba(150,102,227,0.4))" }}
            />
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                G Player
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Import input */}
        <div className="px-5 mb-5">
          <FolderImport />
        </div>

        {/* Folder list */}
        <div className="flex-1 px-5 overflow-y-auto">
          <FolderList />
        </div>
      </div>

      {/* Mini player — fixed at bottom */}
      <MiniPlayer />
    </>
  );
}
