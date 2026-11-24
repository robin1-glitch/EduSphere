import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { PlaceholderPage } from "@/components/layout/PlaceholderPage";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { notify } from "@/components/common/Toast";
import { DEMO_USERS, initials, useSession } from "@/lib/session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — EduSphere" },
      { name: "description", content: "Log in to EduSphere to post in the community, write reviews and track your learning." },
      { property: "og:title", content: "Log in — EduSphere" },
      { property: "og:description", content: "Log in to your EduSphere account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, signIn, signOut } = useSession();
  const navigate = useNavigate();

  const choose = (id: string, name: string) => {
    signIn(id);
    notify.success(`Signed in as ${name}`, "Demo account for testing the community module.");
    void navigate({ to: "/community" });
  };

  return (
    <PlaceholderPage title="Log in" module="Identity & Admin">
      <Card as="section" aria-labelledby="demo-title" className="es-stack">
        <div>
          <h2 id="demo-title" className="es-section__title">Demo accounts for testing</h2>
          <p className="es-card__text">Until the real log in is ready, pick an account to try posting, replying, reviewing and admin moderation.</p>
        </div>
        <div className="community-demo-accounts">
          {DEMO_USERS.map((u) => (
            <button key={u.id} type="button" className="community-demo-account" aria-pressed={user?.id === u.id} onClick={() => choose(u.id, u.name)}>
              <span className="es-avatar" aria-hidden="true">{initials(u.name)}</span>
              <span>
                <span className="community-demo-account__name">{u.name}</span>
                <br />
                <span className="community-demo-account__role">
                  {u.role === "admin" ? <><ShieldCheck aria-hidden="true" size={12} /> Admin — can moderate</> : <><UserRound aria-hidden="true" size={12} /> Student</>}
                </span>
              </span>
            </button>
          ))}
          <button type="button" className="community-demo-account" aria-pressed={!user} onClick={() => { signOut(); notify.success("Browsing as a visitor"); }}>
            <span className="es-avatar" aria-hidden="true"><LogOut size={16} /></span>
            <span>
              <span className="community-demo-account__name">Visitor</span>
              <br />
              <span className="community-demo-account__role">Read only, not signed in</span>
            </span>
          </button>
        </div>
        {user ? <p className="es-help" aria-live="polite">Currently signed in as <strong>{user.name}</strong>.</p> : null}
        {user ? <div><Button variant="secondary" size="sm" onClick={() => signOut()}>Log out</Button></div> : null}
      </Card>
    </PlaceholderPage>
  );
}
