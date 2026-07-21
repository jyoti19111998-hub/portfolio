/**
 * Single source of truth for all real portfolio content.
 * Everything rendered on the page is derived from here — no fabricated
 * testimonials, publications, or metrics are introduced beyond this data.
 */
window.PORTFOLIO_DATA = {
  person: {
    name: "Jyoti Kumari",
    role: "Law × AI × Automation",
    location: "India — Open to Remote & Global Opportunities",
    email: "jyotikumariwork19@gmail.com",
    linkedin: "https://www.linkedin.com/in/jyoti-kumari-4910111b4",
    resume: "Jyoti_Kumari_CV.pdf",
    photo: "photo.jpg.png",
    tagline: "I help law firms, startups, and professionals automate rigorous legal research, content, and operational workflows using Claude, GPT-4, and cutting-edge AI — eliminating hours of manual work every day, while staying acutely mindful of legal, ethical, and regulatory challenges.",
    availability: "Available for new projects",
  },

  nowBuilding: [
    "researching agentic workflows for multi-source legal synthesis",
    "refining a contract-risk scoring model with Claude",
    "exploring AI governance frameworks across the EU AI Act & India's DPDP Act",
    "building faster no-manual-input publishing pipelines",
  ],

  stats: [
    { num: "90%+", label: "Manual time eliminated" },
    { num: "5+", label: "Platforms automated" },
    { num: "3", label: "Domains: Law · AI · Automation" },
    { num: "100+", label: "Apps she can connect" },
  ],

  heroTags: ["⚖️ Legal Research", "🤖 AI Automation", "📚 Knowledge Systems", "🚀 LegalTech"],

  services: [
    {
      icon: "⚖️",
      title: "Legal Research & Deep Analysis",
      desc: "Rigorous, multi-jurisdictional, precedent-driven research that transforms complex legal questions into structured, actionable intelligence.",
      tags: ["AI Regulation", "Data Protection (GDPR · DPDP)", "Intellectual Property", "Comparative Policy Analysis", "AI-Assisted Contract Review", "Case Law Research", "Statutory Interpretation", "Regulatory Compliance"],
    },
    {
      icon: "🤖",
      title: "AI Workflow Automation",
      desc: "End-to-end intelligent automation using Claude, GPT-4, and leading platforms — built to run reliably without supervision.",
      tags: ["Claude (Anthropic)", "OpenAI GPT-4", "Make · Zapier · n8n", "Content Pipelines", "Multi-platform Publishing", "LegalTech Automation", "API Integrations", "Agentic Workflows"],
    },
    {
      icon: "📚",
      title: "Research & Knowledge Systems",
      desc: "Systematic, structured knowledge architectures that make research findable, shareable, and continuously updated — automatically.",
      tags: ["Scholarly Legal Writing", "Thought Leadership Content", "Real-time Regulatory Monitoring", "Knowledge Management Systems", "Judgment & Case Tracking", "AI-Summarised Research Briefs"],
    },
  ],

  projects: [
    {
      id: "content-automation",
      num: "01",
      title: "AI-Powered Legal Content Automation System",
      subtitle: "Custom-built end-to-end pipeline: AI content → branded video reels → auto-posted to Instagram, LinkedIn & Facebook daily",
      problem: "Consistent social media presence is essential for lawyers building a personal brand — but daily content creation, video editing, and cross-platform posting consumed hours every week with no scalable solution.",
      approach: "Built a fully custom pipeline from scratch — not a no-code template. An AI content engine (Groq LLaMA 3.3 70B) generates fresh legal content daily. A custom Python/FFmpeg video engine creates branded Instagram Reels with pastel slide animations, crossfade transitions, and generated music. Cloudinary REST API handles cloud upload; Buffer's GraphQL API (reverse-engineered via live introspection) handles cross-platform publishing. A macOS launchd daemon runs everything at 9am with zero manual input.",
      outcome: "90%+ reduction in content management time. Daily branded video posts auto-published to Instagram, Facebook, and LinkedIn — while solving real engineering problems: FFmpeg filter syntax, network proxy restrictions, and undocumented GraphQL field names.",
      outcomeBadge: "✓ 90%+ time saved · Zero manual effort",
      learning: "Real automation engineering means debugging API schema changes in real time, not just connecting pre-built blocks. The difference between a working system and a broken one is understanding the stack at every layer.",
      stack: ["Python", "FFmpeg", "Groq API (LLaMA 3.3 70B)", "Cloudinary REST API", "Buffer GraphQL API", "PIL / Pillow", "macOS launchd", "Instagram", "Facebook", "LinkedIn"],
    },
    {
      id: "contract-review",
      num: "02",
      title: "AI Contract Review Automation",
      subtitle: "Upload a contract → full risk & clause report in minutes, not hours",
      problem: "Lawyers and businesses spend hours on first-pass contract reviews — a repetitive, expensive use of legal expertise.",
      approach: "Built a workflow that accepts uploaded contracts, runs GPT-4 analysis, flags risky clauses and missing provisions, then generates a structured report.",
      outcome: "First-pass contract review delivered in minutes instead of hours, with actionable recommendations per clause.",
      outcomeBadge: "✓ Hours → Minutes",
      learning: "Legal professionals don't want AI to replace them — they want it to handle the groundwork so they can focus on judgement.",
      stack: ["OpenAI GPT-4", "Make", "Zapier", "n8n", "Google Docs", "Google Drive", "PDF Processing"],
    },
    {
      id: "judgment-digest",
      num: "03",
      title: "Daily Legal Judgment Digest",
      subtitle: "Fresh case law summaries delivered to inbox every morning at 7 AM",
      problem: "Staying current with case law means checking multiple databases daily — a significant, unavoidable time cost for lawyers.",
      approach: "Automated search of legal databases every morning, AI summarises the top 3–5 judgments, highlights key developments, then delivers via email, WhatsApp, or Slack.",
      outcome: "Zero manual research needed. Lawyers receive curated, AI-summarised daily briefings before their first meeting.",
      outcomeBadge: "✓ Zero manual research",
      learning: "The best legal automation removes the grunt work while giving professionals more signal, not more noise.",
      stack: ["OpenAI GPT-4", "Make", "Zapier", "n8n", "Legal APIs", "Gmail", "Google Sheets", "WhatsApp", "Slack"],
    },
    {
      id: "research-assistant",
      num: "04",
      title: "AI-Powered On-Demand Legal Research Assistant",
      subtitle: "Ask a legal question → get a thoroughly researched, cited, structured memo in minutes",
      problem: "Junior associates and solo lawyers spend 3–6 hours on basic legal research tasks that require cross-referencing statutes, case law, and commentary — before any real analysis begins.",
      approach: "Built an agentic workflow where Claude reads the legal query, autonomously searches multiple legal sources, synthesises findings, identifies contradictions, and generates a structured research memo with citations.",
      outcome: "Research tasks that took half a day completed in under 10 minutes. Output includes cited sources, conflicting precedents flagged, and a summary suited for partner review.",
      outcomeBadge: "✓ Hours → 10 minutes",
      learning: "Claude's long context window and nuanced legal reasoning makes it exceptionally suited for synthesising complex, multi-source legal analysis — far beyond simple Q&A.",
      stack: ["Claude (Anthropic)", "n8n", "Perplexity AI", "Legal Databases / APIs", "Google Docs", "Slack"],
    },
    {
      id: "regulatory-monitoring",
      num: "05",
      title: "Real-Time Regulatory Change Monitoring System",
      subtitle: "Track AI Act, GDPR, DPDP & IT Rules changes — get instant alerts with plain-language summaries",
      problem: "Compliance teams and legal counsels must manually track dozens of regulatory sources across jurisdictions for AI law, data protection, and technology regulations — changes can emerge overnight.",
      approach: "Automated monitoring of official regulatory portals, gazette notifications, and legal news sources. Claude analyses each change for materiality, classifies impact level, and generates a plain-language briefing — delivered instantly to email or Slack.",
      outcome: "Zero regulatory updates missed. Compliance teams receive structured, prioritised alerts with a \"what this means for you\" summary — no manual scanning required.",
      outcomeBadge: "✓ Zero missed updates",
      learning: "Regulatory monitoring is the perfect use case for Claude's reasoning — it doesn't just flag changes, it interprets their significance relative to a client's specific industry and risk profile.",
      stack: ["Claude (Anthropic)", "Make", "n8n", "RSS / Web Scraping", "Government Gazette APIs", "Gmail", "Slack", "Google Sheets"],
    },
    {
      id: "client-intake",
      num: "06",
      title: "Law Firm Client Intake & Matter Automation",
      subtitle: "New client enquiry → conflict check → matter created → welcome email → calendar booked, automatically",
      problem: "Law firms lose 20–40% of potential clients due to slow, inconsistent intake processes. Receptionists spend hours on manual data entry, conflict checks, and follow-up emails — work that delays the first client conversation.",
      approach: "Built a seamless intake pipeline: client submits an online form → Claude extracts and classifies matter type → conflict check runs automatically → matter opened in the system → personalised welcome email sent → consultation booked via calendar integration.",
      outcome: "Client response time dropped from 24–48 hours to under 5 minutes. Lawyers receive a structured matter summary before the first call — no prep time wasted.",
      outcomeBadge: "✓ 48hrs → 5 minutes",
      learning: "First impressions determine client retention. Automating intake doesn't depersonalise — it frees lawyers to focus entirely on the client during the actual consultation.",
      stack: ["Claude (Anthropic)", "Make", "Zapier", "Typeform / Google Forms", "Google Calendar", "Gmail", "Notion / Airtable", "OpenAI GPT-4"],
    },
  ],

  // Skill galaxy nodes — id/label/group used for both the canvas visualization
  // and the knowledge graph. Links define which nodes connect.
  skills: {
    nodes: [
      { id: "law", label: "Law", group: "core", size: 30 },
      { id: "ai", label: "AI", group: "core", size: 30 },
      { id: "ip", label: "IP", group: "core", size: 22 },
      { id: "automation", label: "Automation", group: "core", size: 28 },
      { id: "research", label: "Research", group: "core", size: 24 },

      { id: "claude", label: "Claude", group: "ai", size: 20 },
      { id: "gpt4", label: "GPT-4", group: "ai", size: 20 },
      { id: "prompting", label: "Prompt Engineering", group: "ai", size: 14 },
      { id: "agentic", label: "Agentic AI", group: "ai", size: 16 },

      { id: "make", label: "Make", group: "automation", size: 16 },
      { id: "zapier", label: "Zapier", group: "automation", size: 16 },
      { id: "n8n", label: "n8n", group: "automation", size: 16 },
      { id: "python", label: "Python", group: "automation", size: 18 },
      { id: "ffmpeg", label: "FFmpeg", group: "automation", size: 12 },

      { id: "contracts", label: "Contract Analysis", group: "law", size: 16 },
      { id: "caselaw", label: "Case Law Research", group: "law", size: 16 },
      { id: "gdpr", label: "Data Protection", group: "law", size: 14 },
      { id: "compliance", label: "Regulatory Compliance", group: "law", size: 16 },

      { id: "knowledge", label: "Knowledge Systems", group: "research", size: 16 },
      { id: "writing", label: "Legal Writing", group: "research", size: 12 },
    ],
    links: [
      ["law", "ip"], ["law", "research"], ["law", "automation"],
      ["ai", "automation"], ["ai", "research"], ["ai", "law"],
      ["ai", "claude"], ["ai", "gpt4"], ["ai", "prompting"], ["ai", "agentic"],
      ["automation", "make"], ["automation", "zapier"], ["automation", "n8n"],
      ["automation", "python"], ["python", "ffmpeg"],
      ["law", "contracts"], ["law", "caselaw"], ["law", "gdpr"], ["law", "compliance"],
      ["research", "knowledge"], ["research", "writing"], ["research", "caselaw"],
      ["ip", "gdpr"], ["agentic", "claude"], ["contracts", "gpt4"],
      ["compliance", "claude"], ["knowledge", "n8n"],
    ],
  },

  stack: [
    { group: "⚙ Automation", chips: ["Make", "Zapier", "n8n"] },
    { group: "🤖 AI & LLMs", chips: ["Claude (Anthropic)", "OpenAI GPT-4", "Groq (LLaMA 3.3 70B)", "Prompt Engineering", "Agentic AI"] },
    { group: "⚖ LegalTech", chips: ["Legal APIs", "Contract Analysis", "Judgment Monitoring", "Regulatory Tracking", "Client Intake Automation"] },
    { group: "🔍 Research & Knowledge", chips: ["Perplexity AI", "Notion", "Airtable", "Typeform", "Web Scraping"] },
    { group: "📊 Data & Docs", chips: ["Google Sheets", "Google Docs", "Google Drive", "PDF Tools"] },
    { group: "📱 Social Media", chips: ["LinkedIn", "Instagram", "X / Twitter", "Facebook", "Threads"] },
    { group: "💬 Communication", chips: ["Gmail", "WhatsApp", "Slack", "RSS"] },
  ],

  journey: [
    {
      year: "Foundation",
      title: "LL.B. (Hons.) — Amity Law School, Noida",
      desc: "Built a strong foundation in legal research, analysis, drafting, and regulatory interpretation. Specialised in Intellectual Property Rights and Technology Law.",
      icon: "🎓",
    },
    {
      year: "Research Focus",
      title: "AI Governance & Legal Research",
      desc: "Explored AI regulation, data protection, and emerging technology law. Conducted comparative analysis across global AI governance frameworks.",
      icon: "⚖️",
    },
    {
      year: "Innovation Phase",
      title: "Building AI-Powered Workflows",
      desc: "Started building automation systems that apply AI to legal and content work. Discovered the gap between legal expertise and operational efficiency.",
      icon: "🤖",
    },
    {
      year: "Now → 2026",
      title: "Law × AI × Automation",
      desc: "Working at the intersection of law, AI, and automation — helping professionals do more with less through intelligent, reliable workflows.",
      icon: "🚀",
    },
  ],

  philosophy: {
    quote: "The future belongs to professionals who can bridge law, technology, and business. My work explores how AI can improve research, knowledge management, and operational efficiency — while remaining mindful of the legal and ethical landscape it operates in.",
    note: "I don't just automate processes. I design systems that make legal professionals faster, better informed, and free to focus on what truly requires human judgment.",
  },

  whyMe: [
    { icon: "⚖️", title: "I Understand Law", desc: "Legal training means I understand your workflows, your compliance requirements, and why accuracy matters — not just speed." },
    { icon: "🤖", title: "I Understand AI", desc: "I build with Claude, GPT-4, and emerging AI tools — and I know where AI helps versus where it needs human oversight." },
    { icon: "🔬", title: "I Understand Research", desc: "I turn complex information into practical, actionable outputs. Research isn't just reading — it's structuring knowledge so it's actually useful." },
    { icon: "⚙️", title: "I Understand Systems", desc: "I design repeatable processes that keep working without you. Fast turnaround (3–7 days) with full testing before handoff." },
  ],

  // Focus areas doubling as the "research library" — real topics she works in,
  // not fabricated publications. Each maps to the case study it's demonstrated in.
  researchLibrary: [
    { title: "AI Regulation & Governance", tag: "AI", relatedProject: "regulatory-monitoring", desc: "Comparative analysis across the EU AI Act, and emerging Indian AI governance frameworks." },
    { title: "Data Protection — GDPR & DPDP", tag: "Law", relatedProject: "regulatory-monitoring", desc: "Cross-jurisdictional data protection compliance and monitoring." },
    { title: "Intellectual Property & Technology Law", tag: "IP", relatedProject: "contract-review", desc: "IP-focused specialisation from LL.B. (Hons.), applied to tech contracts and licensing." },
    { title: "AI-Assisted Contract Review", tag: "Automation", relatedProject: "contract-review", desc: "Structured, clause-level risk analysis using GPT-4." },
    { title: "Case Law & Judgment Monitoring", tag: "Research", relatedProject: "judgment-digest", desc: "Automated daily tracking and AI summarisation of new judgments." },
    { title: "Agentic Legal Research", tag: "AI", relatedProject: "research-assistant", desc: "Claude-driven multi-source legal synthesis with citation tracking." },
    { title: "Regulatory Compliance Monitoring", tag: "Law", relatedProject: "regulatory-monitoring", desc: "Real-time tracking of gazette notifications and regulatory portals." },
    { title: "Client Intake & Matter Operations", tag: "Automation", relatedProject: "client-intake", desc: "End-to-end intake automation reducing response time from days to minutes." },
  ],

  // Regions she's open to working with/remotely — reflects the real stated
  // "Open to Remote & Global Opportunities" claim, not a fabricated client list.
  openToRegions: [
    { name: "India", lat: 20.5937, lng: 78.9629, note: "Based here" },
    { name: "United States", lat: 39.8283, lng: -98.5795, note: "Open to remote" },
    { name: "United Kingdom", lat: 55.3781, lng: -3.4360, note: "Open to remote" },
    { name: "European Union", lat: 50.8503, lng: 4.3517, note: "Open to remote" },
    { name: "Singapore", lat: 1.3521, lng: 103.8198, note: "Open to remote" },
    { name: "UAE", lat: 23.4241, lng: 53.8478, note: "Open to remote" },
  ],

  contactInterests: [
    "Legal Research & AI Automation",
    "Contract Review Systems",
    "AI Governance & Compliance",
    "Social Media & Content Automation",
    "LegalTech Startup Collaboration",
    "Consulting & Advisory",
  ],

  commands: [
    { id: "resume", label: "Open Resume", hint: "Download CV", action: "resume" },
    { id: "projects", label: "View Projects", hint: "Jump to case studies", action: "scroll:#work" },
    { id: "linkedin", label: "Open LinkedIn", hint: "linkedin.com/in/jyoti-kumari", action: "linkedin" },
    { id: "research", label: "Open Research Library", hint: "Jump to research focus areas", action: "scroll:#research" },
    { id: "contact", label: "Contact", hint: "Jump to contact form", action: "scroll:#contact" },
    { id: "skills", label: "Open Skill Galaxy", hint: "Jump to skills", action: "scroll:#skills" },
    { id: "journey", label: "View Journey", hint: "Jump to timeline", action: "scroll:#journey" },
    { id: "top", label: "Back to Top", hint: "Scroll to hero", action: "scroll:#top" },
  ],
};
