# Skill: Business Strategy Agent

**Demonstrated in:** [GTM Agent](https://gtm-agent-tawny.vercel.app)  
**Role:** Takes raw market intelligence and turns it into a sharp, executable GTM strategy with specific targeting and channel recommendations.

---

## What This Agent Does

The Business Agent bridges research and execution. It receives the Data Agent's market intelligence and produces a concrete GTM strategy — who to sell to, what to say, and which channels to use.

### Input
Market intelligence output from the Data Agent (TAM, competitors, decision makers, key insights).

### Output Structure

| Section | What It Produces |
|---------|-----------------|
| **Primary Target** | Exact segment to pursue first — size, industry, geography, with rationale |
| **ICP** | One-sentence Ideal Customer Profile |
| **Buyer Persona** | Job title, pain points, decision triggers, buying process |
| **Channel Strategy** | 2-3 channels ranked by ROI with specific tactics |
| **Competitive Positioning** | Wedge against top competitors, value prop, objection handling |

### Sample Output

> **Primary Target:** Mid-market hospitals (200-500 beds) in the U.S. Midwest and Southeast currently running Cerner or Meditech. These are ripest for replacement — legacy contracts expiring, no affordable cloud option, compliance pressure mounting.
>
> **ICP:** A 200-500 bed hospital with a CTO who has been trying to migrate off a legacy EMR for 12+ months and faces a CMS compliance audit within 6 months.
>
> **Buyer Persona — "Stressed CTO":** Manages a lean IT team of 5-15. Pain: maintaining on-prem infrastructure, compliance audit anxiety, can't attract talent to work on legacy systems. Buys through: conference introductions → pilot → internal champion → budget approval. Decision trigger: next compliance audit date.
>
> **Channel Strategy:**
> 1. **LinkedIn InMail** (highest ROI) — Personalized outreach to CTOs with compliance angle. Specific message: "Your [Cerner/Meditech] support costs go up 18% at renewal. Here's what a cloud migration looks like in 90 days."
> 2. **HIMSS Conference** (March 2027) — Booth + speaking slot on "Migrating from legacy EMR without disrupting clinical workflows"
> 3. **Referral program** — $2K bounty for existing customers who refer a peer hospital CTO
>
> **Competitive Positioning:** Epic and Cerner own the enterprise. We own the mid-market migration. Our wedge: go live in 90 days vs. their 18-month implementations. One-sentence value prop: "Cloud EMR, live in 90 days, at 40% of your current maintenance cost." Objection: "We're not ready to migrate" → "Your compliance deadline is. Start with one department."

## Why This Matters

Market research without a strategy is trivia. This agent makes the leap from "here's what the market looks like" to "here's exactly who to call, what to say, and where to find them." It's the difference between a report and a plan.

## Integration

The Business Agent's output feeds into the **Project Management Agent**, which builds the week-by-week sprint plan. Business decides *what* to do and *why* — PM decides *when* and *with what resources*.
