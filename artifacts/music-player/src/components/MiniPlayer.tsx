import { useState, useRef, useEffect } from "react";
import { Play, Pause, Settings, X, AlertCircle } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function SpeedMenu({
  onClose,
  anchorRef,
}: {
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { playbackRate, setPlaybackRate, preservesPitch, setPreservesPitch } = usePlayer();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  return (
    <div
      ref={menuRef}
      className="
        absolute bottom-full mb-3 right-0
        w-56 rounded-2xl border border-border
        bg-card/95 backdrop-blur-md
        shadow-xl p-3 z-50
        animate-in fade-in slide-in-from-bottom-2 duration-150
      "
      data-testid="settings-menu"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Playback Settings
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground press-scale p-0.5"
          data-testid="button-close-settings"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mb-3">
        <p className="text-xs text-muted-foreground mb-2">Speed</p>
        <div className="grid grid-cols-4 gap-1">
          {SPEED_OPTIONS.map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              data-testid={`button-speed-${rate}`}
              className={`
                py-1.5 rounded-lg text-xs font-medium press-scale
                ${playbackRate === rate
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }
              `}
            >
              {rate === 1 ? "1×" : `${rate}×`}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <button
          onClick={() => setPreservesPitch(!preservesPitch)}
          data-testid="button-toggle-pitch"
          className="w-full flex items-center justify-between px-1 press-scale"
        >
          <div>
            <p className="text-xs font-medium text-foreground text-left">Pitch Adjustment</p>
            <p className="text-xs text-muted-foreground text-left mt-0.5">
              {preservesPitch ? "Pitch stays normal" : "Pitch shifts with speed"}
            </p>
          </div>
          <div
            className={`
              relative flex-shrink-0 ml-3 rounded-full
              transition-colors duration-200
              ${preservesPitch ? "bg-muted" : "bg-primary"}
            `}
            style={{ width: "2rem", height: "1.1rem" }}
          >
            <div
              className={`
                absolute top-0.5 w-3 h-3 rounded-full bg-white shadow
                transition-transform duration-200
                ${preservesPitch ? "translate-x-0.5" : "translate-x-3.5"}
              `}
            />
          </div>
        </button>
        {!preservesPitch && (
          <p className="text-xs text-primary/80 mt-1.5 px-1">
            Pitch shifts up/down with speed changes
          </p>
        )}
      </div>
    </div>
  );
}

export function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, audioError } = usePlayer();
  const [showSettings, setShowSettings] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  if (!currentTrack) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-2"
      data-testid="mini-player"
    >
      <div
        className="
          relative max-w-lg mx-auto
          rounded-2xl border border-border/80
          bg-card/85 backdrop-blur-xl
          shadow-2xl px-4 py-3
        "
      >
        {/* Error banner */}
        {audioError && (
          <div
            className="flex items-start gap-2 mb-3 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20"
            data-testid="text-audio-error"
          >
            <AlertCircle size={13} className="text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-xs text-destructive leading-snug">{audioError}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium text-foreground truncate"
              data-testid="text-current-track"
            >
              {currentTrack.name}
            </p>
            <p
              className="text-xs text-muted-foreground truncate mt-0.5"
              data-testid="text-current-folder"
            >
              {currentTrack.folderName}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              data-testid="button-play-pause"
              disabled={!!audioError}
              className="
                w-10 h-10 rounded-full
                bg-primary text-primary-foreground
                flex items-center justify-center
                press-scale hover:opacity-90
                shadow-md disabled:opacity-40
              "
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>

            {/* Settings */}
            <div className="relative">
              <button
                ref={settingsBtnRef}
                onClick={() => setShowSettings((v) => !v)}
                data-testid="button-settings"
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center press-scale
                  ${showSettings
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                `}
                aria-label="Playback settings"
              >
                <Settings size={17} />
              </button>

              {showSettings && (
                <SpeedMenu
                  onClose={() => setShowSettings(false)}
                  anchorRef={settingsBtnRef}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
