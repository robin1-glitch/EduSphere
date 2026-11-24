import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { Brand } from "./Brand";
import { PRIMARY_NAV, isNavActive } from "./nav-links";
import { buttonClass } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { initials, useSession } from "@/lib/session";

function NavList({ pathname, onNavigate, className }: { pathname: string; onNavigate?: () => void; className: string }) {
  return (
    <ul className={className}>
      {PRIMARY_NAV.map((item) => {
        const active = isNavActive(item.to, pathname);
        return (
          <li key={item.to}>
            <Link
              to={item.to}
              className={`es-nav__link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function AccountActions({ onNavigate, stacked }: { onNavigate?: () => void; stacked?: boolean }) {
  const { user, signOut } = useSession();
  if (!user) {
    return (
      <>
        <Link to="/login" className={buttonClass("secondary", { block: stacked })} onClick={onNavigate}>
          Log in
        </Link>
        <Link to="/register" className={buttonClass("primary", { block: stacked })} onClick={onNavigate}>
          Register
        </Link>
      </>
    );
  }
  return (
    <>
      <Link to="/login" className="es-user-chip es-link" onClick={onNavigate} aria-label={`Signed in as ${user.name}. Switch demo account`}>
        <span className="es-avatar" aria-hidden="true">{initials(user.name)}</span>
        <span>{user.name}</span>
        {user.role === "admin" ? <Badge tone="primary" icon={<ShieldCheck aria-hidden="true" />}>Admin</Badge> : <Badge>Student</Badge>}
      </Link>
      <button
        type="button"
        className={buttonClass("secondary", { block: stacked, size: stacked ? "md" : "sm" })}
        onClick={() => {
          signOut();
          onNavigate?.();
        }}
      >
        <LogOut aria-hidden="true" /> Log out
      </button>
    </>
  );
}

export function Navbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="es-header">
      <div className="es-container es-header__inner">
        <Brand />
        <nav className="es-nav" aria-label="Main">
          <NavList pathname={pathname} className="es-nav__list" />
        </nav>
        <div className="es-header__actions">
          <AccountActions />
        </div>

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button type="button" className={buttonClass("secondary", { extra: "es-btn--icon es-header__menu-btn" })} aria-label="Open menu">
              <Menu aria-hidden="true" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="es-overlay" />
            <Dialog.Content className="es-drawer" aria-describedby={undefined}>
              <div className="es-drawer__head">
                <Dialog.Title asChild>
                  <div><Brand onNavigate={close} /></div>
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button type="button" className={buttonClass("ghost", { extra: "es-btn--icon" })} aria-label="Close menu">
                    <X aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>
              <nav aria-label="Mobile">
                <NavList pathname={pathname} onNavigate={close} className="es-drawer__list" />
              </nav>
              <div className="es-drawer__actions">
                <AccountActions onNavigate={close} stacked />
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </header>
  );
}
