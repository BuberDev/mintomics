import {
  Dribbble,
  Facebook,
  Github,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import BrandLogo from "@/components/ui/brand-logo";

const data = {
  facebookLink: "https://facebook.com/Mintomicsai",
  instaLink: "https://instagram.com/Mintomicsai",
  twitterLink: "https://twitter.com/Mintomicsai",
  githubLink: "https://github.com/Mintomics-ai",
  dribbbleLink: "https://dribbble.com/Mintomicsai",
  services: {
    simulator: "/generate",
    reports: "/generate",
    advisory: "/generate",
    investor: "/generate",
  },
  about: {
    product: "/#features",
    workflow: "/#process",
    pricing: "/pricing",
    roadmap: "/#readiness",
  },
  help: {
    faqs: "/pricing",
    support: "mailto:hello@Mintomics.ai",
    livechat: "/generate",
  },
  contact: {
    email: "hello@Mintomics.ai",
    phone: "+48 600 000 000",
    address: "Warsaw, Poland",
  },
  company: {
    name: "Mintomics",
    description:
      "Tokenomics infrastructure for serious Web3 teams. Generate allocation models, stress-test vesting, and walk into investor meetings with sharper answers.",
  },
};

const socialLinks = [
  { icon: Facebook, label: "Facebook", href: data.facebookLink },
  { icon: Instagram, label: "Instagram", href: data.instaLink },
  { icon: Twitter, label: "Twitter", href: data.twitterLink },
  { icon: Github, label: "GitHub", href: data.githubLink },
  { icon: Dribbble, label: "Dribbble", href: data.dribbbleLink },
];

const aboutLinks = [
  { text: "Product Overview", href: data.about.product },
  { text: "How It Works", href: data.about.workflow },
  { text: "Pricing", href: data.about.pricing },
  { text: "Launch Readiness", href: data.about.roadmap },
];

const serviceLinks = [
  { text: "Tokenomics Simulator", href: data.services.simulator },
  { text: "Investor PDF Reports", href: data.services.reports },
  { text: "Scenario Iterations", href: data.services.advisory },
  { text: "Red Flag Analysis", href: data.services.investor },
];

const helpfulLinks = [
  { text: "FAQs", href: data.help.faqs },
  { text: "Founder Support", href: data.help.support },
  { text: "Live Product Walkthrough", href: data.help.livechat, hasIndicator: true },
];

const contactInfo = [
  { icon: Mail, text: data.contact.email, href: `mailto:${data.contact.email}` },
  { icon: Phone, text: data.contact.phone, href: `tel:${data.contact.phone.replace(/\s+/g, "")}` },
  { icon: MapPin, text: data.contact.address, href: "#", isAddress: true },
];

export default function Footer4Col() {
  return (
    <footer className="mt-10 w-full rounded-t-[2rem] border-t border-white/10 bg-[linear-gradient(180deg,rgba(10,12,26,0.96),rgba(7,10,20,1))] shadow-[0_-20px_60px_rgba(0,0,0,0.42)]">
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-6 lg:px-8 lg:pt-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1.9fr]">
          <div>
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <BrandLogo
                variant="wordmark"
                alt={data.company.name}
                width={220}
                height={56}
                className="h-10 w-auto"
              />
            </div>

            <p className="mt-6 max-w-md text-center text-sm leading-7 text-gray-400 sm:text-left">
              {data.company.description}
            </p>

            <ul className="mt-8 flex justify-center gap-4 sm:justify-start">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="glass-effect flex h-11 w-11 items-center justify-center rounded-full text-gray-300 transition hover:border-white/30 hover:text-white"
                  >
                    <span className="sr-only">{label}</span>
                    <Icon className="size-5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                About
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {aboutLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link className="text-gray-400 transition hover:text-white" href={href}>
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                Product
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {serviceLinks.map(({ text, href }) => (
                  <li key={text}>
                    <Link className="text-gray-400 transition hover:text-white" href={href}>
                      {text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                Help
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {helpfulLinks.map(({ text, href, hasIndicator }) => (
                  <li key={text}>
                    <Link
                      href={href}
                      className="group inline-flex items-center justify-center gap-2 text-gray-400 transition hover:text-white sm:justify-start"
                    >
                      <span>{text}</span>
                      {hasIndicator && (
                        <span className="relative flex size-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 opacity-75" />
                          <span className="relative inline-flex size-2.5 rounded-full bg-white/90" />
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                Contact
              </p>
              <ul className="mt-6 space-y-4 text-sm">
                {contactInfo.map(({ icon: Icon, text, href, isAddress }) => (
                  <li key={text}>
                    {isAddress ? (
                      <div className="flex items-center justify-center gap-2 text-gray-400 sm:justify-start">
                        <Icon className="size-4 shrink-0 text-white/75" />
                        <address className="not-italic">{text}</address>
                      </div>
                    ) : (
                      <Link
                        className="flex items-center justify-center gap-2 text-gray-400 transition hover:text-white sm:justify-start"
                        href={href}
                      >
                        <Icon className="size-4 shrink-0 text-white/75" />
                        <span>{text}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5">
          <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-sm text-gray-500">
              Not financial advice. Final token design should be reviewed by legal and token engineering specialists.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 sm:justify-end">
              <Link href="/terms" className="transition hover:text-white">
                Terms
              </Link>
              <Link href="/privacy" className="transition hover:text-white">
                Privacy
              </Link>
              <Link href="/disclaimer" className="transition hover:text-white">
                Disclaimer
              </Link>
              <span>&copy; 2026 {data.company.name}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
