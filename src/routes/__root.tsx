import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SessionProvider } from "@/lib/session";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Toaster } from "@/components/common/Toast";
import { buttonClass } from "@/components/common/Button";

function NotFoundComponent() {
  return (
    <div className="es-container es-page">
      <div className="es-placeholder es-card es-state">
        <p className="es-eyebrow">404</p>
        <h1 className="es-page-header__title">Page not found</h1>
        <p className="es-state__text">The page you're looking for doesn't exist or has been moved.</p>
        <div className="es-state__action">
          <Link to="/" className={buttonClass("primary")}>Go to home</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="es-container es-page">
      <div className="es-placeholder es-card es-state es-state--error" role="alert">
        <h1 className="es-page-header__title">This page didn't load</h1>
        <p className="es-state__text">Something went wrong on our end. You can try again or head back home.</p>
        <div className="es-state__action es-row">
          <button
            type="button"
            className={buttonClass("primary")}
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a href="/" className={buttonClass("secondary")}>Go to home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EduSphere — Learn. Practice. Grow." },
      { name: "description", content: "EduSphere is a simple, accessible e-learning platform with courses, quizzes and a friendly learner community." },
      { name: "author", content: "EduSphere" },
      { property: "og:title", content: "EduSphere — Learn. Practice. Grow." },
      { property: "og:description", content: "Courses, quizzes and a friendly learner community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <SiteLayout>
          {/* Required: nested routes render here. */}
          <Outlet />
        </SiteLayout>
        <Toaster />
      </SessionProvider>
    </QueryClientProvider>
  );
}
