# Skill: Market Intelligence Agent

**Demonstrated in:** [GTM Agent](https://gtm-agent-tawny.vercel.app)  
**Role:** Deep research agent that gathers and synthesizes market data before any strategy work begins.

---

## What This Agent Does

Before you build a go-to-market plan, you need to know the battlefield. The Data Agent is a specialized market research agent that analyzes any B2B scenario and returns structured intelligence.

### Input
Any GTM scenario — a product description, a target industry, or a specific market question.

```
"I need to find B2B leads for a patient management SaaS 
targeting mid-size U.S. hospitals."
```

### Output Structure

| Section | What It Produces |
|---------|-----------------|
| **Market Overview** | TAM estimate with growth rate, key trends driving the market |
| **Competitive Landscape** | Top 3-5 competitors with market share and positioning |
| **Target Decision Makers** | Count, job titles, where they spend time (conferences, communities) |
| **Key Insights** | 2-3 actionable takeaways for the next agent |

### Sample Output

> **Market Overview:** Hospital management software TAM is $12.4B (2026), growing 14.2% YoY, driven by EHR modernization mandates and CMS compliance deadlines. Key trends: cloud migration, AI-assisted clinical workflows, interoperability requirements.
>
> **Competitive Landscape:** Epic Systems (36% — enterprise, on-prem legacy), Cerner/Oracle (24% — VA/DoD stronghold, slow cloud transition), Athenahealth (12% — cloud-first, ambulatory focus), Meditech (8% — community hospitals). White space: mid-market hospitals (200-500 beds) stuck on legacy systems with no affordable cloud option.
>
> **Decision Makers:** 1,247 CTOs, CIOs, and IT Directors at 200-500 bed hospitals in the Midwest and Southeast. They attend HIMSS (March), CHIME (October), and read Becker's Hospital Review.
>
> **Key Insights:** (1) Compliance deadlines are the #1 purchase trigger — target hospitals 6 months before audit. (2) "Rip and replace" fatigue is real — lead with interoperability, not migration. (3) Reference customers in the same bed-count tier are 3x more convincing than enterprise logos.

## Why This Matters

Most GTM strategies start with opinions. This agent starts with data. Before anyone builds a persona or plans a campaign, the Data Agent answers: *how big is the opportunity, who already owns it, and where is the gap?*

## Integration

The Data Agent's output feeds directly into the **Business Strategy Agent**. The two are chained — data quality determines strategy quality. If the Data Agent misses a competitor or understates TAM, the entire downstream plan is compromised.
