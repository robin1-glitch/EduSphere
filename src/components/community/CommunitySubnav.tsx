import { Link, useRouterState } from "@tanstack/react-router";
import { Megaphone, MessagesSquare, Star } from "lucide-react";

const ITEMS = [
  { to: "/community", label: "Discussions", icon: MessagesSquare },
  { to: "/reviews", label: "Course reviews", icon: Star },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
] as const;

export function CommunitySubnav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="community-subnav" aria-label="Community sections">
      {ITEMS.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <Link key={to} to={to} className={`community-subnav__link${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
            <Icon aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
