import { MaterialIcon } from "@/components/ui/material-symbol";

const SYMBOLS: Record<string, string> = {
  "graduation-cap": "school",
  video: "videocam",
  "book-open": "menu_book",
  "calendar-check": "event_available",
  "life-buoy": "support_agent",
  compass: "explore",
  rocket: "rocket_launch",
  newspaper: "newspaper",
  "messages-square": "forum",
  users: "groups",
  boxes: "apps",
  download: "download",
  school: "school",
  "circle-help": "help",
  settings: "settings",
  notifications: "notifications",
  handshake: "handshake",
  send: "send",
  "folder-kanban": "folder_open",
};

export function Icon({ name, className }: { name: string; className?: string }) {
  return <MaterialIcon name={SYMBOLS[name] ?? "help"} size={16} className={className} />;
}
