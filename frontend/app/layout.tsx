import { ToastProvider } from "@/context/ToastContext";
import { UserProvider } from "@/context/UserContext";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        {/* aplica tema do cache ANTES do React (evita flicker) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    const raw = localStorage.getItem("userPreferences");
    if (!raw) return;
    const prefs = JSON.parse(raw);
    const mode = prefs && prefs.colorMode ? prefs.colorMode : "system";
    const root = document.documentElement;

    if (!mode || mode === "system") {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.dataset.theme = prefersDark ? "dark" : "light";
    } else {
      root.dataset.theme = mode;
    }
  } catch (e) {}
})();
`,
          }}
        />
      </head>
      <body>
        <ToastProvider>
          <UserProvider>{children}</UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
