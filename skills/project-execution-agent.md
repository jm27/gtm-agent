# Skill: Project Execution Agent

**Demonstrated in:** [GTM Agent](https://gtm-agent-tawny.vercel.app)  
**Role:** Converts a business strategy into a concrete, week-by-week sprint plan with budget, KPIs, and risk management — the plan a team can start on Monday.

---

## What This Agent Does

The PM Agent is the final link in the GTM chain. It receives the Business Agent's strategy and produces a detailed execution plan. No vague goals — specific activities, dollar amounts, and measurable targets.

### Input
Business strategy from the Business Agent (target segment, persona, channels, positioning).

### Output Structure

| Section | What It Produces |
|---------|-----------------|
| **6-Week Sprint Plan** | Week-by-week activities grouped into phases (Foundation → Outreach → Conversion) |
| **Resources & Budget** | Roles needed, tools, total budget with line items |
| **Success Metrics** | 3-5 KPIs with specific target numbers, go/no-go criteria |
| **Risk Register** | Top 3 risks with likelihood and mitigation |

### Sample Output

> **6-Week Sprint Plan:**
>
> *Week 1-2 — Foundation:*
> - Build target list: 500 CTOs at 200-500 bed hospitals (Sales Navigator + manual enrichment)
> - Set up CRM pipeline stages, email sequences, and tracking
> - Draft InMail templates (3 variants: compliance angle, cost angle, peer reference angle)
> - Identify 5 existing customers for referral program
> - Book HIMSS booth and speaking slot
>
> *Week 3-4 — Active Outreach:*
> - Send 500 personalized InMails (batches of 50/day, A/B test subject lines)
> - Follow-up calls to top 100 leads who opened but didn't reply
> - Begin referral outreach to existing customer base
> - Target: 15% InMail reply rate, 25 discovery calls booked
>
> *Week 5-6 — Conversion:*
> - Conduct discovery calls → qualify → schedule demos
> - Present pilot program (3 months free, 10 hospital slots)
> - Close first 5 pilot agreements
> - Review pipeline health, adjust messaging based on response data
> - Target: 5 pilots signed, $120K pipeline for Q2
>
> **Resources & Budget:**
> - 1 SDR (contractor, $6K/month)
> - LinkedIn Sales Navigator ($100/month)
> - HIMSS booth + travel ($3,500)
> - Referral payouts ($2K per signed pilot, budget $10K)
> - **Total 6-week budget: $22,500**
>
> **Success Metrics:**
> - InMail reply rate: ≥15%
> - Discovery calls: 25 booked
> - Pilots signed: 5
> - Pipeline value: $120K ARR opportunity
> - Go/no-go after Week 4: if <10 discovery calls, pause and rework messaging
>
> **Risk Register:**
> 1. **Low InMail response** (Likely) — Mitigation: have 3 message variants running from day 1; if week 3 rate is <10%, switch to phone outreach
> 2. **Compliance deadline passes** (Moderate) — Mitigation: prioritize leads by audit date in CRM; flag hospitals within 6 months
> 3. **Competitor undercuts on price** (Low) — Mitigation: lead with speed-to-live and TCO, not monthly subscription; pilot model eliminates price objection for first 3 months

## Why This Matters

Strategies die in execution. A brilliant GTM plan with no timeline, no budget, and no KPIs is a wish list. This agent forces specificity — every activity has a week, every dollar has a line item, every target has a number. It turns "we should target hospitals" into "500 CTOs contacted by Friday, 25 calls booked by week 4, 5 pilots by week 6."

## Integration

The PM Agent's output feeds into the **Orchestrator**, which synthesizes all three agent outputs into an executive summary. The CEO sees: opportunity (Data) → strategy (Business) → plan (PM) → one tight paragraph.
