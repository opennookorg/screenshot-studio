import Script from "next/script";
import { locales } from "@/i18n/routing";

export const ADSENSE_CLIENT = "ca-pub-8704843786311642";

export const AD_FREE_ROUTES = ["/editor", "/code", "/tweet", "/store-screenshots"];

const AD_FREE_PATH = new RegExp(
  `^(/(${locales.join("|")}))?(${AD_FREE_ROUTES.join("|")})/?$`
);

/** True for editor workspaces, with or without a locale prefix, where ads must never appear. */
export function isAdFreePath(pathname: string): boolean {
  return AD_FREE_PATH.test(pathname);
}

/** AdSense loader for content pages only; editor workspaces and error pages never render it. */
export function AdSenseScript() {
  return (
    <Script
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
    />
  );
}
