export const PRIMARY_NAV = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
  { to: "/community", label: "Community" },
] as const;

const COMMUNITY_PREFIXES = ["/community", "/reviews", "/announcements"];

export function isNavActive(to: string, pathname: string) {
  if (to === "/") return pathname === "/";
  if (to === "/community") return COMMUNITY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  return pathname === to || pathname.startsWith(`${to}/`);
}
