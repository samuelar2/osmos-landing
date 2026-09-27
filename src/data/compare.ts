// Comparison pages. Every competitor fact has a source, checked on CHECKED.
// Re-check the sources before editing a row: these products change month to month.

export const CHECKED = "26 September 2026";

export interface Row {
  topic: string;
  osmos: string;
  them: string;
  src?: number[]; // indexes into sources (1-based)
}

export interface Rival {
  slug: string;
  name: string;
  title: string;
  description: string;
  h1: string;
  lede: string;
  short: { title: string; body: string }[];
  rows: Row[];
  sources: { label: string; url: string }[];
}

export const rivals: Rival[] = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    title: "osmos vs ChatGPT: an AI assistant that runs your day · osmos assistant",
    description:
      "How osmos assistant compares with ChatGPT for email, calendar, WhatsApp, travel bookings, memory, proactive help and privacy. Sourced and checked September 2026.",
    h1: "osmos vs ChatGPT",
    lede: "ChatGPT is a brilliant general-purpose chatbot. osmos is built for something narrower: running your day. It connects to your accounts, remembers you, works on its own schedule, and books things when you say yes.",
    short: [
      {
        title: "It runs your accounts",
        body: "Gmail, Outlook, calendars, WhatsApp and Slack in one chat, plus its own email address, a unified Inbox and a Wallet for tickets.",
      },
      {
        title: "It works while you don't",
        body: "A Home card with the one thing that needs you, routines on a schedule, and follow-ups that check back and draft the nudge.",
      },
      {
        title: "Your data stays yours",
        body: "Stored encrypted in the EU, never used to train models, never sold, and no ads. Export or delete everything from the app.",
      },
    ],
    rows: [
      {
        topic: "Built for",
        osmos: "Running your day: email, calendar, messages, travel and reminders in one chat on iPhone.",
        them: "General questions, writing, analysis and coding, on the web and in apps including iPhone.",
        src: [3],
      },
      {
        topic: "Email",
        osmos: "Gmail and Outlook: triage, plain-English search, drafts you approve, a unified Inbox and its own email address.",
        them: "Gmail and Outlook connectors to search and read mail; drafts emails you choose whether to send (web, Plus and above).",
        src: [2, 5],
      },
      {
        topic: "Calendar",
        osmos: "Google and Outlook calendars plus iCal feeds such as school timetables; creates events.",
        them: "Reads Google and Outlook calendars; creating events needs write actions turned on, which OpenAI documents for workspace accounts.",
        src: [4, 5],
      },
      {
        topic: "WhatsApp and Slack",
        osmos: "Searches, reads and drafts in WhatsApp (Plus and above) and Slack, and sends when you ask.",
        them: "Slack search and summaries on Plus and above. No WhatsApp connector, though you can message ChatGPT on WhatsApp.",
        src: [2, 6],
      },
      {
        topic: "Bookings",
        osmos: "Searches live prices, holds, and books flights, hotels and trains when you confirm. Tickets are filed in Wallet.",
        them: "ChatGPT Work's cloud browser (Plus and above) can prepare a booking for you to approve; OpenAI notes not every transaction can be completed.",
        src: [8],
      },
      {
        topic: "Proactive help",
        osmos: "A Home card with what needs you, urgent-only notifications, routines, and follow-ups that check back.",
        them: "Scheduled tasks (3 active on Free and Go, 5 on Plus, 15 on Pro). Its proactive Pulse feature ended in June 2026.",
        src: [2, 7],
      },
      {
        topic: "Memory",
        osmos: "Builds from your chats and connected accounts. Ask what it knows, correct it, or delete it.",
        them: "Saved memories and chat history, with controls; how much it remembers depends on the plan.",
        src: [1, 9],
      },
      {
        topic: "Training on your data",
        osmos: "Never. Requests go only to model providers that don't retain or train on them.",
        them: "Consumer chats may be used to train models by default, unless you turn off “Improve the model for everyone”.",
        src: [10],
      },
      {
        topic: "Where your data lives",
        osmos: "Stored encrypted in the EU.",
        them: "EEA and UK consumer data is processed outside the EEA and UK, including in the US.",
        src: [11],
      },
      {
        topic: "Ads",
        osmos: "None.",
        them: "The Free and Go plans may show ads (in the UK since June 2026).",
        src: [1, 2],
      },
      {
        topic: "Price",
        osmos: "Free to download with a 200-credit trial. Plus, Pro and Max plans in the App Store.",
        them: "Free; Go $8 (£7); Plus $20 (£20); Pro from $100 a month.",
        src: [1],
      },
    ],
    sources: [
      { label: "ChatGPT pricing (chatgpt.com/pricing), viewed 26 Sep 2026", url: "https://chatgpt.com/pricing" },
      { label: "ChatGPT release notes (OpenAI Help Centre)", url: "https://help.openai.com/en/articles/6825453" },
      { label: "ChatGPT on the App Store, viewed 27 Sep 2026", url: "https://apps.apple.com/us/app/chatgpt/id6448311069" },
      { label: "Connectors and calendar write actions (OpenAI Help Centre, 13 Mar 2026)", url: "https://help.openai.com/en/articles/11391654" },
      { label: "Outlook in ChatGPT (OpenAI Help Centre, 30 Aug 2026)", url: "https://help.openai.com/en/articles/12512241" },
      { label: "Slack in ChatGPT (OpenAI Help Centre, 30 Aug 2026)", url: "https://help.openai.com/en/articles/12525822" },
      { label: "Scheduled tasks in ChatGPT (OpenAI Help Centre, 28 Aug 2026)", url: "https://help.openai.com/en/articles/10291617" },
      { label: "ChatGPT Work cloud browser (OpenAI Help Centre, 28 Aug 2026)", url: "https://help.openai.com/en/articles/20001280" },
      { label: "Memory FAQ (OpenAI Help Centre, 19 Sep 2026)", url: "https://help.openai.com/en/articles/8590148" },
      { label: "How your data is used to improve model performance (OpenAI Help Centre, 26 Sep 2026)", url: "https://help.openai.com/en/articles/5722486" },
      { label: "OpenAI EU privacy policy (24 Aug 2026)", url: "https://openai.com/policies/eu-privacy-policy/" },
    ],
  },
  {
    slug: "siri",
    name: "Siri",
    title: "osmos vs Siri: what an AI assistant app adds to iPhone",
    description:
      "How osmos assistant compares with Siri on iPhone: email, WhatsApp, travel bookings, memory, proactive help, availability and privacy. Checked September 2026.",
    h1: "osmos vs Siri",
    lede: "Siri is built into your iPhone and great at quick actions. osmos is an app that takes on whole jobs: triaging your inbox, booking the train, chasing the reply. The two work side by side.",
    short: [
      {
        title: "Whole jobs, not commands",
        body: "Ask for a hotel and osmos searches live prices, holds your pick and books it when you confirm, then files the ticket.",
      },
      {
        title: "It remembers you",
        body: "Preferences, people and plans from your chats and connected accounts, used the next time it books, drafts or plans.",
      },
      {
        title: "More iPhones, more places",
        body: "osmos runs on any iPhone with iOS 17 or later, including in the EU, where Siri's newest AI features aren't available on iPhone.",
      },
    ],
    rows: [
      {
        topic: "What it is",
        osmos: "An app: one chat that runs your email, calendar, messages and travel.",
        them: "Apple's built-in assistant. Siri AI arrived in beta with iOS 27 on 14 September 2026, adding personal context, on-screen awareness and more actions in apps; you opt in and join a waitlist.",
        src: [1, 2],
      },
      {
        topic: "Which iPhones",
        osmos: "Any iPhone running iOS 17 or later.",
        them: "Siri AI needs an iPhone 15 Pro, iPhone 16 or later, or iPhone Air.",
        src: [3],
      },
      {
        topic: "Where and in which languages",
        osmos: "Works best in English.",
        them: "Siri AI is English-only at launch, with more languages from October. It isn't available on iPhone in the EU.",
        src: [1, 3],
      },
      {
        topic: "Email",
        osmos: "Connects Gmail and Outlook directly: triage, plain-English search, drafts you approve and its own email address.",
        them: "Summaries, Priority Messages, categories and Smart Reply in Apple Mail, which can hold Gmail and Outlook accounts.",
        src: [4, 5],
      },
      {
        topic: "WhatsApp and Slack",
        osmos: "Reads, searches and drafts in WhatsApp and Slack, and sends when you ask.",
        them: "Can send WhatsApp messages through app actions.",
        src: [1],
      },
      {
        topic: "Bookings",
        osmos: "Books flights, hotels and trains when you confirm, with tickets filed in Wallet.",
        them: "Apple doesn't document Siri booking travel itself; that is left to each app's own actions.",
        src: [6],
      },
      {
        topic: "Memory",
        osmos: "Remembers people, preferences and plans; ask what it knows, correct it, or delete it.",
        them: "Keeps your Siri conversation history in iCloud for 30 days or a year. Apple documents no editable memory of your preferences.",
        src: [7],
      },
      {
        topic: "Proactive help",
        osmos: "A Home card with what needs you, routines on a schedule, and follow-ups that check back.",
        them: "Notification summaries, prioritised notifications and Priority Messages in Mail.",
        src: [8],
      },
      {
        topic: "Privacy",
        osmos: "Stored encrypted in the EU and never used to train models.",
        them: "Processes on the device first; bigger requests go to Private Cloud Compute, where Apple says data isn't stored or accessible to Apple.",
        src: [9],
      },
    ],
    sources: [
      { label: "Apple Newsroom: Siri AI is here (14 Sep 2026)", url: "https://www.apple.com/newsroom/2026/09/siri-ai-a-profoundly-more-capable-and-personal-assistant-is-here/" },
      { label: "Apple Support: what's new in Siri (14 Sep 2026)", url: "https://support.apple.com/en-us/149076" },
      { label: "Apple Support: Siri AI requirements and availability (22 Sep 2026)", url: "https://support.apple.com/en-us/127893" },
      { label: "iPhone User Guide: summarise and prioritise in Mail (iOS 27)", url: "https://support.apple.com/en-gb/guide/iphone/iph461684497/ios" },
      { label: "Apple: iOS feature availability", url: "https://www.apple.com/ios/feature-availability/" },
      { label: "Apple Developer: App Intents schema domains", url: "https://developer.apple.com/documentation/AppIntents/app-schema-domains" },
      { label: "iPhone User Guide: Siri conversation history (iOS 27)", url: "https://support.apple.com/en-gb/guide/iphone/p7ny364ngxlj/ios" },
      { label: "iPhone User Guide: notification summaries (iOS 27)", url: "https://support.apple.com/en-gb/guide/iphone/iph1fbe7d2b9/ios" },
      { label: "iPhone User Guide: Apple Intelligence and privacy (iOS 27)", url: "https://support.apple.com/en-gb/guide/iphone/iphe3f499e0e/ios" },
    ],
  },
];
