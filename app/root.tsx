import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  // Gentium Plus is SIL's text face: it covers the full IPA range, which is a
  // hard requirement for glossary examples and rule notation, not a stylistic
  // preference. Archivo sets the UI chrome, Noto Sans Mono sets feature
  // matrices and data.
  //
  // Note the previous stylesheet imported Charis SIL and then never used it,
  // while `--font-sans` named "Doulos SIL" — a face Google Fonts does not
  // serve — with no fallback stack, so the base font silently resolved to the
  // browser default.
  //
  // These links do NOT affect the rasterized PNG export or a Word-inserted
  // downloaded SVG — both only see fonts already installed locally on the
  // machine (rasterization via `new Image()` loading a serialized SVG blob
  // runs in an isolated context that can't fetch external @font-face
  // resources), so the hw-tools SVG text uses generic "serif"/"monospace"
  // families rather than naming these fonts directly. See TreeGroup.tsx /
  // RuleDiagram.tsx.
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400..700;1,400..700&family=Gentium+Plus:ital,wght@0,400;0,700;1,400;1,700&family=Noto+Sans+Mono:wght@400..700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
