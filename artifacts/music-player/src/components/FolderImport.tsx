import { useState } from "react";
import { Loader2, FolderSymlink, ClipboardPaste } from "lucide-react";
import { parseFolderId, fetchFolderContents } from "@/lib/googleDrive";
import { usePlayer, type Folder, type Track } from "@/context/PlayerContext";

export function FolderImport() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addFolder } = usePlayer();

  const handleFetch = async () => {
    const folderId = parseFolderId(link);
    if (!folderId) {
      setError("Maaf, link-nya salah.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await fetchFolderContents(folderId);
      if (result.files.length === 0) {
        setError("Pastikan akses foldernya sudah publik ya.");
        setLoading(false);
        return;
      }
      const tracks: Track[] = result.files.map((f) => ({
        id: f.id,
        name: f.name.replace(/\.[^/.]+$/, ""), // strip extension
        fileId: f.id,
        folderId: result.id,
        folderName: result.name,
      }));
      const folder: Folder = {
        id: result.id,
        name: result.name,
        link: link.trim(),
        tracks,
        fetchedAt: Date.now(),
      };
      addFolder(folder);
      setLink("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat folder.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && link.trim()) {
      handleFetch();
    }
  };

  return (
    <div className="w-full" data-testid="folder-import">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <ClipboardPaste
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            size={16}
          />
          <input
            type="url"
            value={link}
            onChange={(e) => {
              setLink(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Paste Google Drive folder link…"
            disabled={loading}
            data-testid="input-drive-link"
            className="
              w-full pl-9 pr-4 py-3 rounded-xl text-sm
              bg-card border border-border
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
              disabled:opacity-50
              transition-all duration-200
            "
          />
        </div>
        <button
          onClick={handleFetch}
          disabled={loading || !link.trim()}
          data-testid="button-fetch-folder"
          className="
            flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium
            bg-primary text-primary-foreground
            disabled:opacity-40 disabled:cursor-not-allowed
            press-scale hover:opacity-90
          "
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FolderSymlink size={16} />
          )}
          <span className="hidden sm:inline">{loading ? "Loading…" : "Add"}</span>
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-destructive px-1" data-testid="text-import-error">
          {error}
        </p>
      )}
    </div>
  );
}
