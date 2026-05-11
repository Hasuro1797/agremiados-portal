"use client";
import Logo from "@/components/Logo";
// import { routes } from "@/lib/routes";
import { useOrganization } from "@/providers/organization-provider";
import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";

function parseSocialMedia(raw: unknown): Record<string, string> {
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>).filter(
      ([, v]) => typeof v === "string" && (v as string).length > 0,
    ),
  ) as Record<string, string>;
}

function parseFooterLinks(raw: unknown): { label: string; href: string }[] {
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter(
      (item): item is Record<string, unknown> =>
        item !== null &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).label === "string" &&
        (typeof (item as Record<string, unknown>).href === "string" ||
          typeof (item as Record<string, unknown>).url === "string"),
    )
    .map((item) => ({
      label: item.label as string,
      href: (item.href ?? item.url) as string,
    }));
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
};

function SocialLink({ network, url }: { network: string; url: string }) {
  const Icon = SOCIAL_ICONS[network.toLowerCase()] ?? Globe;
  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={network}
      className="size-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all duration-200"
    >
      <Icon className="size-4" />
    </Link>
  );
}

// const DEFAULT_POLICY_LINKS = [
//   { label: "Transparencia", href: "#" },
//   { label: "Privacidad", href: routes.public.privacyPolicy },
//   { label: "Términos", href: routes.public.termsAndConditions },
// ];

// ── Footer ────────────────────────────────────────────────────────────────────

export default function Footer() {
  const { organization } = useOrganization();
  const social = parseSocialMedia(organization?.socialMedia);
  const footerLinks = parseFooterLinks(organization?.footerLinks);
  // const policyLinks =
  //   footerLinks.length > 0 ? footerLinks : DEFAULT_POLICY_LINKS;

  const hasSocial = Object.keys(social).length > 0 || !!organization?.website;
  const hasContact =
    organization?.address || organization?.phone || organization?.email;

  return (
    <footer className="bg-primary text-white">
      {/* Main content */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Column 1 — Brand + description + social */}
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <Logo width={36} height={36} className="brightness-0 invert" />
            <p className="text-sm font-bold leading-tight uppercase tracking-wide">
              {organization?.name ?? "Portal del Agremiado"}
            </p>
          </div>

          {organization?.description ? (
            <p className="text-white/55 text-xs leading-relaxed mt-2 max-w-xs">
              {organization.description}
            </p>
          ) : null}

          {hasSocial && (
            <div className="flex flex-wrap gap-2 mt-5">
              {Object.entries(social).map(([network, url]) => (
                <SocialLink key={network} network={network} url={url} />
              ))}
              {organization?.website && !social.website && (
                <SocialLink network="website" url={organization.website} />
              )}
            </div>
          )}
        </div>

        {/* Column 2 — Contact */}
        {hasContact && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">
              Contacto
            </p>
            <ul className="space-y-3">
              {organization?.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="size-4 text-white/40 mt-0.5 shrink-0" />
                  <span className="text-sm text-white/65 leading-snug">
                    {organization.address}
                  </span>
                </li>
              )}
              {organization?.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="size-4 text-white/40 shrink-0" />
                  <Link
                    href={`tel:${organization.phone}`}
                    className="text-sm text-white/65 hover:text-white transition-colors"
                  >
                    {organization.phone}
                  </Link>
                </li>
              )}
              {organization?.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="size-4 text-white/40 shrink-0" />
                  <Link
                    href={`mailto:${organization.email}`}
                    className="text-sm text-white/65 hover:text-white transition-colors"
                  >
                    {organization.email}
                  </Link>
                </li>
              )}
              {organization?.website && (
                <li className="flex items-center gap-2.5">
                  <Globe className="size-4 text-white/40 shrink-0" />
                  <Link
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/65 hover:text-white transition-colors"
                  >
                    {organization.website.replace(/^https?:\/\//, "")}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Column 3 — Footer links from org */}
        {footerLinks.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">
              Enlaces
            </p>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/65 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            {organization?.footerText ? (
              organization.footerText
            ) : (
              <>
                Portal del Agremiado {new Date().getFullYear()}. Todos los
                derechos reservados.
              </>
            )}
          </p>
          {/* <nav className="flex flex-wrap gap-x-5 gap-y-1 justify-center">
            {policyLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs text-white/40 hover:text-white/80 transition-colors uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav> */}
        </div>
      </div>
    </footer>
  );
}
