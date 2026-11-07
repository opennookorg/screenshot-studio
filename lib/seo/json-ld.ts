/**
 * Root-level JSON-LD structured data for the entire site.
 * Added to the root layout so every page inherits Organization and WebSite schema.
 */

import { LAST_UPDATED_ISO, LATEST_VERSION } from "@/lib/seo/changelog";
import {
  BROWSER_MOCKUPS,
  IMAGE_EXPORT_FORMATS,
  IMAGE_FRAMES,
  PRODUCT_FACTS,
  VIDEO_EXPORT_FORMATS,
  WINDOW_FRAMES,
  atLeast,
} from "@/lib/seo/product-facts";

const BASE_URL = "https://www.screenshot-studio.com";

export const PERSON_ID = `${BASE_URL}/#founder`;

export function getFounderSchema() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Kartik Labhshetwar",
    url: `${BASE_URL}/about`,
    sameAs: [
      "https://x.com/code_kartik",
      "https://github.com/KartikLabhshetwar",
    ],
  };
}

export function getOrganizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "Screenshot Studio",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/icon-512.png`,
      width: 512,
      height: 512,
    },
    sameAs: [
      "https://github.com/opennookorg/screenshot-studio",
      "https://x.com/screenshotstdio",
    ],
    founder: { "@id": PERSON_ID },
    member: [
      {
        "@type": "Person",
        name: "Aniket Rawat",
        sameAs: ["https://x.com/aniketrawat00", "https://github.com/AniketR10"],
      },
    ],
    email: "kartik.labhshetwar@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "kartik.labhshetwar@gmail.com",
        url: `${BASE_URL}/contact`,
        availableLanguage: [
          "English",
          "Spanish",
          "French",
          "German",
          "Japanese",
          "Portuguese",
          "Korean",
          "Chinese",
        ],
      },
      {
        "@type": "ContactPoint",
        contactType: "technical support",
        url: "https://github.com/opennookorg/screenshot-studio/issues",
        email: "kartik.labhshetwar@gmail.com",
      },
    ],
    description:
      "Free, open-source screenshot editor with backgrounds, browser mockups, 3D effects, animations, and video export.",
  };
}

export function getWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Screenshot Studio",
    publisher: {
      "@id": `${BASE_URL}/#organization`,
    },
    inLanguage: "en",
  };
}

export function getSoftwareApplicationSchema() {
  return {
    "@type": "SoftwareApplication",
    "@id": `${BASE_URL}/#application`,
    name: "Screenshot Studio",
    url: BASE_URL,
    applicationCategory: "DesignApplication",
    applicationSubCategory: "Screenshot Editor",
    operatingSystem: "Any (Web Browser)",
    softwareHelp: {
      "@type": "CreativeWork",
      name: "Screenshot Studio API Documentation",
      url: `${BASE_URL}/docs`,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    softwareVersion: LATEST_VERSION,
    dateModified: LAST_UPDATED_ISO,
    releaseNotes: `${BASE_URL}/changelog`,
    author: { "@id": PERSON_ID },
    publisher: { "@id": `${BASE_URL}/#organization` },
    license: "https://www.apache.org/licenses/LICENSE-2.0",
    featureList: [
      `${atLeast(PRODUCT_FACTS.backgrounds)} gradient, mesh, and solid backgrounds`,
      `${BROWSER_MOCKUPS.join(" and ")} browser mockups (light and dark)`,
      `${WINDOW_FRAMES.join(", ")} window frames`,
      `${IMAGE_FRAMES.join(", ")} image frames`,
      "3D perspective transforms",
      `${atLeast(PRODUCT_FACTS.animationPresets)} animation presets with keyframe editor`,
      `Video export (${VIDEO_EXPORT_FORMATS.join(", ")})`,
      `Text and image overlays with ${PRODUCT_FACTS.fonts} Google Fonts`,
      `${PRODUCT_FACTS.codeThemes} code-snippet themes`,
      `High-res ${IMAGE_EXPORT_FORMATS.join("/")} export up to ${PRODUCT_FACTS.maxExportScale}x scale`,
      "No signup required",
      "No watermarks",
      `Open source (${PRODUCT_FACTS.license})`,
    ],
  };
}

export function getRootJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getFounderSchema(),
      getOrganizationSchema(),
      getWebSiteSchema(),
      getSoftwareApplicationSchema(),
    ],
  };
}

/** ItemList + CollectionPage graph for a hub page that links out to a set of URLs. */
export function buildCollectionJsonLd(
  path: string,
  name: string,
  description: string,
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${BASE_URL}${path}#page`,
        url: `${BASE_URL}${path}`,
        name,
        description,
        isPartOf: { "@id": `${BASE_URL}/#website` },
      },
      {
        "@type": "ItemList",
        "@id": `${BASE_URL}${path}#items`,
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          url: `${BASE_URL}${item.url}`,
        })),
      },
    ],
  };
}
