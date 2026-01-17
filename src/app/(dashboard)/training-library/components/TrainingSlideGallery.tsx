"use client";

type Slide = {
  src: string;
  alt: string;
  caption?: string;
};

const moduleSlides: Record<string, Slide[]> = {
  "aml-fundamentals": [
    {
      src: "/images/training/aml-ctf-01.jpg",
      alt: "Compliance analyst reviewing transaction alerts",
      caption: "Frontline review and escalation keeps money laundering risk in check.",
    },
    {
      src: "/images/training/aml-ctf-02.jpg",
      alt: "Regulatory documentation review",
      caption: "Clear evidence and audit trails support AML compliance.",
    },
    {
      src: "/images/training/aml-ctf-03.jpg",
      alt: "Team monitoring risk dashboards",
      caption: "Risk-based monitoring focuses resources on higher-risk activity.",
    },
  ],
  "financial-promotions": [
    {
      src: "/images/training/financial-promotions-01.jpg",
      alt: "Marketing team reviewing financial promotion materials",
      caption: "Clear disclosures support fair, not misleading communications.",
    },
    {
      src: "/images/training/financial-promotions-02.jpg",
      alt: "Compliance review of digital advertising assets",
      caption: "Risk warnings should be as prominent as benefits.",
    },
    {
      src: "/images/training/financial-promotions-03.jpg",
      alt: "Team alignment on approval workflow for promotions",
      caption: "Approval and audit trails protect the firm and customers.",
    },
  ],
  "consumer-duty": [
    {
      src: "/images/training/consumer-duty-01.jpg",
      alt: "Adviser supporting a customer during a review",
      caption: "Outcomes-led conversations build better customer results.",
    },
    {
      src: "/images/training/consumer-duty-02.jpg",
      alt: "Team workshop on customer journey improvements",
      caption: "Mapping journeys reveals friction and poor value.",
    },
    {
      src: "/images/training/consumer-duty-03.jpg",
      alt: "Team reviewing feedback and metrics",
      caption: "Evidence and MI demonstrate good outcomes.",
    },
  ],
  "vulnerable-customers": [
    {
      src: "/images/training/vulnerable-customers-01.jpg",
      alt: "Support agent listening to a customer",
      caption: "Spotting vulnerability cues is a frontline skill.",
    },
    {
      src: "/images/training/vulnerable-customers-02.jpg",
      alt: "Customer service team collaborating on support plans",
      caption: "Tailored support improves customer resilience.",
    },
    {
      src: "/images/training/vulnerable-customers-03.jpg",
      alt: "Team reviewing accessibility adjustments",
      caption: "Inclusive design protects vulnerable customers.",
    },
  ],
  "consumer-duty-implementation": [
    {
      src: "/images/training/consumer-duty-01.jpg",
      alt: "Adviser supporting a customer during a review",
      caption: "Implementation starts with evidence of real customer outcomes.",
    },
    {
      src: "/images/training/consumer-duty-02.jpg",
      alt: "Team workshop on customer journey improvements",
      caption: "Journey reviews reveal friction and value gaps.",
    },
    {
      src: "/images/training/consumer-duty-03.jpg",
      alt: "Team reviewing feedback and metrics",
      caption: "Outcome-led MI proves ongoing compliance.",
    },
  ],
  "consumer-credit-training": [
    {
      src: "/images/training/vulnerable-customers-01.jpg",
      alt: "Support agent listening to a customer",
      caption: "Affordability checks must protect customers from harm.",
    },
    {
      src: "/images/training/vulnerable-customers-02.jpg",
      alt: "Customer service team collaborating on support plans",
      caption: "Forbearance and tailored support reduce arrears harm.",
    },
    {
      src: "/images/training/vulnerable-customers-03.jpg",
      alt: "Team reviewing accessibility adjustments",
      caption: "Vulnerability awareness improves credit outcomes.",
    },
  ],
  "smcr-training": [
    {
      src: "/images/training/smcr-01.jpg",
      alt: "Senior manager reviewing accountability documents",
      caption: "Clear responsibilities reduce conduct risk.",
    },
    {
      src: "/images/training/smcr-02.jpg",
      alt: "Leadership team reviewing certification updates",
      caption: "Certification evidence supports fit and proper assessments.",
    },
    {
      src: "/images/training/smcr-03.jpg",
      alt: "Board-level review session",
      caption: "Governance oversight strengthens accountability.",
    },
  ],
  "outsourcing-third-party": [
    {
      src: "/images/training/outsourcing-tprm-01.jpg",
      alt: "Vendor management review meeting",
      caption: "Third-party risk reviews keep services resilient.",
    },
    {
      src: "/images/training/outsourcing-tprm-02.jpg",
      alt: "Operations team monitoring outsourced service performance",
      caption: "Service quality metrics protect customers.",
    },
    {
      src: "/images/training/outsourcing-tprm-03.jpg",
      alt: "Analyst reviewing third-party risk documentation",
      caption: "Contract controls and oversight reduce operational risk.",
    },
  ],
  "operational-resilience": [
    {
      src: "/images/training/outsourcing-tprm-01.jpg",
      alt: "Vendor management review meeting",
      caption: "Resilience depends on documented third-party controls.",
    },
    {
      src: "/images/training/outsourcing-tprm-02.jpg",
      alt: "Operations team monitoring outsourced service performance",
      caption: "Monitoring and testing validate resilience plans.",
    },
    {
      src: "/images/training/outsourcing-tprm-03.jpg",
      alt: "Analyst reviewing third-party risk documentation",
      caption: "Evidence and governance drive response readiness.",
    },
  ],
  "operational-resilience-framework": [
    {
      src: "/images/training/data-protection-01.jpg",
      alt: "Data protection and system monitoring",
      caption: "Mapping critical services starts with people, process, and tech.",
    },
    {
      src: "/images/training/data-protection-02.jpg",
      alt: "Security controls review",
      caption: "Impact tolerances guide testing and investment.",
    },
    {
      src: "/images/training/data-protection-03.jpg",
      alt: "Team reviewing controls and incident plans",
      caption: "Scenario testing turns plans into evidence.",
    },
  ],
  "financial-crime-aml": [
    {
      src: "/images/training/aml-ctf-01.jpg",
      alt: "Compliance analyst reviewing transaction alerts",
      caption: "Monitoring alerts and escalation decisions drive detection.",
    },
    {
      src: "/images/training/aml-ctf-02.jpg",
      alt: "Regulatory documentation review",
      caption: "Clear evidence supports compliance obligations.",
    },
    {
      src: "/images/training/aml-ctf-03.jpg",
      alt: "Team monitoring risk dashboards",
      caption: "Risk-based monitoring focuses resources effectively.",
    },
  ],
  "money-laundering-red-flags": [
    {
      src: "/images/training/aml-ctf-01.jpg",
      alt: "Compliance analyst reviewing transaction alerts",
      caption: "Pattern recognition turns alerts into defensible decisions.",
    },
    {
      src: "/images/training/aml-ctf-02.jpg",
      alt: "Regulatory documentation review",
      caption: "Evidence and rationale are essential for escalation.",
    },
    {
      src: "/images/training/aml-ctf-03.jpg",
      alt: "Team monitoring risk dashboards",
      caption: "Risk monitoring highlights unusual behavior quickly.",
    },
  ],
  "sanctions-training": [
    {
      src: "/images/training/abc-01.jpg",
      alt: "Compliance review and escalation meeting",
      caption: "Screening hits require fast, well-documented decisions.",
    },
    {
      src: "/images/training/abc-02.jpg",
      alt: "Risk review of third-party relationships",
      caption: "Ownership and jurisdiction checks are core controls.",
    },
    {
      src: "/images/training/abc-03.jpg",
      alt: "Team aligning on compliance controls",
      caption: "Clear governance keeps sanctions compliance consistent.",
    },
  ],
  "peps-training": [
    {
      src: "/images/training/conduct-risk-01.jpg",
      alt: "Risk review meeting",
      caption: "PEP risk decisions must be consistent and documented.",
    },
    {
      src: "/images/training/conduct-risk-02.jpg",
      alt: "Compliance team reviewing customer files",
      caption: "Source of wealth evidence supports defensible onboarding.",
    },
    {
      src: "/images/training/conduct-risk-03.jpg",
      alt: "Team assessing governance controls",
      caption: "Senior management approval is a core PEP safeguard.",
    },
  ],
  "sars-training": [
    {
      src: "/images/training/whistleblowing-01.jpg",
      alt: "Compliance officer reviewing a report",
      caption: "Clear, factual reporting protects the firm and staff.",
    },
    {
      src: "/images/training/whistleblowing-02.jpg",
      alt: "Team discussing escalation paths",
      caption: "Strong escalation routes prevent delay and risk.",
    },
    {
      src: "/images/training/whistleblowing-03.jpg",
      alt: "Governance meeting reviewing case notes",
      caption: "Evidence-driven SARs stand up to scrutiny.",
    },
  ],
  "cryptoasset-risk": [
    {
      src: "/images/training/data-protection-01.jpg",
      alt: "Data protection and system monitoring",
      caption: "Crypto risk controls must align to documented assessments.",
    },
    {
      src: "/images/training/data-protection-02.jpg",
      alt: "Security controls review",
      caption: "Monitoring tools help trace and flag risky activity.",
    },
    {
      src: "/images/training/data-protection-03.jpg",
      alt: "Team reviewing controls and incident plans",
      caption: "Governance evidence supports FCA expectations.",
    },
  ],
  "kyc-fundamentals": [
    {
      src: "/images/training/data-protection-01.jpg",
      alt: "Data protection and system monitoring",
      caption: "Customer files must be accurate, secure, and complete.",
    },
    {
      src: "/images/training/data-protection-02.jpg",
      alt: "Security controls review",
      caption: "Verification controls reduce onboarding risk.",
    },
    {
      src: "/images/training/data-protection-03.jpg",
      alt: "Team reviewing controls and incident plans",
      caption: "Audit-ready records support defensible decisions.",
    },
  ],
  "client-categorisation": [
    {
      src: "/images/training/conduct-risk-01.jpg",
      alt: "Risk review meeting",
      caption: "Client categorisation shapes the correct protections.",
    },
    {
      src: "/images/training/conduct-risk-02.jpg",
      alt: "Compliance team reviewing customer files",
      caption: "Document evidence for professional client assessments.",
    },
    {
      src: "/images/training/conduct-risk-03.jpg",
      alt: "Team assessing governance controls",
      caption: "Governance prevents mis-categorisation risk.",
    },
  ],
  "suitability-appropriateness": [
    {
      src: "/images/training/conduct-risk-01.jpg",
      alt: "Risk review meeting",
      caption: "Suitability relies on clear fact finds and evidence.",
    },
    {
      src: "/images/training/conduct-risk-02.jpg",
      alt: "Compliance team reviewing customer files",
      caption: "Appropriateness checks protect customers from harm.",
    },
    {
      src: "/images/training/conduct-risk-03.jpg",
      alt: "Team assessing governance controls",
      caption: "Controls and MI ensure consistent advice standards.",
    },
  ],
  "complaints-handling": [
    {
      src: "/images/training/whistleblowing-01.jpg",
      alt: "Compliance officer reviewing a report",
      caption: "Consistent complaint logging reduces conduct risk.",
    },
    {
      src: "/images/training/whistleblowing-02.jpg",
      alt: "Team discussing escalation paths",
      caption: "Timely escalation improves customer outcomes.",
    },
    {
      src: "/images/training/whistleblowing-03.jpg",
      alt: "Governance meeting reviewing case notes",
      caption: "Root cause analysis prevents repeat issues.",
    },
  ],
  "mifid-training": [
    {
      src: "/images/training/conduct-risk-01.jpg",
      alt: "Risk review meeting",
      caption: "Permissions and conduct requirements must be mapped clearly.",
    },
    {
      src: "/images/training/conduct-risk-02.jpg",
      alt: "Compliance team reviewing customer files",
      caption: "Best execution evidence protects client outcomes.",
    },
    {
      src: "/images/training/conduct-risk-03.jpg",
      alt: "Team assessing governance controls",
      caption: "Monitoring and governance keep MiFID controls effective.",
    },
  ],
  "payments-regulation": [
    {
      src: "/images/training/data-protection-01.jpg",
      alt: "Data protection and system monitoring",
      caption: "Safeguarding depends on clear controls and evidence.",
    },
    {
      src: "/images/training/data-protection-02.jpg",
      alt: "Security controls review",
      caption: "Reconciliations verify funds are protected.",
    },
    {
      src: "/images/training/data-protection-03.jpg",
      alt: "Team reviewing controls and incident plans",
      caption: "Reporting and oversight reduce regulatory risk.",
    },
  ],
  "insurance-conduct": [
    {
      src: "/images/training/conduct-risk-01.jpg",
      alt: "Risk review meeting",
      caption: "Distribution oversight protects the target market.",
    },
    {
      src: "/images/training/conduct-risk-02.jpg",
      alt: "Compliance team reviewing customer files",
      caption: "Outcome monitoring is a core PROD requirement.",
    },
    {
      src: "/images/training/conduct-risk-03.jpg",
      alt: "Team assessing governance controls",
      caption: "Governance evidence supports PROD compliance.",
    },
  ],
};

const categorySlides: Record<string, Slide[]> = {
  "financial-crime-prevention": moduleSlides["financial-crime-aml"],
  "customer-protection": moduleSlides["consumer-duty"],
  "regulatory-compliance": moduleSlides["smcr-training"],
  "operational-risk": moduleSlides["outsourcing-third-party"],
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
  const slides = moduleSlides[moduleId] ?? (category ? categorySlides[category] : undefined);
  if (!slides?.length) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
        Slide Visuals
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {slides.map((slide) => (
          <figure key={slide.src} className="space-y-2">
            <img
              src={slide.src}
              alt={slide.alt}
              className="h-44 w-full rounded-xl border border-slate-200 object-cover shadow-sm"
              loading="lazy"
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
