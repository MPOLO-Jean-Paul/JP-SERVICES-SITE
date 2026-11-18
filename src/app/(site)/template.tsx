/** Transition d’entrée de page : un fondu bref à chaque navigation, comme dans une application. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <div className="jp-page-enter">{children}</div>;
}
