import { Bell, Boxes, CalendarCheck, ChartColumn, Download, FolderKanban, GraduationCap, Handshake, HeartPulse, IdCard, LifeBuoy, Mail, MessagesSquare, Newspaper, ScrollText, Send, Settings, Users, Video, type LucideIcon } from "lucide-react";
const ICONS: Record<string, LucideIcon> = { chart: ChartColumn, users: Users, "graduation-cap": GraduationCap, "calendar-check": CalendarCheck, bell: Bell, video: Video, download: Download, newspaper: Newspaper, boxes: Boxes, "folder-kanban": FolderKanban, "messages-square": MessagesSquare, handshake: Handshake, send: Send, "life-buoy": LifeBuoy, mail: Mail, "id-card": IdCard, settings: Settings, "heart-pulse": HeartPulse, scroll: ScrollText };
export function AdminIcon({ name, className }: { name: string; className?: string }) {
  const C = ICONS[name] ?? Settings;
  return <C className={className} aria-hidden />;
}
