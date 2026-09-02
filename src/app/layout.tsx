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

/*
 * Runs before paint. Three jobs:
 *
 *   data-theme    no light/dark flash on first load. Must stay in sync with
 *                 THEME_STORAGE_KEY in @/hooks/useTheme.
 *
 *   .anim-ready   arms the GSAP reveal layer. The class is what makes the
 *                 "hidden until its ScrollTrigger fires" rules at the foot of
 *                 globals.css apply, and it is set from script - never as a
 *                 plain stylesheet rule - because hiding has to happen before
 *                 the first pixel is drawn (a useEffect is a frame too late and
 *                 the content visibly jumps), and because with JS disabled
 *                 nothing would ever fade those sections back in, so the
 *                 absence of the class is what keeps the page readable.
 *                 Set OUTSIDE the try/catch: localStorage throws in
 *                 private-mode Safari, and the reveals must still arm.
 *
 *   the timer     the failsafe for the case the class cannot cover on its own:
 *                 JS is enabled, this inline script runs, and then a bundle
 *                 chunk never arrives (bad deploy, CDN hiccup, offline tab).
 *                 React never mounts, no ScrollTrigger is ever built, and every
 *                 tagged section stays at opacity 0 for good. The first
 *                 useGsapScope to mount stamps `data-anim-live`; if that has not
 *                 happened within six seconds, give up on the reveals and show
 *                 the page. Reveals already built are unaffected - GSAP writes
 *                 its own inline opacity and does not depend on this class.
 */
const bootScript =
  "(function(){var d=document.documentElement;d.classList.add('anim-ready');" +
  "setTimeout(function(){if(!d.hasAttribute('data-anim-live'))d.classList.remove('anim-ready');},6000);" +
  "try{d.setAttribute('data-theme',localStorage.getItem('handiman_theme')||'light');}catch(e){}})();";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
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
