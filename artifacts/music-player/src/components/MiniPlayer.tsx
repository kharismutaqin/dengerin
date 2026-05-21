import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Settings, X, AlertCircle } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(secs: number): string {
  if (!isFinite(secs) || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function SpeedMenu({
  onClose,
  anchorRef,
}: {
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { playbackRate, setPlaybackRate, preservesPitch, setPreservesPitch } =
    usePlayer();
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
      className="absolute bottom-full right-0 mb-3 w-56 z-[60] origin-bottom-right animate-in fade-in slide-in-from-bottom-2 duration-150"
      data-testid="settings-menu"
    >
      <div className="w-full rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-foreground tracking-wider">
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
                  ${
                    playbackRate === rate
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }
                `}
              >
                {rate === 1 ? "1×" : `${rate}×`}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border/60 pt-3">
          <button
            onClick={() => setPreservesPitch(!preservesPitch)}
            data-testid="button-toggle-pitch"
            className="w-full flex items-center justify-between px-1 press-scale"
          >
            <div>
              <p className="text-xs font-medium text-foreground text-left">
                Pitch Adjustment
              </p>
              <p className="text-xs text-muted-foreground text-left mt-0.5">
                {preservesPitch
                  ? "Pitch stays normal"
                  : "Pitch shifts with speed"}
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
            <p className="text-xs text-primary/80 mt-1.5 px-1"></p>
          )}
        </div>
      </div>
    </div>
  );
}

function SeekBar() {
  const { currentTime, duration, seek } = usePlayer();
  const [dragging, setDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  const displayTime = dragging ? dragValue : currentTime;
  const progress = duration > 0 ? displayTime / duration : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDragValue(Number(e.target.value));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    setDragging(true);
    setDragValue(Number((e.target as HTMLInputElement).value));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
    setDragging(true);
    setDragValue(Number((e.target as HTMLInputElement).value));
  };

  const commitSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
    setDragging(false);
  };

  return (
    <div
      className="flex items-center gap-2 mt-2.5"
      data-testid="seek-bar-container"
    >
      <span className="text-xs text-muted-foreground tabular-nums w-8 flex-shrink-0">
        {formatTime(displayTime)}
      </span>

      <div className="relative flex-1 h-1 group">
        <div className="absolute inset-0 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-none"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={dragging ? dragValue : currentTime}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseUp={commitSeek}
          onTouchEnd={commitSeek}
          disabled={duration === 0}
          data-testid="input-seekbar"
          className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-default"
          style={{ height: "100%" }}
        />
      </div>

      <span className="text-xs text-muted-foreground tabular-nums w-8 flex-shrink-0 text-right">
        {formatTime(duration)}
      </span>
    </div>
  );
}

export function MiniPlayer() {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrevious, audioError } = usePlayer();
  const [showSettings, setShowSettings] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  if (!currentTrack) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-2"
      data-testid="mini-player"
    >
      <div className="relative max-w-lg mx-auto rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-2xl px-4 pt-3 pb-3">
        {audioError && (
          <div
            className="flex items-start gap-2 mb-3 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/20"
            data-testid="text-audio-error"
          >
            <AlertCircle
              size={13}
              className="text-destructive flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-destructive leading-snug">
              {audioError}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium text-foreground truncate"
              data-testid="text-current-track"
            >
              {currentTrack.name}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={playPrevious}
              disabled={!!audioError}
              className="
                w-9 h-9 rounded-full
                text-muted-foreground hover:text-foreground
                flex items-center justify-center
                press-scale hover:opacity-90
                disabled:opacity-40
              "
              aria-label="Previous track"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={togglePlay}
              data-testid="button-play-pause"
              disabled={!!audioError}
              className="
                w-10 h-10 rounded-full
                bg-primary text-primary-foreground
                flex items-center justify-center
                press-scale hover:opacity-90 shadow-md
                disabled:opacity-40
              "
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause size={18} />
              ) : (
                <Play size={18} className="ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              disabled={!!audioError}
              className="
                w-9 h-9 rounded-full
                text-muted-foreground hover:text-foreground
                flex items-center justify-center
                press-scale hover:opacity-90
                disabled:opacity-40
              "
              aria-label="Next track"
            >
              <SkipForward size={18} />
            </button>

            <div className="relative">
              <button
                ref={settingsBtnRef}
                onClick={() => setShowSettings((v) => !v)}
                data-testid="button-settings"
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center press-scale
                  ${
                    showSettings
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/10"
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

        <SeekBar />
      </div>
    </div>
  );
}
