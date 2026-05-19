import { useState } from "react";
import { ChevronDown, ChevronRight, Trash2, Music } from "lucide-react";
import { usePlayer, type Folder } from "@/context/PlayerContext";
import AnimatedList from "@/components/AnimatedList/AnimatedList";

interface FolderItemProps {
  folder: Folder;
}

function FolderItem({ folder }: FolderItemProps) {
  const [open, setOpen] = useState(true);
  const { playTrack, currentTrack, removeFolder } = usePlayer();

  const trackNames = folder.tracks.map((t) => t.name);

  const activeIndex = folder.tracks.findIndex((t) => t.id === currentTrack?.id);

  const handleSelect = (_item: string, index: number) => {
    const track = folder.tracks[index];
    if (track) playTrack(track);
  };

  return (
    <div className="mb-3" data-testid={`folder-${folder.id}`}>
      {/* Folder header */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setOpen((v) => !v)}
          data-testid={`button-toggle-folder-${folder.id}`}
          className="
            flex-1 flex items-center gap-2 py-2 px-3 rounded-xl
            text-left text-sm font-medium text-foreground
            bg-card border border-border
            hover:bg-accent/50 press-scale
          "
        >
          {open ? (
            <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
          )}
          <span className="truncate">{folder.name}</span>
          <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
            {folder.tracks.length} tracks
          </span>
        </button>
        <button
          onClick={() => removeFolder(folder.id)}
          data-testid={`button-remove-folder-${folder.id}`}
          className="
            p-2 rounded-lg text-muted-foreground
            hover:text-destructive hover:bg-destructive/10
            press-scale
          "
          aria-label="Remove folder"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Animated track list */}
      {open && (
        <div className="ml-2">
          {folder.tracks.length === 0 ? (
            <div className="py-3 px-3 text-xs text-muted-foreground">No audio files.</div>
          ) : (
            <AnimatedList
              items={trackNames}
              onItemSelect={handleSelect}
              activeIndex={activeIndex}
              showGradients={folder.tracks.length > 7}
              enableArrowNavigation={false}
              displayScrollbar={false}
              initialSelectedIndex={activeIndex}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function FolderList() {
  const { folders } = usePlayer();

  if (folders.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-12 text-center"
        data-testid="empty-folders"
      >
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
          <Music size={24} className="text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">No folders yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
          Paste a public Google Drive folder link above to get started
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col" data-testid="folder-list">
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
    </div>
  );
}
