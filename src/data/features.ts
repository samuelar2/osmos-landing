// Feature pages (/email, /travel, /memory, /pulse, /computer).
// Every claim here comes from the help centre (src/data/help.json); link back to it.

export type Visual =
  | { kind: "screen"; id: "screen-results" | "screen-travel" | "screen-apps" | "screen-holding"; alt: string }
  | { kind: "icon"; id: string }
  | { kind: "mock"; name: "inbox" | "memory" | "pulse" | "address" | "computer" };

export interface Section {
  kicker: string;
  title: string;
  body: string; // HTML
  bullets?: string[];
  visual: Visual;
}

export interface Feature {
  slug: string;
  nav: string;
  title: string; // <title>
  description: string; // meta description
  eyebrow: string;
  h1: string;
  lede: string;
  hero: Visual;
  sections: Section[];
  callout: { icon: string; title: string; items: string[] };
  faqs: { q: string; a: string }[];
  related: string[]; // help slugs
}

export const features: Feature[] = [
  {
    slug: "email",
    nav: "Email",
    title: "AI email assistant for Gmail and Outlook · osmos assistant",
    description:
      "osmos triages your Gmail and Outlook inbox, drafts replies you approve, answers questions about your mail and gives your assistant its own email address. On iPhone.",
    eyebrow: "Email",
    h1: "Your inbox, handled.",
    lede: "Connect Gmail or Outlook and osmos sorts what needs you from what doesn't, drafts replies before you open the thread, and answers questions about your mail in plain English. Nothing is sent unless you say so.",
    hero: { kind: "mock", name: "inbox" },
    sections: [
      {
        kicker: "Triage",
        title: "One inbox, sorted by what needs you.",
        body: "<p>The Inbox app shows mail from every connected account in one list. osmos triages each thread (needs a reply, informational, receipt), offers one-tap replies, and lets you swipe to archive.</p>",
        bullets: ["Gmail and Outlook, with several accounts at once", "Threads that need you come first", "Searches cover every connected account"],
        visual: { kind: "icon", id: "icon-envelope" },
      },
      {
        kicker: "Drafts",
        title: "Replies drafted, never sent behind your back.",
        body: "<p>Ask “Draft a reply to Ben saying Thursday works” and the draft is ready for you to review. Nothing is sent unless you say so. If sending is off for an account, osmos writes the reply in chat for you to copy.</p>",
        visual: { kind: "icon", id: "icon-shield" },
      },
      {
        kicker: "Ask your inbox",
        title: "Search your mail in plain English.",
        body: "<p>“What did the landlord say?” “When did I last email the accountant?” osmos searches, reads and summarises across your connected accounts, and the small grey step lines under its answer show exactly which emails it checked.</p>",
        visual: { kind: "icon", id: "icon-notebook" },
      },
      {
        kicker: "Your osmos address",
        title: "An email address for your assistant.",
        body: "<p>Inside Inbox there's an address that belongs to your assistant. Forward or CC mail to it and osmos reads the thread, drafts a reply, or takes the action you asked for. Bookings and tickets it finds in your mail are filed in Wallet.</p>",
        visual: { kind: "mock", name: "address" },
      },
    ],
    callout: {
      icon: "icon-shield",
      title: "osmos drafts. You send.",
      items: [
        "Nothing is sent without your approval.",
        "Only mail from your own connected addresses counts as instructions; everything else is treated as a third party.",
        "It won't send money, share credentials or do anything irreversible from email.",
        "Disconnect an account at any time and osmos stops reading it from then on.",
      ],
    },
    faqs: [
      {
        q: "Does osmos work with Gmail and Outlook?",
        a: "Yes. Connect Gmail or Outlook, several accounts if you like, and osmos can search, read, summarise and draft across all of them. While Google's own verification of osmos completes, Gmail may show a “Google hasn't verified this app” screen; continuing is safe, and you can revoke access from your Google account at any time.",
      },
      {
        q: "Will osmos send emails without asking?",
        a: "No. Drafts are shown to you first and nothing is sent unless you say so. Sending from a connected account also needs that account's send permission.",
      },
      {
        q: "Does osmos keep my emails?",
        a: "It stores what it needs to work for you, such as mail it has read to answer you, encrypted and in the EU, with access limited to your account. It's never sold or used to train models, and it's deleted with your account.",
      },
    ],
    related: ["email-gmail-and-outlook", "inbox-app-and-your-osmos-address", "your-data-and-where-it-goes"],
  },
  {
    slug: "travel",
    nav: "Travel",
    title: "AI travel assistant that books trains, hotels and flights · osmos",
    description:
      "Ask osmos for a train, hotel or flight in one sentence. It searches live prices, holds your pick, books when you confirm and files the ticket in Wallet.",
    eyebrow: "Travel and bookings",
    h1: "Plans that book themselves.",
    lede: "Ask for a train, a hotel or a flight in one sentence. osmos searches live prices, holds the one you pick, and books it the moment you confirm. The ticket lands in Wallet.",
    hero: { kind: "screen", id: "screen-results", alt: "osmos showing five-star hotels in Monte Carlo with prices and a Book button" },
    sections: [
      {
        kicker: "Search",
        title: "One sentence. Live prices.",
        body: "<p>“Train to Manchester Saturday morning.” “A hotel near the British Museum for two nights.” “Flight to Edinburgh on the 14th, back on the 16th.” osmos searches live prices with travel suppliers and shows your options as cards.</p>",
        visual: { kind: "screen", id: "screen-travel", alt: "osmos showing Eurostar trains from London St Pancras to Paris Nord" },
      },
      {
        kicker: "Approve",
        title: "It holds. You confirm.",
        body: "<p>osmos holds the fare or room with the supplier, so nothing is charged yet. You see a review card with the full price, the rules, the traveller details and the card it will use. Confirm, and it pays with the card in your Wallet.</p>",
        bullets: [
          "Nothing is charged until you confirm",
          "A spending limit osmos can't exceed, which starts small and grows as bookings settle",
          "Card details stay with the payment provider; osmos only ever sees a token",
        ],
        visual: { kind: "screen", id: "screen-holding", alt: "osmos holding a room at the Hôtel de Paris while you confirm" },
      },
      {
        kicker: "Wallet",
        title: "Every ticket in one place.",
        body: "<p>Confirmations go straight into Wallet, along with the tickets, bookings and reservations osmos finds in your email. When an airline or operator changes a schedule, the ticket updates; ask osmos about the fare rules and it will request changes or refunds where the supplier allows.</p>",
        visual: { kind: "icon", id: "icon-ticket" },
      },
      {
        kicker: "Places",
        title: "Restaurants and places, too.",
        body: "<p>Ask the way you'd ask a friend: “somewhere good for lunch near the office”. osmos shows a map card with options, ratings and distance, and books tables on the restaurant's own site, handing over to you if it needs an account or a card guarantee.</p>",
        visual: { kind: "icon", id: "icon-calendar" },
      },
    ],
    callout: {
      icon: "icon-card",
      title: "Where it stops.",
      items: [
        "The final confirmation of any booking is yours.",
        "Prices and availability are the supplier's, and can change between search and confirmation.",
        "Rail covers the UK and most of Europe; refundability depends on the operator and ticket.",
        "Loyalty points and reward seats can't be booked in chat, but osmos can use its computer on the airline's own site while you watch.",
      ],
    },
    faqs: [
      {
        q: "Does osmos charge my card without asking?",
        a: "No. Holds come first and nothing is charged until you confirm, within a spending limit osmos can't exceed. If you've asked it to auto-confirm a hold, you get a notification with a window to cancel before it goes through.",
      },
      {
        q: "What can osmos book?",
        a: "Flights, hotels and trains (rail covers the UK and most of Europe), plus restaurant tables on the restaurant's own site. It keeps traveller profiles for you and the people you travel with, with passport numbers stored encrypted.",
      },
      {
        q: "What if my plans change?",
        a: "Ask osmos to check the fare rules for any booking in Wallet. Where the supplier allows changes or refunds through their system, osmos can request them; where they don't, it tells you what to do and with whom.",
      },
    ],
    related: ["booking-flights-hotels-and-trains", "paying-and-approvals", "wallet-your-card-your-limits-your-tickets", "changes-refunds-and-rebooking"],
  },
  {
    slug: "memory",
    nav: "Memory",
    title: "An AI assistant that remembers you · osmos assistant",
    description:
      "osmos remembers people, preferences and plans from your chats and connected accounts, and uses them when it books, drafts or plans. You stay in control.",
    eyebrow: "Memory",
    h1: "A memory that sticks.",
    lede: "Say it once. osmos remembers people, preferences and plans from your conversations and connected accounts, and quietly uses them the next time it books, drafts or plans for you.",
    hero: { kind: "mock", name: "memory" },
    sections: [
      {
        kicker: "What it remembers",
        title: "The details that make help useful.",
        body: "<p>Names, preferences, plans, decisions and the way you like things done. Because it builds up from your chats and the accounts you connect, the second week with osmos is better than the first.</p>",
        visual: { kind: "icon", id: "icon-notebook" },
      },
      {
        kicker: "You're in control",
        title: "Ask, correct, delete.",
        body: "<p>Ask “What do you know about my trip in October?” If something is wrong, tell it in chat and it stops using it. Memory belongs to your account, is never used to train models, and is deleted with your account.</p>",
        visual: { kind: "icon", id: "icon-shield" },
      },
      {
        kicker: "Standing rules",
        title: "Instructions it keeps following.",
        body: "<p>“Always use 24-hour times.” “Never book anything without asking.” “Call me Sam.” Rules you state clearly are remembered and applied. You can also give your assistant a name and a tone in Core → Profile.</p>",
        visual: { kind: "icon", id: "icon-bolt" },
      },
    ],
    callout: {
      icon: "icon-notebook",
      title: "Honest limits.",
      items: [
        "Memory is retrieval, not a perfect record: osmos recalls what seems relevant, so restating the important things never hurts.",
        "It remembers facts, not every word. To see an old message verbatim, ask it to find the original.",
        "It only knows what you've told it or connected.",
      ],
    },
    faqs: [
      { q: "Can I see what osmos remembers?", a: "Yes. Ask in chat, for example “What do you know about my trip in October?”, and correct anything that's wrong." },
      { q: "Can I delete my memories?", a: "Tell osmos in chat when something is wrong and it stops using it. To remove everything, memory included, delete your account from Core → Profile; you can export your data first." },
      { q: "Is my memory used to train AI models?", a: "No. Your data is never sold, never used for advertising and never used to train models." },
    ],
    related: ["how-osmos-remembers", "setting-osmoss-name-tone-and-rules", "exporting-or-deleting-your-data"],
  },
  {
    slug: "pulse",
    nav: "Pulse and routines",
    title: "Proactive AI assistant: briefings, routines, follow-ups · osmos",
    description:
      "osmos stays ahead of your day: a Home card with what needs you, notifications only when it matters, routines on your schedule, and follow-ups that check back.",
    eyebrow: "Pulse and routines",
    h1: "Ahead of your day.",
    lede: "While you're busy, osmos checks your email, calendar, tasks and messages, and brings you the one thing that deserves your attention: a briefing, a nudge, a drafted reply.",
    hero: { kind: "mock", name: "pulse" },
    sections: [
      {
        kicker: "The Home card",
        title: "One card: the thing that matters now.",
        body: "<p>Several times a day, and whenever something urgent lands, osmos decides what, if anything, deserves the top of Chat: a briefing, an action or a reminder. Often it's nothing, which is normal. Dismiss a card and it won't come back without a new reason.</p>",
        visual: { kind: "icon", id: "icon-bolt" },
      },
      {
        kicker: "Notifications",
        title: "It only interrupts when it should.",
        body: "<p>osmos messages you when something is urgent enough to know before you next open the app: a deadline that moved, money at risk, someone waiting on you. Everything else waits on the Home card.</p>",
        bullets: ["Quiet hours that you set", "At most five unrequested messages in any 24 hours", "The same thing never texts you twice"],
        visual: { kind: "icon", id: "icon-shield" },
      },
      {
        kicker: "Routines",
        title: "Work that runs on a schedule.",
        body: "<p>A morning briefing at 7:30, a Friday spend review, a daily check of a site. Describe the job and when it should run; results arrive as a card in chat and, if you like, a notification. There's a home-screen widget, too.</p>",
        visual: { kind: "icon", id: "icon-calendar" },
      },
      {
        kicker: "Follow-ups",
        title: "Promises it keeps.",
        body: "<p>“Check with Ben on Friday whether the copy is done; if not, draft a nudge.” On the day, osmos looks for evidence (a reply, a document, a calendar change), then reminds you, drafts the nudge for you to approve, or reports what it found.</p>",
        visual: { kind: "icon", id: "icon-envelope" },
      },
    ],
    callout: {
      icon: "icon-bolt",
      title: "Quiet by design.",
      items: [
        "Set active hours in Core → Profile; outside them only the most urgent things get through.",
        "Routines you schedule yourself don't count against the daily limit.",
        "Nudges to other people are drafts for you to approve, never sent behind your back.",
      ],
    },
    faqs: [
      { q: "How often will osmos message me?", a: "Only for urgent things, at most five unrequested messages in any 24 hours and at most two from any single check. Routines you scheduled yourself don't count against that limit." },
      { q: "What is a routine?", a: "A job osmos runs on a schedule, such as a morning briefing or a weekly review. Set it up in Core → Routines by describing the job and when it should run. Routines use credits each time they run." },
      { q: "Does osmos check my accounts in the background?", a: "Yes, on the Plus plan and above, which add background monitoring. That's what keeps the Home card current without you asking." },
    ],
    related: ["the-home-card-explained", "why-did-osmos-message-me", "routines-scheduled-work", "active-agents-what-a-follow-up-actually-does"],
  },
  {
    slug: "computer",
    nav: "Computer Use",
    title: "Computer Use: an AI assistant with its own computer · osmos assistant",
    description:
      "osmos has its own cloud computer with a browser. It fills in forms, checks sites with no API and books where a chat can't reach, while you watch or take over.",
    eyebrow: "Computer Use",
    h1: "Its own computer.",
    lede: "Some jobs need a real browser. osmos has a desktop in the cloud with Chrome, and uses it for the tasks a chat window can't finish, while you watch.",
    hero: { kind: "mock", name: "computer" },
    sections: [
      {
        kicker: "What it's for",
        title: "For the jobs a chat can't finish.",
        body: "<p>Booking with airline points, filling in a form on a government site, pulling numbers out of a portal, checking availability on a site with no API. It's the same machine every time, so logins you've done stay done, and files it produces land in your Files app.</p>",
        visual: { kind: "icon", id: "icon-bolt" },
      },
      {
        kicker: "Watch live",
        title: "Watch, take over, give back.",
        body: "<p>Each step shows in chat as it happens. Watch live opens the screen. Take over gives you the mouse and keyboard while osmos waits; give back control and it carries on with the original task.</p>",
        visual: { kind: "icon", id: "icon-shield" },
      },
      {
        kicker: "Minutes",
        title: "Computer time on every plan.",
        body: "<p>Computer time is measured while the machine runs. The free trial includes 30 one-time minutes; Plus includes 120 a month, Pro 300 and Max 600, with a daily cap of 120 minutes. Between jobs the machine is paused and costs nothing.</p>",
        visual: { kind: "icon", id: "icon-calendar" },
      },
    ],
    callout: {
      icon: "icon-shield",
      title: "What it never does.",
      items: [
        "Type your passwords, card numbers or codes. Those steps are handed to you.",
        "Press the final Pay or Confirm on a purchase. It gets you to the review page and stops.",
        "Solve CAPTCHAs. Sites that challenge it are handed to you.",
      ],
    },
    faqs: [
      { q: "Which plans include Computer Use?", a: "Every plan. The free trial includes 30 one-time minutes; Plus includes 120 minutes a month, Pro 300 and Max 600. Computer time also uses credits, at cost." },
      { q: "Is it safe to sign in to sites on it?", a: "You do the sign-in yourself: osmos hands control to you for logins, two-factor codes and payment pages. Sessions stay signed in on your machine; sign out there if you'd rather not keep one." },
      { q: "Can I watch what it's doing?", a: "Yes. Every step shows in chat, Watch live opens the screen, and Take over gives you the controls at any point." },
    ],
    related: ["what-computer-use-is", "watch-live-take-over-give-back", "minutes-limits-and-cost", "what-the-computer-will-never-do-and-about-your-logins"],
  },
];
