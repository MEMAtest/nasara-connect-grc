import Link from "next/link";
import { Mail, PhoneCall, MapPin, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]}
      />
      <Navigation variant="solid" />

      <section className="px-4 pb-16 pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            Contact
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Talk to the Nasara Connect team</h1>
          <p className="mt-4 text-lg text-slate-300">
            Get answers on FCA compliance workflows, product fit, and implementation timelines.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
              <Link href="/request-demo">
                Request a demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-white bg-slate-800/50 hover:bg-slate-700">
              <Link href="/resources">View resources</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 text-slate-200">
              <Mail className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Email</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              General enquiries and product questions.
            </p>
            <Link href="mailto:hello@nasaraconnect.com" className="mt-4 inline-flex text-sm font-semibold text-emerald-400">
              hello@nasaraconnect.com
            </Link>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 text-slate-200">
              <PhoneCall className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Sales & onboarding</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Schedule an implementation walkthrough and scope requirements.
            </p>
            <Link href="/request-demo" className="mt-4 inline-flex text-sm font-semibold text-emerald-400">
              Book a walkthrough
            </Link>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 text-slate-200">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Security & privacy</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Review security controls, data handling, and audit logging.
            </p>
            <Link href="/security" className="mt-4 inline-flex text-sm font-semibold text-emerald-400">
              Security overview
            </Link>
          </Card>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 text-slate-200">
              <MapPin className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Location</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              UK-based team supporting FCA-regulated firms across financial services.
            </p>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center gap-3 text-slate-200">
              <Clock className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Response times</h2>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              We respond to commercial enquiries within 1 business day.
            </p>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
