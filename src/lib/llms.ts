// Builds /llms.txt and /llms-full.txt from the same data the pages use, so they stay in step.
import help from "../data/help.json";
import { features } from "../data/features";
import { rivals } from "../data/compare";
import { faqGroups } from "../data/faq";
import { APP_STORE, SITE, CONTACT } from "./site";

const text = (html: string) =>
  html
    .replace(/<h2>(.*?)<\/h2>/g, "\n### $1\n")
    .replace(/<li>/g, "- ")
    .replace(/<\/(p|li|ul|ol|blockquote)>/g, "\n")
    .replace(/<a href="([^"]+)">(.*?)<\/a>/g, (_, href, label) => `${label} (${href.startsWith("/") ? SITE + href : href})`)
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const intro = `# osmos assistant

> osmos assistant is an AI super-app for iPhone: a personal agent you talk to in one chat. It connects to your email, calendar, WhatsApp, Slack and 60+ other apps, answers questions, drafts replies, books flights, hotels and trains, keeps reminders and runs routines, and nothing is sent, booked or paid without your approval.

Key facts:
- Platform: iPhone, iOS 17 or later. Works best in English. Download: ${APP_STORE}
- Pricing: free to download with a one-time trial of 200 credits and 30 minutes of Computer Use. Paid plans: Plus (1,500 credits a month), Pro (3,000) and Max (8,000), billed through the App Store; prices are shown in the app for each country.
- Connects: Gmail and Outlook; Google, Outlook and iCal calendars; WhatsApp (Plus and above); Slack; Apple Reminders; and 60+ third-party tools such as Notion, Linear, Jira, GitHub and Google Drive (Pro and above).
- Acts: books flights, hotels and trains through travel suppliers (rail in the UK and most of Europe) after you confirm; has its own cloud computer for web tasks; has its own email address.
- Proactive: a Home card with what needs you, urgent-only notifications (at most five unrequested a day), scheduled routines and follow-ups.
- Privacy: data stored encrypted in the EU; never sold, never used for advertising, never used to train AI models; export or delete everything in the app.
- Contact: ${CONTACT}`;

export function llmsTxt() {
  const lines = [intro, "", "## Pages", `- [Home](${SITE}/): what osmos is and how it works`, `- [FAQ](${SITE}/faq): short answers about osmos, plans, privacy and features`, `- [Help centre](${SITE}/help): ${help.articles.length} articles on using osmos`];
  for (const f of features) lines.push(`- [${f.h1.replace(/\.$/, "")}](${SITE}/${f.slug}): ${f.description}`);
  for (const r of rivals) lines.push(`- [${r.h1}](${SITE}/compare/${r.slug}): ${r.description}`);
  lines.push("", "## Help centre");
  for (const c of help.collections) {
    lines.push("", `### ${c.title}`);
    for (const s of c.articles) {
      const a = help.articles.find((x) => x.slug === s)!;
      lines.push(`- [${a.title}](${SITE}/help/${a.slug}): ${a.description}`);
    }
  }
  lines.push("", "## Optional", `- [Full text of the FAQ and help centre](${SITE}/llms-full.txt)`, `- [Privacy policy](${SITE}/privacy)`, `- [Terms of use](${SITE}/terms)`);
  return lines.join("\n") + "\n";
}

export function llmsFullTxt() {
  const out = [intro, "", "## Frequently asked questions"];
  for (const g of faqGroups) {
    out.push("", `### ${g.title}`);
    for (const f of g.items) out.push("", `**${f.q}**`, text(f.a));
  }
  out.push("", "## Help centre");
  for (const c of help.collections) {
    out.push("", `## ${c.title}`, c.description);
    for (const s of c.articles) {
      const a = help.articles.find((x) => x.slug === s)!;
      out.push("", `### ${a.title}`, `Source: ${SITE}/help/${a.slug}`, "", a.description, "", text(a.html));
    }
  }
  return out.join("\n") + "\n";
}
