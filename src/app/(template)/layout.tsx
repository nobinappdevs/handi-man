import { Navbar } from "@/components/share/Navbar";
import { Footer } from "@/components/share/Footer";
import { BackToTop } from "@/components/share/BackToTop";
import { SiteDrawers } from "@/components/share/SiteDrawers";
import { ShellProvider } from "@/components/context/ShellContext";

const layout = ({ children }) => {
  return (
    <ShellProvider>
      <Navbar />
      {children}
      <Footer />
      <BackToTop />
      <SiteDrawers />
    </ShellProvider>
  );
};

export default layout;
