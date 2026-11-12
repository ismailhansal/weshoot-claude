/** Utilitaires médias partagés (espace prestataire) : aperçus légers, formats, tailles. */

export type MediaItem = {
  id: string;
  /** URL d'asset, data URL (images réduites) ou URL de session (vidéos) */
  src: string;
  kind: "image" | "video";
  name: string;
};

export function newId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

export function readDimensions(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const done = () => URL.revokeObjectURL(url);
    if (file.type.startsWith("video/")) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => { resolve({ w: v.videoWidth, h: v.videoHeight }); done(); };
      v.onerror = () => { done(); reject(new Error("video")); };
      v.src = url;
    } else {
      const img = new Image();
      img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); done(); };
      img.onerror = () => { done(); reject(new Error("image")); };
      img.src = url;
    }
  });
}

/** Format vertical strict de la vitrine : 4:5 ou 9:16 (petite tolérance). */
export function isShowcaseRatio(w: number, h: number) {
  if (!w || !h) return false;
  const r = w / h;
  return Math.abs(r - 4 / 5) <= 0.03 || Math.abs(r - 9 / 16) <= 0.03;
}

/** Image réduite (côté max) en data URL JPEG, pour rester léger dans le stockage du navigateur. */
export function imageToDataUrl(file: File, maxSide = 900, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("canvas")); return; }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image")); };
    img.src = url;
  });
}

/** Convertit un fichier en MediaItem : image réduite (conservée) ou vidéo (URL valable pendant la session). */
export async function fileToMedia(file: File): Promise<MediaItem> {
  if (file.type.startsWith("video/")) {
    return { id: newId("media"), src: URL.createObjectURL(file), kind: "video", name: file.name };
  }
  return { id: newId("media"), src: await imageToDataUrl(file), kind: "image", name: file.name };
}
