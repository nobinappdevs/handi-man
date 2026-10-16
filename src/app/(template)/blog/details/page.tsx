import { Suspense } from "react";
import { BlogDetail } from "@/components/blog/BlogDetail";

export const metadata = {
  title: "Announcement — Handiman",
  description: "News and announcements from Handiman.",
};

export default function Page() {
  return (
    /* `useSearchParams` inside `BlogDetail` needs a Suspense boundary for the
       static export to prerender this route. */
    <Suspense>
      <BlogDetail />
    </Suspense>
  );
}
