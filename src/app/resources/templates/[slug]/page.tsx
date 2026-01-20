import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { RESOURCE_TEMPLATES } from "@/lib/seo/marketing-data";
import { TemplatePageClient } from "./TemplatePageClient";
import { TEMPLATE_PACKS, type TemplatePackContent } from "@/data/template-packs";

type PageProps = { params: Promise<{ slug: string }> };

function getTemplateContent(slug: string): TemplatePackContent | null {
  return TEMPLATE_PACKS[slug] || null;
}

export function generateStaticParams() {
  return RESOURCE_TEMPLATES.map((template) => ({ slug: template.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = RESOURCE_TEMPLATES.find((item) => item.slug === slug);
  if (!template) {
    return {
      title: "Template",
      description: "Nasara Connect compliance template.",
    };
  }

  return {
    title: template.seoTitle,
    description: template.seoDescription,
    alternates: { canonical: `/resources/templates/${template.slug}` },
    openGraph: {
      title: template.seoTitle,
      description: template.seoDescription,
      url: `/resources/templates/${template.slug}`,
    },
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const template = RESOURCE_TEMPLATES.find((item) => item.slug === slug);
  if (!template) {
    notFound();
  }

  const content = getTemplateContent(template.slug);
  if (!content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Resources", path: "/resources" },
          { name: "Templates", path: "/resources/templates" },
          { name: template.title, path: `/resources/templates/${template.slug}` },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-12 pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Template Pack
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">{template.title}</h1>
          <p className="mt-4 text-lg text-slate-300">{template.seoDescription}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">Request a walkthrough</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
              <Link href="/resources/templates">Back to templates</Link>
            </Button>
          </div>
        </div>
      </section>

      <TemplatePageClient
        items={content.items}
        useCases={content.useCases}
        overview={content.overview}
        packTitle={template.title}
        keyBenefits={content.keyBenefits}
        implementationSequence={content.implementationSequence}
        relatedLinks={content.relatedLinks}
      />

      <Footer />
    </div>
  );
}
