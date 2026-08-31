import { Barlow, Barlow_Condensed } from "next/font/google";
import "../style/globals.css";
import { ThemeProvider } from "@/hooks/useTheme";
import { LangProvider } from "@/hooks/useLang";
import { QueryProvider } from "@/providers/QueryProvider";

// Barlow carries the whole design; Barlow Condensed is reserved for the
// uppercase, letter-spaced labels and CTAs (`font-display`).
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata = {
  title: "Handiman — Trusted help for every job around your home",
  description:
    "Book vetted local professionals for repairs, installation, cleaning and maintenance.",
};

// Runs before paint → no light/dark flash on first load. Must stay in sync with
// THEME_STORAGE_KEY in @/hooks/useTheme.
const themeScript = `(function(){try{var t=localStorage.getItem('handiman_theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Provider order matters: Theme → Lang → Query. */}
        <ThemeProvider>
          <LangProvider>
            <QueryProvider>{children}</QueryProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
