import Link from "next/link";
import Image from "next/image";
import { NewTwitterIcon } from "hugeicons-react";
import { GitHubIcon } from "@/components/ui/github-star-button";
import { AdSenseScript } from "@/components/AdSenseScript";
import { TOOLS } from "@/lib/seo/tools";
import { guides } from "@/lib/seo/guides";

interface FooterProps {
  brandName?: string;
}

const GITHUB_URL = "https://github.com/opennookorg/screenshot-studio";
const X_URL = "https://x.com/screenshotstdio";
const PEERLIST_URL =
  "https://peerlist.io/code_kartik/project/screenshot-studio";
const PEERLIST_BADGE =
  "https://dqy38fnwh4fqs.cloudfront.net/website/project-spotlight/project-week-rank-one-dark.svg";

const navCol1 = [
  { href: "/editor", label: "Screenshot Editor" },
  { href: "/free-screenshot-editor", label: "Free editor" },
  { href: "/store-screenshots", label: "App store screenshots" },
  { href: "/code", label: "Code to image" },
  { href: "/tweet", label: "Tweet to image" },
  { href: "/mockup-generator", label: "Mockup generator" },
  { href: "/remove-background", label: "Remove background" },
  { href: "/compress-video", label: "Compress video" },
] as const;

const navCol2 = [
  { href: "/features", label: "Features" },
  { href: "/tools", label: "Image tools" },
  { href: "/compare", label: "Comparisons" },
  { href: "/for", label: "Who it is for" },
  { href: "/changelog", label: "Changelog" },
] as const;

const navCol3 = [
  { href: "/guides", label: "Guides" },
  { href: "/docs", label: "API docs" },
  { href: "/developers", label: "Developers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

const directoryRows = [
  {
    label: "Image tools",
    links: TOOLS.map((tool) => ({ href: tool.slug, label: tool.name })),
  },
  {
    label: "Guides",
    links: guides.map((guide) => ({
      href: `/guides/${guide.slug}`,
      label: guide.title,
    })),
  },
];

function FooterNavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}): React.JSX.Element {
  return (
    <Link
      href={href}
      className="flex w-full flex-1 items-center rounded-md bg-foreground/[0.04] px-4 py-3 text-sm text-foreground/90 ring-1 ring-border transition-colors duration-150 hover:bg-foreground/[0.08] hover:text-foreground"
    >
      {label}
    </Link>
  );
}

export function Footer({ brandName = "Screenshot Studio" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background px-6 pb-8 pt-4 sm:pb-10">
      <AdSenseScript />
      <div className="mx-auto max-w-6xl rounded-2xl bg-card px-6 py-12 ring-1 ring-border shadow-[var(--card-edge-shadow)] sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 items-stretch gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div className="flex h-full flex-col gap-6">
            <Link
              href="/landing"
              className="inline-flex w-fit items-center gap-2.5"
            >
              <Image
                src="/logo-mark.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-base font-semibold tracking-tight text-foreground">
                {brandName}
              </span>
            </Link>
            <p
              className="max-w-xs text-[22px] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground sm:text-[26px] sm:leading-[1.15]"
              style={{
                fontFamily:
                  'Inter, "Inter Fallback", Arial, Helvetica, sans-serif',
              }}
            >
              Free and open source.
              <br />
              Screenshot mockups
              <br />
              you can ship.
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-3">
              <a
                href={PEERLIST_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit opacity-90 transition-opacity duration-150 hover:opacity-100"
              >
                <img
                  src={PEERLIST_BADGE}
                  alt="Peerlist Project Spotlight. Rank 1"
                  loading="lazy"
                  className="h-10 w-auto"
                />
              </a>
              <a
                href="https://usefulshelf.co/apps/screenshot-studio?utm_source=screenshot-studio&utm_medium=referral&utm_campaign=badge&utm_content=lime"
                target="_blank"
                rel="noopener"
              >
                <img
                  src="https://usefulshelf.co/badge/screenshot-studio.svg?theme=lime"
                  alt="Featured on UsefulShelf"
                  width={248}
                  height={66}
                  loading="lazy"
                  className="h-10 w-auto"
                />
              </a>
            </div>
          </div>

          <div className="grid h-full w-full grid-cols-2 gap-2 sm:grid-cols-3 md:max-w-xl md:justify-self-end">
            <div className="flex h-full flex-col gap-2">
              {navCol1.map((item) => (
                <FooterNavLink key={item.href} {...item} />
              ))}
            </div>
            <div className="flex h-full flex-col gap-2">
              {navCol2.map((item) => (
                <FooterNavLink key={item.href} {...item} />
              ))}
            </div>
            <div className="flex h-full flex-col gap-2">
              {navCol3.map((item) => (
                <FooterNavLink key={item.href} {...item} />
              ))}
            </div>
          </div>
        </div>

        <nav
          aria-label="Site directory"
          className="mt-10 flex flex-col gap-3 border-t border-border pt-6"
        >
          {directoryRows.map((row) => (
            <p key={row.label} className="text-xs leading-6 text-muted-foreground">
              <span className="mr-2 font-medium text-foreground/80">
                {row.label}
              </span>
              {row.links.map((link, index) => (
                <span key={link.href}>
                  {index > 0 && <span aria-hidden="true"> · </span>}
                  <Link
                    href={link.href}
                    className="transition-colors duration-150 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </p>
          ))}
        </nav>

        <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex size-10 items-center justify-center rounded-md bg-foreground/[0.04] text-foreground/90 ring-1 ring-border transition-colors duration-150 hover:bg-foreground/[0.08] hover:text-foreground"
            >
              <GitHubIcon className="size-[18px]" />
            </a>
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="inline-flex size-10 items-center justify-center rounded-md bg-foreground/[0.04] text-foreground/90 ring-1 ring-border transition-colors duration-150 hover:bg-foreground/[0.08] hover:text-foreground"
            >
              <NewTwitterIcon className="size-4" />
            </a>
            <Link
              href="/privacy-policy"
              className="inline-flex h-10 items-center rounded-md bg-foreground/[0.04] px-3 text-sm text-foreground/90 ring-1 ring-border transition-colors duration-150 hover:bg-foreground/[0.08] hover:text-foreground"
            >
              Privacy policy
            </Link>
            <Link
              href="/terms"
              className="inline-flex h-10 items-center rounded-md bg-foreground/[0.04] px-3 text-sm text-foreground/90 ring-1 ring-border transition-colors duration-150 hover:bg-foreground/[0.08] hover:text-foreground"
            >
              Terms of service
            </Link>
          </div>

          <p className="text-xs text-muted-foreground/70">
            © {currentYear} {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
