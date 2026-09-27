// FAQ copy, shared by /faq (all of it) and the homepage (the ones marked `home`).
// Answers are drawn from the help centre (src/data/help.json) and the plan config in the
// backend; keep them in step with those rather than inventing claims.

export interface QA {
  q: string;
  a: string; // HTML
  home?: boolean;
}

export const faqGroups: { title: string; items: QA[] }[] = [
  {
    title: "About osmos",
    items: [
      {
        home: true,
        q: "What is osmos assistant?",
        a: `<p>osmos assistant is an AI super-app for iPhone: a personal agent you talk to in one chat. Connect your email, calendar, WhatsApp, Slack and other apps, and it answers questions, drafts replies, books travel, keeps your reminders and runs routines for you, including jobs it carries on with after you've closed the app.</p><p><a href="/help/what-osmos-is-and-what-it-isnt">What osmos is (and what it isn't)</a></p>`,
      },
      {
        home: true,
        q: "How is osmos different from ChatGPT or Siri?",
        a: `<p>Three things. It remembers what you tell it and what it learns from your connected accounts, so you don't repeat yourself. It works on its own: routines run on a schedule, follow-ups check back later, and the Home card surfaces what needs you. And it acts: it books flights, hotels and trains with your approval, and has its own computer for jobs on the web.</p><p>See <a href="/compare/chatgpt">osmos vs ChatGPT</a> and <a href="/compare/siri">osmos vs Siri</a>.</p>`,
      },
      {
        q: "Which apps does osmos work with?",
        a: `<p>Gmail and Outlook for email; Google, Outlook and iCal calendars; WhatsApp and Slack; and Apple Reminders sync. On the Pro plan and above you can also connect third-party tools such as Notion, Linear, Jira, GitHub, Google Drive and Docs, HubSpot, Stripe, Trello and Zoom, 60+ in all.</p><p><a href="/help/tool-manager-everything-osmos-can-use">Tool manager: everything osmos can use</a></p>`,
      },
      {
        q: "Is osmos on Android?",
        a: `<p>Not yet. osmos is iPhone only for now, and works best in English.</p>`,
      },
    ],
  },
  {
    title: "Plans and credits",
    items: [
      {
        home: true,
        q: "Is osmos free?",
        a: `<p>osmos is free to download and includes a one-time trial of 200 credits and 30 minutes of Computer Use. Paid plans (Plus, Pro and Max) add 1,500, 3,000 or 8,000 credits a month, plus features such as WhatsApp, third-party tools and more computer time. Prices are shown in the app for your country and billed through the App Store.</p><p><a href="/help/plans-and-pricing">Plans and pricing</a></p>`,
      },
      {
        q: "What are credits?",
        a: `<p>Credits are the single unit osmos runs on. A chat reply typically costs a couple of credits; routines, meeting recordings and computer time cost more. Reading your Home card, opening apps and browsing your own data cost nothing. Credits refresh monthly on paid plans.</p><p><a href="/help/credits-explained">Credits explained</a></p>`,
      },
      {
        q: "What happens when I run out of credits?",
        a: `<p>Chat replies pause, and so do routines, follow-ups and Home card checks. Everything you already have stays readable and nothing is deleted. On a paid plan, credits refresh on your next monthly date; on the free trial, upgrade to continue.</p>`,
      },
    ],
  },
  {
    title: "Trust and privacy",
    items: [
      {
        home: true,
        q: "Does osmos do things without asking?",
        a: `<p>No. Spending money, sending a message it wasn't asked to send, deleting or overwriting things in a connected tool, and typing passwords, card numbers or codes always come back to you. Bookings are held first and only confirmed when you approve.</p><p><a href="/help/what-osmos-will-never-do-on-its-own">What osmos will never do on its own</a></p>`,
      },
      {
        home: true,
        q: "Is my data safe?",
        a: `<p>Your data is stored encrypted, in the EU, and access is limited to your account. To think, osmos sends only the relevant parts of a request to AI model providers that don't retain or train on it. Your data is never sold, never used for advertising and never used to train models, and you can export or delete all of it from Core → Profile.</p><p><a href="/help/your-data-and-where-it-goes">Your data and where it goes</a> · <a href="/privacy">Privacy policy</a></p>`,
      },
      {
        q: "Can osmos send email as me?",
        a: `<p>Only when you say so. osmos can search, read, summarise and draft; drafts are shown to you first and nothing is sent unless you approve it. It also has its own email address you can forward or CC mail to.</p><p><a href="/email">Email in osmos</a></p>`,
      },
    ],
  },
  {
    title: "What it can do",
    items: [
      {
        q: "Can osmos book flights, hotels and trains?",
        a: `<p>Yes. Ask in chat and osmos searches live prices, shows you options and holds the one you pick. You see the full fare, the rules and the traveller details, then confirm; osmos pays with the card in your Wallet, within a spending limit, and files the ticket in Wallet. Rail covers the UK and most of Europe.</p><p><a href="/travel">Travel in osmos</a></p>`,
      },
      {
        q: "Does osmos remember things?",
        a: `<p>Yes. It builds a memory from your conversations and connected accounts: names, preferences, plans and the way you like things done. Ask what it remembers, correct anything that's wrong, and delete it whenever you like.</p><p><a href="/memory">Memory in osmos</a></p>`,
      },
      {
        q: "Will osmos message me?",
        a: `<p>Only when something is urgent enough to know before you next open the app: a deadline that moved, money at risk, someone waiting on you. It respects your quiet hours and sends at most five unrequested messages a day; everything else waits on the Home card.</p><p><a href="/pulse">Pulse and routines</a></p>`,
      },
      {
        q: "What is Computer Use?",
        a: `<p>osmos has its own computer: a desktop in the cloud with a browser. It uses it for jobs a chat can't finish, such as filling in a form on a website or checking availability on a site with no API. You can watch live and take over, and it hands control to you for logins, codes and payment pages. Every plan includes some computer time.</p><p><a href="/computer">Computer Use</a></p>`,
      },
    ],
  },
];

export const allFaqs = faqGroups.flatMap((g) => g.items);
export const homeFaqs = allFaqs.filter((f) => f.home);
