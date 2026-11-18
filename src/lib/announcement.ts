/** Cookie de session mémorisant l’annonce fermée (empreinte courte du texte). */
export const ANNOUNCEMENT_COOKIE = "jp_announce_closed";

export function announcementKey(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}
