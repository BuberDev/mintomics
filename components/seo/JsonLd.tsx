import React from "react";

export default function JsonLd() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Mintomics",
    "operatingSystem": "Web-based",
    "applicationCategory": "BusinessApplication",
    "description": "Professional Tokenomics design and simulation platform for Web3 projects. Design investor-ready allocations, vesting schedules, and emission curves in under a minute.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "124"
    }
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mintomics",
    "url": "https://mintomics.ai",
    "logo": "https://mintomics.ai/logo.png",
    "sameAs": [
      "https://twitter.com/mintomics",
      "https://github.com/mintomics"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://mintomics.ai",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://mintomics.ai/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

