/**
 * Gmail Query Builder for NeatHunt
 *
 * Philosophy: Filter as much as possible at query time.
 * Gmail API constraints: flat operators, no nested syntax, negations apply globally.
 *
 * Payoff: Small dataset to parse → faster pipeline, fewer false positives.
 *
 * Dependencies: Uses QUERY constants from ./constants.ts
 */

 import { QUERY, STAGES } from "../constants/gmailFilters.js";

// ============================================================================
// QUERY BUILDERS
// ============================================================================

/**
 * buildInitialSyncQuery()
 *
 * For first-time sync: fetch last 30 days of job-related emails.
 * Strategy: Cast a wide net (all platforms + recruiting prefixes), then exclude noise.
 *
 * Result: Medium-sized payload, high signal.
 */
export function buildInitialSyncQuery(): string {
  // POSITIVE: All job platforms
  const platformClauses = QUERY.platforms
    .map(domain => `from:${domain}`)
    .join(" OR ");

  // POSITIVE: Subdomains (specific job portals)
  const subdomainClauses = QUERY.subdomains
    .map(domain => `from:${domain}`)
    .join(" OR ");

  // POSITIVE: Exact senders (specific high-value emails)
  const exactClauses = QUERY.exactSenders
    .map(email => `from:${email}`)
    .join(" OR ");

  // POSITIVE: Recruiting prefixes (catch company recruiting emails)
  const prefixClauses = QUERY.recruitingPrefixes
    .map(prefix => `from:${prefix}`)
    .join(" OR ");

  // POSITIVE: Scheduling platforms (interview scheduling is high-value)
  const schedulingClauses = QUERY.schedulingPlatforms
    .map(domain => `from:${domain}`)
    .join(" OR ");

  // NEGATIVE: Exact senders (high-confidence noise)
  const negativeExact = QUERY.negativeExact
    .map(email => `-from:${email}`)
    .join(" ");

  // NEGATIVE: Domain patterns (entire subdomains of noise)
  const negativeDomains = QUERY.negativeDomains
    .map(domain => `-from:${domain}`)
    .join(" ");

  // NEGATIVE: Subject keywords (filter out spam/marketing)
  const negativeSubjects = QUERY.negativeSubjects
    .map(kw => `-subject:"${kw}"`)
    .join(" OR ");

  const appliedSubjects = STAGES.applied
    .map(kw => `subject:"${kw}"`)
    .join(" OR ");

  const interviewSubjects = STAGES.interview
    .map(kw => `subject:"${kw}"`)
    .join(" OR ");

  const assessmentSubjects = STAGES.assessment
    .map(kw => `subject:"${kw}"`)
    .join(" OR ");

  const rejectedSubjects = STAGES.rejected
    .map(kw => `subject:"${kw}"`)
    .join(" OR ");

  const offerSubjects = STAGES.offer
    .map(kw => `subject:"${kw}"`)
    .join(" OR ");

    // newer_than:30d
  return `
    category:primary
    (${platformClauses} OR ${subdomainClauses} OR ${exactClauses} OR ${prefixClauses} OR ${schedulingClauses} OR ${appliedSubjects} OR ${interviewSubjects} OR ${assessmentSubjects} OR ${rejectedSubjects} OR ${offerSubjects})
    ${negativeExact}
    ${negativeDomains}
    ${negativeSubjects}
  `
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(" ");
}

/**
 * buildNightlySyncQuery()
 *
 * For recurring nightly syncs: fetch today's emails only.
 * Strategy: Same filtering, but time-bound to last 24 hours.
 *
 * Cost: Minimal (most days have 0-3 new job emails).
 */
export function buildNightlySyncQuery(): string {
  const today = new Date().toISOString().split("T")[0]; // "2026-07-18"

  // POSITIVE: All job platforms
  const platformClauses = QUERY.platforms
    .map(domain => `from:${domain}`)
    .join(" OR ");

  // POSITIVE: Subdomains
  const subdomainClauses = QUERY.subdomains
    .map(domain => `from:${domain}`)
    .join(" OR ");

  // POSITIVE: Exact senders
  const exactClauses = QUERY.exactSenders
    .map(email => `from:${email}`)
    .join(" OR ");

  // POSITIVE: Recruiting prefixes
  const prefixClauses = QUERY.recruitingPrefixes
    .map(prefix => `from:${prefix}`)
    .join(" OR ");

  // POSITIVE: Scheduling platforms
  const schedulingClauses = QUERY.schedulingPlatforms
    .map(domain => `from:${domain}`)
    .join(" OR ");

  // NEGATIVE clauses (same as initial)
  const negativeExact = QUERY.negativeExact
    .map(email => `-from:${email}`)
    .join(" ");

  const negativeDomains = QUERY.negativeDomains
    .map(domain => `-from:${domain}`)
    .join(" ");

  const negativeSubjects = QUERY.negativeSubjects
    .map(kw => `-subject:"${kw}"`)
    .join(" ");


  return `
    category:primary
    after:${today}
    (${platformClauses} OR ${subdomainClauses} OR ${exactClauses} OR ${prefixClauses} OR ${schedulingClauses})
    ${negativeExact}
    ${negativeDomains}
    ${negativeSubjects}
  `
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(" ");
}

/**
 * buildResyncQuery()
 *
 * For when historyId expires (>24hrs without sync).
 * Falls back to full refetch from N days ago.
 *
 * Args:
 *   daysBack: How many days to look back (default 5 for safety buffer)
 */
export function buildResyncQuery(daysBack: number = 5): string {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  const dateStr = cutoffDate.toISOString().split("T")[0];

  // POSITIVE clauses (same as initial)
  const platformClauses = QUERY.platforms
    .map(domain => `from:${domain}`)
    .join(" OR ");

  const subdomainClauses = QUERY.subdomains
    .map(domain => `from:${domain}`)
    .join(" OR ");

  const exactClauses = QUERY.exactSenders
    .map(email => `from:${email}`)
    .join(" OR ");

  const prefixClauses = QUERY.recruitingPrefixes
    .map(prefix => `from:${prefix}`)
    .join(" OR ");

  const schedulingClauses = QUERY.schedulingPlatforms
    .map(domain => `from:${domain}`)
    .join(" OR ");

  // NEGATIVE clauses (same as initial)
  const negativeExact = QUERY.negativeExact
    .map(email => `-from:${email}`)
    .join(" ");

  const negativeDomains = QUERY.negativeDomains
    .map(domain => `-from:${domain}`)
    .join(" ");

  const negativeSubjects = QUERY.negativeSubjects
    .map(kw => `-subject:"${kw}"`)
    .join(" ");



  return `
    category:primary
    after:${dateStr}
    (${platformClauses} OR ${subdomainClauses} OR ${exactClauses} OR ${prefixClauses} OR ${schedulingClauses})
    ${negativeExact}
    ${negativeDomains}
    ${negativeSubjects}
  `
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(" ");
}

// ============================================================================
// EXAMPLE QUERIES (for debugging)
// ============================================================================

/**
 * Log example queries to understand what Gmail will receive.
 * Use this to verify syntax before deploying.
 */
export function logExampleQueries() {
  console.log("=== INITIAL SYNC QUERY ===");
  console.log(buildInitialSyncQuery());
  console.log("\n=== NIGHTLY SYNC QUERY ===");
  console.log(buildNightlySyncQuery());
  console.log("\n=== RESYNC QUERY (5 days back) ===");
  console.log(buildResyncQuery(5));
}

// ============================================================================
// FUTURE: THREAD CAVEAT (defer for now)
// ============================================================================

/**
 * ⚠️ IMPORTANT: Gmail returns conversations (threads), not individual messages.
 *
 * Issue: If a conversation has one excluded message (e.g., alert@naukri.com)
 * and one matching message (e.g., recruiter@naukri.com), Gmail returns the ENTIRE thread.
 *
 * Mitigation (for parsing layer, not here):
 * 1. Fetch threads, then filter messages individually by sender/subject
 * 2. Keep track of processed message IDs to avoid reprocessing
 * 3. For message-level parsing, apply sender/subject filters again
 *
 * This is deferred until we see it cause problems in practice.
 */
