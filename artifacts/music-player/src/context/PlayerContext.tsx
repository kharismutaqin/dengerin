import { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";

export interface Track {
  id: string;
  name: string;
  fileId: string;
  folderId: string;
  folderName: string;
}

export interface Folder {
  id: string;
  name: string;
  link: string;
  tracks: Track[];
  fetchedAt: number;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackRate: number;
  preservesPitch: boolean;
  audioError: string | null;
  currentTime: number;
  duration: number;
  folders: Folder[];
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setPlaybackRate: (rate: number) => void;
  setPreservesPitch: (v: boolean) => void;
  seek: (time: number) => void;
  addFolder: (folder: Folder) => void;
  removeFolder: (folderId: string) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const STORAGE_KEY = "mp-folders";
const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY as string;

function buildAudioUrl(fileId: string): string {
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [preservesPitch, setPreservesPitchState] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Store latest rate/pitch in refs so event handlers always see current values
  const playbackRateRef = useRef(1);
  const preservesPitchRef = useRef(true);

  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Persist folders
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  }, [folders]);

  // Wire up all audio event listeners once
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);

    const handleError = () => {
      setIsPlaying(false);
      setAudioError(
        "Could not play this file. Make sure the Google Drive folder is shared publicly (\"Anyone with the link\")."
      );
    };

    // Re-apply rate & pitch every time audio is ready to play.
    // This is the key fix: browsers reset playbackRate to 1 after src/load changes.
    const handleCanPlay = () => {
      setAudioError(null);
      audio.playbackRate = playbackRateRef.current;
      audio.preservesPitch = preservesPitchRef.current;
    };

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setCurrentTime(0);
      // Also apply here for browsers that fire loadedmetadata before canplay
      audio.playbackRate = playbackRateRef.current;
      audio.preservesPitch = preservesPitchRef.current;
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const playTrack = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioError(null);
    setCurrentTime(0);
    setDuration(0);
    // Setting src triggers load automatically — no need to call audio.load()
    // Rate/pitch will be re-applied in the canplay / loadedmetadata handlers
    audio.src = buildAudioUrl(track.fileId);
    audio.play().catch((err) => {
      console.error("Audio play error:", err);
      setIsPlaying(false);
    });
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setAudioError(null);
      audio.play().catch((err) => {
        console.error("Audio play error:", err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrack]);

  const setPlaybackRate = useCallback((rate: number) => {
    playbackRateRef.current = rate;
    setPlaybackRateState(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  const setPreservesPitch = useCallback((v: boolean) => {
    preservesPitchRef.current = v;
    setPreservesPitchState(v);
    if (audioRef.current) audioRef.current.preservesPitch = v;
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const addFolder = useCallback((folder: Folder) => {
    setFolders((prev) => {
      const exists = prev.find((f) => f.id === folder.id);
      if (exists) return prev.map((f) => (f.id === folder.id ? folder : f));
      return [...prev, folder];
    });
  }, []);

  const removeFolder = useCallback((folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    if (currentTrack?.folderId === folderId) {
      audioRef.current?.pause();
      setCurrentTrack(null);
      setIsPlaying(false);
      setAudioError(null);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentTrack]);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      playbackRate,
      preservesPitch,
      audioError,
      currentTime,
      duration,
      folders,
      playTrack,
      togglePlay,
      setPlaybackRate,
      setPreservesPitch,
      seek,
      addFolder,
      removeFolder,
      audioRef,
    }}>
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
