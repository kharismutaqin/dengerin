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

function buildAudioUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [preservesPitch, setPreservesPitchState] = useState(true);
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

  const playTrack = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    const url = buildAudioUrl(track.fileId);
    audio.src = url;
    audio.playbackRate = playbackRate;
    audio.preservesPitch = preservesPitch;
    audio.play().catch(() => {});
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
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying, currentTrack]);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const setPreservesPitch = useCallback((v: boolean) => {
    setPreservesPitchState(v);
    if (audioRef.current) {
      audioRef.current.preservesPitch = v;
    }
  }, []);

  const addFolder = useCallback((folder: Folder) => {
    setFolders((prev) => {
      const exists = prev.find((f) => f.id === folder.id);
      if (exists) {
        return prev.map((f) => (f.id === folder.id ? folder : f));
      }
      return [...prev, folder];
    });
  }, []);

  const removeFolder = useCallback((folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    if (currentTrack?.folderId === folderId) {
      audioRef.current?.pause();
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  }, [currentTrack]);

  // Listen for audio end
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      playbackRate,
      preservesPitch,
      folders,
      playTrack,
      togglePlay,
      setPlaybackRate,
      setPreservesPitch,
      addFolder,
      removeFolder,
      audioRef,
    }}>
      {/* Hidden audio element */}
      <audio ref={audioRef} />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
