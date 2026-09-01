import { Hero } from "@/components/homepage/Hero";
import { Categories } from "@/components/homepage/Categories";
import { Listings } from "@/components/homepage/Listings";
import { CategoryListings } from "@/components/homepage/CategoryListings";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { Impact } from "@/components/homepage/Impact";
import { About } from "@/components/homepage/About";
import { Team } from "@/components/homepage/Team";
import { Blog } from "@/components/homepage/Blog";
import { Faq } from "@/components/homepage/Faq";
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
      <Listings />
      <CategoryListings />
      <About />
      <HowItWorks />
      <Impact />
      <Team />
      <Blog />
      <Faq />
      <Contact />
    </>
  );
}
