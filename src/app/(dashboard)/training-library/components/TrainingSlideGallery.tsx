"use client";

type Slide = {
  src: string;
  alt: string;
  caption?: string;
};

const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" role="img" aria-label="Training image unavailable">
  <rect width="800" height="450" fill="#f1f5f9"/>
  <rect x="40" y="40" width="720" height="370" rx="24" fill="#e2e8f0"/>
  <text x="400" y="230" text-anchor="middle" fill="#64748b" font-size="22" font-family="Arial, sans-serif">Image unavailable</text>
</svg>`;

const fallbackImage = `data:image/svg+xml;utf8,${encodeURIComponent(fallbackSvg)}`;

const moduleMeta: Record<string, { title: string; category: string }> = {
  "aml-fundamentals": {
    title: "Anti-Money Laundering Fundamentals",
    category: "financial-crime-prevention",
  },
  "financial-crime-aml": {
    title: "Financial Crime and Anti-Money Laundering",
    category: "financial-crime-prevention",
  },
  "money-laundering-red-flags": {
    title: "Money Laundering Red Flags",
    category: "financial-crime-prevention",
  },
  "sanctions-training": {
    title: "Sanctions and Financial Crime Prevention",
    category: "financial-crime-prevention",
  },
  "peps-training": {
    title: "Politically Exposed Persons Identification",
    category: "financial-crime-prevention",
  },
  "sars-training": {
    title: "Suspicious Activity Reporting",
    category: "financial-crime-prevention",
  },
  "cryptoasset-risk": {
    title: "Cryptoasset Financial Crime Risk",
    category: "financial-crime-prevention",
  },
  "kyc-fundamentals": {
    title: "Know Your Customer and Due Diligence",
    category: "financial-crime-prevention",
  },
  "consumer-duty": {
    title: "Consumer Duty",
    category: "customer-protection",
  },
  "consumer-duty-implementation": {
    title: "Consumer Duty Implementation",
    category: "customer-protection",
  },
  "consumer-credit-training": {
    title: "Consumer Credit and Affordability",
    category: "customer-protection",
  },
  "vulnerable-customers": {
    title: "Vulnerable Customers",
    category: "customer-protection",
  },
  "client-categorisation": {
    title: "Client Categorisation",
    category: "regulatory-compliance",
  },
  "suitability-appropriateness": {
    title: "Suitability and Appropriateness",
    category: "regulatory-compliance",
  },
  "complaints-handling": {
    title: "Complaints Handling",
    category: "regulatory-compliance",
  },
  "financial-promotions": {
    title: "Financial Promotions and Communications",
    category: "regulatory-compliance",
  },
  "mifid-training": {
    title: "MiFID Permissions and Conduct",
    category: "regulatory-compliance",
  },
  "insurance-conduct": {
    title: "Insurance Distribution Conduct",
    category: "regulatory-compliance",
  },
  "payments-regulation": {
    title: "Payment Services and E-Money Regulations",
    category: "regulatory-compliance",
  },
  "smcr-training": {
    title: "Senior Managers and Certification Regime",
    category: "regulatory-compliance",
  },
  "outsourcing-third-party": {
    title: "Outsourcing and Third-Party Risk",
    category: "operational-risk",
  },
  "operational-resilience": {
    title: "Operational Resilience and Incident Management",
    category: "operational-risk",
  },
  "operational-resilience-framework": {
    title: "Operational Resilience Framework",
    category: "operational-risk",
  },
};

const defaultCaptions = [
  "Core concepts and key responsibilities.",
  "Controls, monitoring, and practical steps.",
  "Evidence, governance, and escalation.",
];

const categoryCaptions: Record<string, string[]> = {
  "financial-crime-prevention": [
    "Key typologies and risk signals to watch for.",
    "Controls, screening, and escalation workflows.",
    "Evidence, reporting, and governance expectations.",
  ],
  "regulatory-compliance": [
    "Core regulatory requirements and obligations.",
    "Governance, controls, and monitoring practices.",
    "Documentation, approvals, and oversight.",
  ],
  "customer-protection": [
    "Customer outcomes and duty of care focus.",
    "Communications, support, and fair value evidence.",
    "Ongoing monitoring and remediation actions.",
  ],
  "operational-risk": [
    "Resilience and dependency mapping insights.",
    "Testing, monitoring, and contingency planning.",
    "Governance, remediation, and accountability.",
  ],
};

const buildSlides = (moduleId: string, title: string, category?: string): Slide[] => {
  const captions = (category && categoryCaptions[category]) || defaultCaptions;
  return [0, 1, 2].map((index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      src: `/images/training/modules/${moduleId}-${number}.jpg`,
      alt: `${title} training visual ${index + 1}`,
      caption: captions[index],
    };
  });
};

export function TrainingSlideGallery({
  moduleId,
  category,
  className = "",
}: {
  moduleId: string;
  category?: string;
  className?: string;
}) {
  const meta = moduleMeta[moduleId];
  if (!meta) return null;
  const slides = buildSlides(moduleId, meta.title, meta.category || category);
  if (!slides?.length) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
        Slide Visuals
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {slides.map((slide) => (
          <figure key={slide.src} className="space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamic slide images with fallback handler */}
            <img
              src={slide.src}
              alt={slide.alt}
              className="h-44 w-full rounded-xl border border-slate-200 object-cover shadow-sm"
              loading="lazy"
              onError={(event) => {
                const target = event.currentTarget;
                if (target.dataset.fallback === "1") return;
                target.dataset.fallback = "1";
                target.src = fallbackImage;
              }}
            />
            {slide.caption ? (
              <figcaption className="text-xs text-slate-500">{slide.caption}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </div>
  );
}
