const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY as string;

export function parseFolderId(link: string): string | null {
  // Various Google Drive folder URL formats
  const patterns = [
    /\/folders\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]{28,})$/,
  ];
  for (const pattern of patterns) {
    const match = link.trim().match(pattern);
    if (match) return match[1];
  }
  return null;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  files: DriveFile[];
}

const AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/flac",
  "audio/aac",
  "audio/x-m4a",
  "audio/mp4",
  "audio/webm",
  "audio/x-wav",
];

export async function fetchFolderContents(folderId: string): Promise<DriveFolder> {
  if (!API_KEY) {
    throw new Error("Google Drive API key is not configured. Add VITE_GOOGLE_DRIVE_API_KEY to your environment.");
  }

  // Fetch folder metadata
  const folderUrl = new URL(`https://www.googleapis.com/drive/v3/files/${folderId}`);
  folderUrl.searchParams.set("key", API_KEY);
  folderUrl.searchParams.set("fields", "id,name");

  const folderRes = await fetch(folderUrl.toString());
  if (!folderRes.ok) {
    const err = await folderRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch folder: ${folderRes.status}`);
  }
  const folderData = await folderRes.json();

  // Fetch files inside folder — paginate if needed
  const files: DriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const filesUrl = new URL("https://www.googleapis.com/drive/v3/files");
    filesUrl.searchParams.set("key", API_KEY);
    filesUrl.searchParams.set("q", `'${folderId}' in parents and trashed = false`);
    filesUrl.searchParams.set("fields", "nextPageToken,files(id,name,mimeType)");
    filesUrl.searchParams.set("pageSize", "1000");
    if (pageToken) filesUrl.searchParams.set("pageToken", pageToken);

    const filesRes = await fetch(filesUrl.toString());
    if (!filesRes.ok) {
      const err = await filesRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Failed to fetch files: ${filesRes.status}`);
    }
    const filesData = await filesRes.json();
    const fetched: DriveFile[] = filesData.files || [];
    files.push(...fetched);
    pageToken = filesData.nextPageToken;
  } while (pageToken);

  // Filter to audio files only
  const audioFiles = files.filter((f) =>
    AUDIO_MIME_TYPES.some((m) => f.mimeType.startsWith(m)) ||
    /\.(mp3|wav|ogg|flac|aac|m4a|opus|webm)$/i.test(f.name)
  );

  return {
    id: folderData.id,
    name: folderData.name,
    files: audioFiles,
  };
}
