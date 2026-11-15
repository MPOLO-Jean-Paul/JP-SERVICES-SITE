import { BookOpen, Boxes, CalendarCheck, CircleHelp, Compass, Download, FolderKanban, GraduationCap, Handshake, LifeBuoy, MessagesSquare, Newspaper, Rocket, School, Send, Users, Video, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "graduation-cap": GraduationCap,
  video: Video,
  "book-open": BookOpen,
  "calendar-check": CalendarCheck,
  "life-buoy": LifeBuoy,
  compass: Compass,
  rocket: Rocket,
  newspaper: Newspaper,
  "messages-square": MessagesSquare,
  users: Users,
  boxes: Boxes,
  download: Download,
  school: School,
  "circle-help": CircleHelp,
  handshake: Handshake,
  send: Send,
  "folder-kanban": FolderKanban,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? CircleHelp;
  return <Cmp className={className} aria-hidden />;
}
