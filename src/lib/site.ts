// Site-wide constants and schema.org (JSON-LD) builders.
// osmos is presented as its own brand; the structured data doesn't name the trading company.

export const SITE = "https://meetosmos.com";
export const APP_STORE = "https://apps.apple.com/us/app/osmos-assistant/id6771561683";
export const APP_NAME = "osmos assistant";
export const TAGLINE = "the AI super-app for iPhone";
export const CONTACT = "hello@meetosmos.com";

export const DESCRIPTION =
  "osmos assistant is an AI super-app for iPhone. One chat handles your email, calendar, messages and travel across 60+ connected apps. It drafts, books and follows up for you, and nothing is sent, booked or paid without your OK.";

const ORG_ID = `${SITE}/#organization`;
const APP_ID = `${SITE}/#app`;
const WEBSITE_ID = `${SITE}/#website`;

export const url = (path = "/") => (path === "/" ? `${SITE}/` : `${SITE}${path}`);

export const organization = () => ({
  "@type": "Organization",
  "@id": ORG_ID,
  name: "osmos",
  url: `${SITE}/`,
  logo: `${SITE}/brand/osmos-mark-180.png`,
  email: CONTACT,
  sameAs: [APP_STORE],
});

export const website = () => ({
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE}/`,
  name: APP_NAME,
  alternateName: "osmos",
  description: DESCRIPTION,
  inLanguage: "en-GB",
  publisher: { "@id": ORG_ID },
});

export const mobileApp = () => ({
  "@type": "MobileApplication",
  "@id": APP_ID,
  name: APP_NAME,
  alternateName: "osmos",
  description: DESCRIPTION,
  operatingSystem: "iOS",
  applicationCategory: "ProductivityApplication",
  url: `${SITE}/`,
  installUrl: APP_STORE,
  image: `${SITE}/brand/osmos-mark-180.png`,
  screenshot: [`${SITE}/img/screen-results-880.webp`, `${SITE}/img/screen-apps-880.webp`, `${SITE}/img/screen-travel-880.webp`],
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free to download, with a one-time trial of 200 credits. Paid plans are in-app purchases." },
  publisher: { "@id": ORG_ID },
});

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: url(it.path) })),
});

export const faqPage = (qas: { q: string; a: string }[], path: string) => ({
  "@type": "FAQPage",
  "@id": `${url(path)}#faq`,
  mainEntity: qas.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") },
  })),
});

export const webPage = (path: string, name: string, description: string, type = "WebPage") => ({
  "@type": type,
  "@id": url(path),
  url: url(path),
  name,
  description,
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": APP_ID },
  inLanguage: "en-GB",
});

export const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });
