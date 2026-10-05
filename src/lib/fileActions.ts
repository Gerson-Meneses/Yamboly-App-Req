export function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

type NavigatorWithShare = Navigator & {
  canShare?: (data?: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
};

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled';

/**
 * Shares a file via the Web Share API (so the user can send it straight to
 * WhatsApp, Mail, Drive, etc.) when the browser/device supports sharing
 * files. Falls back to a regular download when it doesn't, or if the user
 * dismisses the share sheet with an actual error (not a simple cancel).
 */
export async function shareFile(file: File, title?: string): Promise<ShareOutcome> {
  const nav = navigator as NavigatorWithShare;

  if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: title ?? file.name });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'cancelled';
      }
      // Any other failure: fall back to a plain download below.
    }
  }

  downloadFile(file);
  return 'downloaded';
}
