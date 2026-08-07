export interface AgentOutput {
  agent: "data" | "business" | "pm" | "orchestrator";
  content: string;
  metrics?: string[];
}

export interface Scenario {
  id: string;
  icon: string;
  title: string;
  description: string;
  outputs: AgentOutput[];
  summary: string;
}

export const scenarios: Scenario[] = [
  {
    id: "healthcare",
    icon: "🏥",
    title: "Healthcare SaaS — Lead Gen",
    description: "Find B2B leads for a patient management platform in the U.S. hospital market",
    outputs: [
      {
        agent: "data",
        content: `Market Intelligence:

TAM for U.S. hospital management software: $12.4B (2026)
Growth rate: 14.2% YoY, driven by EHR modernization mandates

Top competitors:
• Epic Systems — 36% market share, enterprise focus
• Cerner/Oracle — 24%, strong VA/DoD presence
• Athenahealth — 12%, ambulatory/cloud-first
• Meditech — 8%, community hospitals

Decision makers identified: 1,247 CTOs, CIOs, and IT Directors at 200-500 bed hospitals in the Midwest and Southeast regions.`,
        metrics: ["1,247 leads", "$12.4B TAM", "14% growth"],
      },
      {
        agent: "business",
        content: `Strategic Recommendation:

Primary Target: Mid-market hospitals (200-500 beds) currently running Cerner or Meditech — these are the ripest for replacement.

Buyer Persona — "Stressed CTO":
• Pain: Compliance deadlines (HIPAA, CMS), legacy system maintenance costs
• Motivation: Reduce IT spend while improving patient data access
• Decision trigger: Next compliance audit in 6-12 months

Channel Strategy:
1. LinkedIn InMail → CTOs at target hospitals (personalized compliance angle)
2. HIMSS Conference booth → in-person demos (March 2027)
3. Case study: "How [Hospital X] saved $400K/yr switching from Cerner"`,
      },
      {
        agent: "pm",
        content: `Execution Plan — 6 Week Sprint:

Week 1-2: Build target list
• Scrape LinkedIn Sales Navigator for 500 CTOs/CIOs
• Enrich with hospital bed count, current EMR, compliance deadlines
• Segment into 3 tiers (hot/warm/cold)

Week 3-4: Outreach campaign
• 500 personalized InMails (compliance pain angle)
• 200 follow-up calls to top 100 leads
• Target: 15% reply rate, 25 discovery calls booked

Week 5-6: Pilot program
• Offer 3-month free pilot to 10 hospitals
• Success metric: 5 pilots converted to paid
• KPI: CAC < $2,000, LTV > $24,000

Budget: $8,500 (Sales Navigator + InMail credits + conference booth)`,
      },
    ],
    summary: "Ready to execute: 1,247 qualified leads, 6-week sprint plan, $8.5K budget. Expected pipeline: 25 discovery calls → 5 pilots → $120K ARR.",
  },
  {
    id: "expansion",
    icon: "📈",
    title: "Market Expansion — New Regions",
    description: "Identify untapped regional markets for a B2B SaaS company expanding from the U.S.",
    outputs: [
      {
        agent: "data",
        content: `Regional Market Analysis:

Top 3 untapped regions by SaaS readiness:

1. DACH (Germany, Austria, Switzerland)
   • SaaS spend: €32B (2026), growing 18% YoY
   • English proficiency: 63% — localization recommended
   • Key cities: Berlin, Munich, Vienna

2. ANZ (Australia, New Zealand)
   • SaaS spend: AUD $18B, mature market
   • 92% English proficiency — no localization needed
   • Key cities: Sydney, Melbourne, Auckland

3. Nordics (Sweden, Denmark, Norway, Finland)
   • SaaS spend: €15B, highest per-capita in Europe
   • 86% English proficiency
   • Key cities: Stockholm, Copenhagen, Oslo

Risk factors: GDPR compliance (DACH/Nordics), currency fluctuation, local competitor presence in each region.`,
        metrics: ["3 regions", "€65B combined TAM", "18% growth"],
      },
      {
        agent: "business",
        content: `Go-to-Region Strategy:

Recommended Sequence: ANZ first (lowest friction — English, similar legal system, no localization).

Phase 1 — ANZ (Months 1-3):
• Hire 1 Sydney-based AE ($120K AUD base + commission)
• Partner with 2 local system integrators
• Attend AWS Summit Sydney (April 2027) for launch

Phase 2 — DACH (Months 4-8):
• Localize product UI + docs to German (€25K budget)
• Hire 1 Berlin-based AE + 1 SDR
• Target: 15 mid-market accounts by month 8

Phase 3 — Nordics (Months 9-12):
• Leverage DACH team for Nordic outreach
• Partner with Nordic SaaS community events
• Target: 10 enterprise accounts by month 12

Total 12-month investment: €180K. Projected ARR: €450K.`,
      },
      {
        agent: "pm",
        content: `12-Month Expansion Roadmap:

Q1: ANZ Launch
• Hire Sydney AE (priority #1 — start recruiting now)
• Legal: review AU/NZ data residency requirements
• Marketing: localize website, case studies
• Sales: build 200-account target list (100 AU, 100 NZ)
• Milestone: 5 paying customers by end of Q1

Q2: ANZ Scale + DACH Prep
• Hire Berlin AE (start month 4)
• Begin DE localization (UI, docs, website)
• GDPR compliance audit
• Milestone: 15 ANZ customers, DACH pipeline of 50 accounts

Q3: DACH Launch + Nordic Prep
• Munich launch event (September 2027)
• Hire SDR for DACH region
• Begin Nordic market research
• Milestone: 5 DACH customers, Nordic target list built

Q4: Scale all regions
• Full team: 2 AEs, 1 SDR across 3 regions
• Review and optimize channel mix per region
• Milestone: 30 total customers, €450K ARR`,
      },
    ],
    summary: "12-month expansion roadmap: ANZ → DACH → Nordics. €180K investment for €450K projected ARR. 3 regions, 30 customers, 1 new hire per quarter.",
  },
  {
    id: "retention",
    icon: "🛡️",
    title: "Customer Retention — Churn Analysis",
    description: "Identify at-risk accounts and build a retention playbook for a SaaS with 85% NRR",
    outputs: [
      {
        agent: "data",
        content: `Churn Risk Analysis:

Current NRR: 85% (target: 110%)
Churn rate: 4.2% monthly (50% above industry benchmark)

Risk segmentation (2,400 accounts analyzed):

🔴 High Risk (340 accounts, 14%)
• No login in 30+ days
• Support tickets trending up 3x
• Feature adoption < 3 of 12 core features
• MRR at risk: $680K

🟡 Medium Risk (720 accounts, 30%)
• Weekly usage declining 2 weeks in a row
• NPS score 6-7 (passive)
• No admin user active in 14 days
• MRR at risk: $1.1M

🟢 Healthy (1,340 accounts, 56%)
• Regular usage, NPS 8+
• Multiple admin users active weekly

Key churn trigger: Poor onboarding — 62% of churned accounts never completed setup.`,
        metrics: ["15% churn risk", "340 at-risk", "$680K MRR at risk"],
      },
      {
        agent: "business",
        content: `Retention Strategy:

Immediate (this week):
• Trigger automated "We miss you" email to 340 high-risk accounts
• Assign CSM to top 50 accounts by MRR for personal outreach
• Launch in-app "Need help?" widget with live chat

Short-term (30 days):
• Redesign onboarding flow — guided setup wizard, reduce time-to-value from 14 days to 3 days
• Create 5 "quick win" video tutorials (2 min each)
• Implement health score dashboard for CS team (daily refresh)

Long-term (90 days):
• Build customer advisory board (12 power users)
• Launch quarterly business review (QBR) program for enterprise accounts
• Product: add usage analytics + automated recommendations

Target: improve NRR from 85% → 105% within 6 months.
Retained MRR impact: $1.2M annually.`,
      },
      {
        agent: "pm",
        content: `90-Day Retention Sprint:

Week 1-2: Emergency Response
• Deploy churn alert system (Slack + email for CS team)
• CSMs personally contact top 50 at-risk accounts
• Launch in-app help widget
• Milestone: 50% of high-risk accounts re-engaged

Week 3-4: Onboarding Fix
• Ship guided setup wizard (3 steps → live in 10 min)
• Record 5 video tutorials (product, integrations, reporting, etc.)
• Email all new signups with wizard link
• Milestone: Onboarding completion rate 40% → 75%

Week 5-8: Health Score & QBR
• Build health score dashboard (login recency, feature adoption, NPS, support volume)
• Run first 20 QBRs with enterprise accounts
• Identify upsell opportunities in healthy cohort
• Milestone: Health score live for all accounts

Week 9-12: Scale & Automate
• Automated re-engagement sequences for medium-risk accounts
• Customer advisory board: first meeting, gather roadmap input
• Review: measure NRR improvement, adjust playbook
• Milestone: NRR 85% → 95% (on track to 105%)`,
      },
    ],
    summary: "90-day retention sprint: save $680K at-risk MRR, fix onboarding (62% churn root cause), target 105% NRR within 6 months. $1.2M annual revenue impact.",
  },
];

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find(s => s.id === id);
}
