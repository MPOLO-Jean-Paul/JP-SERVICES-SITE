import { createElement } from "react";
import { Mail, UserRound, LockKeyhole, Phone, Building2, MessageSquareText, FileText, FolderKanban, ListFilter, CalendarDays, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Field({ label, htmlFor, hint, error, children, className, optional }: { label: string; htmlFor: string; hint?: string; error?: string; children: React.ReactNode; className?: string; optional?: boolean }) {
 return <div className={cn("min-w-0",className)}>
  <label className="label" htmlFor={htmlFor}>{label}{optional?<span className="ml-1 font-normal text-muted">(facultatif)</span>:null}</label>
  {children}
  {error?<p className="mt-1.5 text-xs font-medium text-danger" role="alert">{error}</p>
  :hint?<p className="hint">{hint}</p>:null}
 </div>;
}

const ICONS: Record<string,LucideIcon>={
 email:Mail,courriel:Mail,prenom:UserRound,nom:UserRound,contact_nom:UserRound,
 mot_de_passe:LockKeyhole,confirmer_mot_de_passe:LockKeyhole,password:LockKeyhole,
 telephone:Phone,phone:Phone,organisation:Building2,message:MessageSquareText,
 description:MessageSquareText,sujet:FileText,titre:FolderKanban,query:Search,q:Search,
 date:CalendarDays
};
function fieldIcon(type?:string,name?:string,id?:string,autoComplete?:string): LucideIcon|null {
 if(type==="hidden"||type==="checkbox"||type==="radio"||type==="file")return null;
 if(type==="email"||autoComplete==="email")return Mail;
 if(type==="password"||autoComplete?.includes("password"))return LockKeyhole;
 if(type==="tel"||autoComplete==="tel")return Phone;
 if(type==="search")return Search;
 return ICONS[name??""]??ICONS[id??""]??null;
}

export function Input({className,name,id,type,autoComplete,...props}:React.InputHTMLAttributes<HTMLInputElement>){
 const Icon=fieldIcon(type,name,id,autoComplete);
 const input=<input className={cn("field",Icon&&"jp-field-with-icon",className)} id={id} name={name}
  type={type} autoComplete={autoComplete} {...props}/>;
 return Icon?<span className="jp-field-shell">
   {createElement(Icon,{"aria-hidden":true,className:"jp-field-leading",size:18,strokeWidth:1.8})}
   {input}
  </span>:input;
}
export function Textarea({className,...props}:React.TextareaHTMLAttributes<HTMLTextAreaElement>){
 return <span className="jp-field-shell jp-field-shell-textarea">
   <MessageSquareText aria-hidden="true" className="jp-field-leading" size={18} strokeWidth={1.8}/>
   <textarea className={cn("field min-h-32 resize-y jp-field-with-icon",className)} {...props}/>
  </span>;
}
export function Select({className,...props}:React.SelectHTMLAttributes<HTMLSelectElement>){
 return <span className="jp-field-shell">
  <ListFilter aria-hidden="true" className="jp-field-leading" size={18} strokeWidth={1.8}/>
  <select className={cn("field jp-field-with-icon appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2376708a%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22m6 9 6 6 6-6%22/%3E%3C/svg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10",className)} {...props}/>
 </span>;
}
export function Checkbox({className,label,...props}:React.InputHTMLAttributes<HTMLInputElement>&{label:React.ReactNode}){
 return <label className={cn("flex cursor-pointer items-start gap-3 text-sm text-copy",className)}>
  <input type="checkbox" className="mt-0.5 size-4 shrink-0 rounded border-line accent-[var(--primary)]" {...props}/>
  <span>{label}</span>
 </label>;
}
