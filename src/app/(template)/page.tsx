import { Hero } from "@/components/homepage/Hero";
import { Categories } from "@/components/homepage/Categories";
import { About } from "@/components/homepage/About";
import { Contact } from "@/components/homepage/Contact";

export const metadata = {
  title: "Handiman — On-demand services and parcel delivery",
  description:
    "Book handyman services or send a parcel in a few taps. Verified vendors, live tracking, and one platform for every service you need.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <About />
      <Contact />
    </>
  );
}
