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

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackRate: number;
  preservesPitch: boolean;
  audioError: string | null;
}

interface PlayerContextType extends PlayerState {
  folders: Folder[];
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setPlaybackRate: (rate: number) => void;
  setPreservesPitch: (v: boolean) => void;
  addFolder: (folder: Folder) => void;
  removeFolder: (folderId: string) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const STORAGE_KEY = "mp-folders";
const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY as string;

function buildAudioUrl(fileId: string): string {
  // Drive API alt=media — streams public files correctly with proper CORS headers
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${API_KEY}`;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [preservesPitch, setPreservesPitchState] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);
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

  // Sync playback rate & pitch
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
    audio.preservesPitch = preservesPitch;
  }, [playbackRate, preservesPitch]);

  // Audio event listeners
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
    const handleCanPlay = () => setAudioError(null);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("canplay", handleCanPlay);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  const playTrack = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioError(null);
    const url = buildAudioUrl(track.fileId);
    audio.src = url;
    audio.playbackRate = playbackRate;
    audio.preservesPitch = preservesPitch;
    audio.load();
    audio.play().catch((err) => {
      console.error("Audio play error:", err);
      setIsPlaying(false);
    });
    setCurrentTrack(track);
    setIsPlaying(true);
  }, [playbackRate, preservesPitch]);

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
    setPlaybackRateState(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  const setPreservesPitch = useCallback((v: boolean) => {
    setPreservesPitchState(v);
    if (audioRef.current) audioRef.current.preservesPitch = v;
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
    }
  }, [currentTrack]);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      playbackRate,
      preservesPitch,
      audioError,
      folders,
      playTrack,
      togglePlay,
      setPlaybackRate,
      setPreservesPitch,
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
