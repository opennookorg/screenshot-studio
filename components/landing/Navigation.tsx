"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  Clock01Icon,
  CommandLineIcon,
  CropIcon,
  Edit02Icon,
  EraserIcon,
  Layers01Icon,
  Menu01Icon,
  NewTwitterIcon,
  PaintBoardIcon,
  SourceCodeIcon,
  Video01Icon,
} from "hugeicons-react";
import { GitHubStarButton } from "@/components/ui/github-star-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavigationProps {
  brandName?: string;
}

const resourceGroups = [
  {
    title: "Create",
    links: [
      {
        label: "Screenshot Editor",
        description: "Frame, annotate, and export online",
        href: "/free-screenshot-editor",
        icon: Edit02Icon,
      },
      {
        label: "Code Images",
        description: "Polished images of code snippets",
        href: "/code",
        icon: SourceCodeIcon,
      },
      {
        label: "Tweet Images",
        description: "Clean cards from any X post",
        href: "/tweet",
        icon: NewTwitterIcon,
      },
      {
        label: "Remove Background",
        description: "Cut the subject out of any image",
        href: "/remove-background",
        icon: EraserIcon,
      },
      {
        label: "Compress Video",
        description: "Shrink videos to any size in MB",
        href: "/compress-video",
        icon: Video01Icon,
      },
      {
        label: "Image Tools",
        description: "Crop, resize, compress, convert",
        href: "/tools",
        icon: CropIcon,
      },
    ],
  },
  {
    title: "Learn",
    links: [
      {
        label: "Compare",
        description: "Side by side with the alternatives",
        href: "/compare",
        icon: Layers01Icon,
      },
      {
        label: "For Designers",
        description: "Mockups and polish for portfolios",
        href: "/for/designers",
        icon: PaintBoardIcon,
      },
      {
        label: "For Developers",
        description: "Code shots for READMEs and docs",
        href: "/for/developers",
        icon: CommandLineIcon,
      },
      {
        label: "Changelog",
        description: "What shipped recently",
        href: "/changelog",
        icon: Clock01Icon,
      },
    ],
  },
] as const;

const featuredGuide = {
  eyebrow: "Featured guide",
  title: "Make any screenshot look professional",
  href: "/guides/how-to-beautify-screenshots",
  description: "Backgrounds, shadows, and frames in under a minute.",
  cover: "/guide-covers/how-to-beautify-screenshots.webp",
};

const SCROLL_COMPACT_AT = 10;
const SCROLL_TOP_SHOW = 100;
const RESOURCES_OPEN_DELAY = 150;
const RESOURCES_CLOSE_DELAY = 200;
const MENU_EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function Navigation({
  brandName = "Screenshot Studio",
}: NavigationProps) {
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const paddingX = useTransform(scrollY, [0, 50], [0, 16]);
  const paddingY = useTransform(scrollY, [0, 50], [8, 16]);

  useEffect(() => {
    document.body.classList.add("nav-overscroll");
    return () => {
      document.body.classList.remove("nav-overscroll");
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const clearOpenTimeout = (): void => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  };

  const clearCloseTimeout = (): void => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const openResourcesNow = (): void => {
    clearOpenTimeout();
    clearCloseTimeout();
    setResourcesOpen(true);
  };

  const scheduleOpenResources = (): void => {
    clearCloseTimeout();
    if (resourcesOpen || openTimeoutRef.current) return;
    openTimeoutRef.current = setTimeout(() => {
      setResourcesOpen(true);
      openTimeoutRef.current = null;
    }, RESOURCES_OPEN_DELAY);
  };

  const closeResources = (): void => {
    clearOpenTimeout();
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setResourcesOpen(false);
      closeTimeoutRef.current = null;
    }, RESOURCES_CLOSE_DELAY);
  };

  const toggleResources = (): void => {
    if (resourcesOpen) {
      clearOpenTimeout();
      clearCloseTimeout();
      setResourcesOpen(false);
    } else {
      openResourcesNow();
    }
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (typeof latest !== "number") return;

    setScrolled(latest > SCROLL_COMPACT_AT);

    const previous = scrollY.getPrevious();
    if (typeof previous !== "number") return;

    if (latest < SCROLL_TOP_SHOW) {
      setVisible(true);
      return;
    }

    const direction = latest - previous;
    if (direction < 0) {
      setVisible(true);
    } else if (direction > 0) {
      setVisible(false);
      clearOpenTimeout();
      clearCloseTimeout();
      setResourcesOpen(false);
    }
  });

  return (
    <motion.nav
      className={cn(
        "sticky top-0 z-50 mx-auto h-[72px] w-full max-w-6xl",
        !visible && "pointer-events-none",
      )}
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: visible ? 0 : -100,
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.2 }}
      style={{
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        paddingBottom: paddingY,
      }}
    >
      <motion.div
        className={cn(
          "relative grid w-full grid-cols-[1fr_auto_1fr] items-center px-4 md:px-6 transition-colors duration-300",
          scrolled ? "h-16" : "h-14",
          scrolled
            ? "bg-card/80 shadow-sm"
            : "bg-transparent shadow-none",
        )}
        animate={{
          borderRadius: scrolled ? 24 : 0,
          backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
        }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/landing"
          className="col-start-1 flex min-w-0 items-center gap-2.5 justify-self-start"
        >
          <Image
            src="/logo-mark.png"
            alt={brandName}
            width={32}
            height={32}
            className="h-8 w-8 shrink-0"
            priority
          />
          <span className="truncate font-semibold text-foreground text-base tracking-tight whitespace-nowrap">
            {brandName}
          </span>
        </Link>

        <div className="col-start-2 hidden md:flex items-center justify-center gap-8">
          <Link
            href="/features"
            className="text-[15px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Product
          </Link>

          <div
            className="relative"
            onMouseEnter={scheduleOpenResources}
            onMouseLeave={closeResources}
          >
            <button
              type="button"
              aria-expanded={resourcesOpen}
              aria-haspopup="true"
              onClick={toggleResources}
              className={cn(
                "group inline-flex items-center rounded-sm text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                resourcesOpen
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Resources
              <ArrowDown01Icon
                aria-hidden="true"
                className={cn(
                  "relative top-px ml-1 size-3 transition duration-200 motion-reduce:transition-none",
                  resourcesOpen && "rotate-180",
                )}
              />
            </button>

            <AnimatePresence>
              {resourcesOpen ? (
                <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                  <motion.div
                    key="resources-menu"
                    role="menu"
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.95 }
                    }
                    animate={
                      prefersReducedMotion
                        ? { opacity: 1 }
                        : { opacity: 1, scale: 1 }
                    }
                    exit={
                      prefersReducedMotion
                        ? {
                            opacity: 0,
                            transition: {
                              duration: 0.12,
                              ease: MENU_EASE_OUT,
                            },
                          }
                        : {
                            opacity: 0,
                            scale: 0.95,
                            transition: {
                              duration: 0.15,
                              ease: MENU_EASE_OUT,
                            },
                          }
                    }
                    transition={{ duration: 0.2, ease: MENU_EASE_OUT }}
                    style={{ transformOrigin: "top center" }}
                    className="flex overflow-hidden rounded-2xl bg-popover p-2 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] ring-1 ring-border/70"
                  >
                    <div className="grid w-[37rem] grid-cols-2 gap-x-1">
                      {resourceGroups.map((group) => (
                        <div key={group.title} className="flex flex-col p-1">
                          <p className="px-2.5 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
                            {group.title}
                          </p>
                          {group.links.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              role="menuitem"
                              onClick={() => setResourcesOpen(false)}
                              className="group/item flex items-start gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-foreground/[0.05] focus-visible:bg-foreground/[0.05] focus-visible:outline-none"
                            >
                              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.04] text-muted-foreground ring-1 ring-inset ring-border transition-colors group-hover/item:text-foreground">
                                <link.icon className="size-4" aria-hidden="true" />
                              </span>
                              <span className="flex min-w-0 flex-col">
                                <span className="text-sm font-medium text-foreground">
                                  {link.label}
                                </span>
                                <span className="text-[13px] leading-snug text-muted-foreground">
                                  {link.description}
                                </span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>

                    <Link
                      href={featuredGuide.href}
                      role="menuitem"
                      onClick={() => setResourcesOpen(false)}
                      className="group/feature hidden w-56 shrink-0 flex-col overflow-hidden rounded-xl bg-card ring-1 ring-inset ring-border transition-colors hover:ring-foreground/20 lg:flex"
                    >
                      <span className="relative aspect-[4/3] w-full overflow-hidden">
                        <Image
                          src={featuredGuide.cover}
                          alt=""
                          fill
                          sizes="224px"
                          className="object-cover transition-transform duration-500 ease-out group-hover/feature:scale-[1.04] motion-reduce:transition-none"
                        />
                      </span>
                      <span className="flex flex-1 flex-col gap-1.5 p-3.5">
                        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70">
                          {featuredGuide.eyebrow}
                        </span>
                        <span className="text-sm font-medium leading-snug text-foreground">
                          {featuredGuide.title}
                        </span>
                        <span className="text-[13px] leading-snug text-muted-foreground">
                          {featuredGuide.description}
                        </span>
                        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[13px] text-muted-foreground transition-colors group-hover/feature:text-foreground">
                          Read the guide
                          <ArrowRight01Icon className="size-3.5" aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                </div>
              ) : null}
            </AnimatePresence>
          </div>

          <Link
            href="/guides"
            className="text-[15px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Blog
          </Link>

          <Link
            href="/contact"
            className="text-[15px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </Link>
        </div>

        <div className="col-start-3 flex items-center gap-2 justify-self-end shrink-0">
          <div className="hidden md:block">
            <GitHubStarButton />
          </div>
          <button
            type="button"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu01Icon className="size-5" />
          </button>
        </div>
      </motion.div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-[320px] gap-0 bg-background p-0"
        >
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="text-base font-semibold text-foreground">
              Menu
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-3" aria-label="Mobile">
            <Link
              href="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md px-3 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              Product
            </Link>
            {resourceGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-0.5">
                <div className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                  {group.title}
                </div>
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
                  >
                    <link.icon className="size-4 shrink-0" aria-hidden="true" />
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="my-2 h-px bg-foreground/10" />
            <Link
              href="/guides"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md px-3 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md px-3 py-2.5 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
            >
              Contact
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </motion.nav>
  );
}
