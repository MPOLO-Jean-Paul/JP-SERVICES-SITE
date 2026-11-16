import { createElement } from "react";
import {
 ArrowRight, ArrowUp, ArrowUpRight, Bell, BookOpen, CalendarCheck, CalendarDays,
 Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Contrast, Download, FileText,
 FolderOpen, GraduationCap, Grid2X2, Handshake, Headset, Info, Languages, LayoutGrid,
 LockKeyhole, LogOut, Mail, MapPin, Menu, MessageSquareText, Monitor, Moon, Newspaper,
 Rocket, Search, Settings, Shield, Sun, UserRound, Users, Video, X, Network, House,
 Phone, Building2, ListFilter, Sparkles, FolderKanban, Send, BriefcaseBusiness,
 Laptop, CircleUserRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
type Props={name:string;size?:number;filled?:boolean;className?:string};
/** Local SVG symbols: no Google Fonts dependence and no broken text ligatures on slow mobile connections. */
const icons: Record<string,LucideIcon>={
 menu:Menu,close:X,search:Search,help:CircleHelp,north_east:ArrowUpRight,
 arrow_forward:ArrowRight,arrow_upward:ArrowUp,chevron_right:ChevronRight,
 keyboard_arrow_down:ChevronDown,check:Check,school:GraduationCap,apps:LayoutGrid,
 workspaces:Users,rocket_launch:Rocket,videocam:Video,video:Video,
 download:Download,folder_open:FolderOpen,account_tree:Network,
 calendar_month:CalendarDays,event_available:CalendarCheck,schedule:Clock3,
 location_on:MapPin,info:Info,mail:Mail,language:Languages,contrast:Contrast,
 light_mode:Sun,dark_mode:Moon,desktop_windows:Monitor,
 account_circle:CircleUserRound,person:UserRound,groups:Users,
 notifications:Bell,settings:Settings,logout:LogOut,shield:Shield,
 newspaper:Newspaper,forum:MessageSquareText,handshake:Handshake,
 menu_book:BookOpen,support_agent:Headset,explore:Search,send:Send,
 home:House,phone:Phone,business:Building2,list:ListFilter,lock:LockKeyhole,
 article:FileText,star:Sparkles,folder_kanban:FolderKanban,laptop:Laptop,
 briefcase:BriefcaseBusiness,apps_outage:Grid2X2
};
export function MaterialIcon({name,size=20,filled=false,className}:Props){
 const Icon=icons[name]??CircleHelp;
 return createElement(Icon,{className:cn("jp-md3-icon",className),style:{width:size,height:size,flexShrink:0},
  strokeWidth:filled?2.35:1.9,"aria-hidden":true,focusable:"false"});
}
