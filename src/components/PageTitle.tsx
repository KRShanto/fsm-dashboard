import { useEffect } from "react";

interface PageTitleProps {
  title: string;
  suffix?: string;
}

/**
 * Component to set the document title
 */
export default function PageTitle({
  title,
  suffix = "Fire & Safety Management",
}: PageTitleProps) {
  useEffect(() => {
    // Set the document title with the suffix
    const fullTitle = suffix ? `${title} | ${suffix}` : title;
    document.title = fullTitle;

    // Reset title when component unmounts
    return () => {
      document.title = suffix || "";
    };
  }, [title, suffix]);

  // This component doesn't render anything
  return null;
}
