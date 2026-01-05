import { SITE_URL } from "@/lib/seo/marketing-data";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Nasara Connect",
      url: SITE_URL,
      logo: `${SITE_URL}/nasara-logo.png`,
    },
    {
      "@type": "WebSite",
      name: "Nasara Connect",
      url: SITE_URL,
    },
  ],
};

export function SiteStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
