import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

/** Shared shell (Site.Master equivalent): skip link, navbar, main region, footer. */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="es-app">
      <a href="#main-content" className="es-skip-link">Skip to content</a>
      <Navbar />
      <main id="main-content" className="es-main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
