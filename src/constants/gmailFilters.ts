import { getFormattedDate } from "../utils/helper.js";

/**
 * NeatHunt Gmail Constants
 *
 * Organized by layer:
 * 1. QUERY LAYER: Used to filter emails before parsing (reduce payload)
 * 2. PARSING LAYER: Used to classify emails into pipeline stages
 * 3. DISPLAY/CONFIG: Used in UI or general configuration
 *
 * Each layer is independent — query layer doesn't depend on parsing layer.
 */

// ============================================================================
// LAYER 1: QUERY LAYER (Gmail API filtering — keep payload small)
// ============================================================================

/**
 * Positive senders: platforms and addresses to INCLUDE
 * Used in buildInitialSyncQuery(), buildNightlySyncQuery(), etc.
 */
export const QUERY = {
  // Exact full email addresses (highest precision)
  exactSenders: [
    "jobs-noreply@linkedin.com",
    // Add more as discovered
  ],

  // Job platforms (broad domain match)
  // Gmail will match emails from ANY address @platform.com
  platforms: [
    "linkedin.com",
    "indeed.com",
    "naukri.com",
    "wellfound.com", // formerly angel.co
    "greenhouse.io",
    "lever.co",
    "ashbyhq.com",
    "workday.com",
    "smartrecruiters.com",
    "jobvite.com",
    "icims.com",
    "bamboohr.com",
    "recruitee.com",
    "workablemail.com",
    "hirist.tech",
  ],

  // Subdomains: specific corners of platforms with real job actions
  // (not all subdomains—just the ones that matter for syncing)
  subdomains: [
    "hire.lever.co", // Lever's applicant portal
    "boards.greenhouse.io", // Greenhouse job boards
    "app.greenhouse.io", // Greenhouse app portal
    "talent.icims.com", // iCIMS talent portal
    "jobs.lever.co", // Lever job portal
  ],

  // Company recruiting addresses: catch emails from companies themselves
  // Gmail will match emails like careers@company.com, jobs@company.com, etc.
  recruitingPrefixes: [
    "careers@",
    "jobs@",
    "talent@",
    "recruiting@",
    "hiring@",
    "hr@",
  ],

  // Scheduling platforms: include because interview scheduling emails are high-value
  schedulingPlatforms: [
    "calendly.com",
    "goodtime.io",
    "hirevue.com",
    "coderpad.io",
    "codesignal.com",
    "karat.io",
    "hackerrank.com",
    "codility.com",
  ],

  // Negative senders: exclude (high-confidence noise)
  negativeExact: [
    "naukrialerts@naukri.com", // Daily digest
    "donotreply@jobalert.indeed.com", // Job alerts
    "recommendations@naukri.com", // "Jobs matching your profile"
    "newsletter@linkedin.com", // LinkedIn newsletter
    "newsletters-noreply@linkedin.com", // LinkedIn newsletter
    "messaging-digest-noreply@linkedin.com", // LinkedIn messagin
    "jobs-promo@linkedin.com", // LinkedIn promo jobs
    "noreply@linkedin.com", // LinkedIn general noreply (catch-all for noise)
    "service@naukri.com", //Naukri daily updates
    "jobmessenger@monsterindia.com", // foundit and monster reccs
    "opportunities@foundit.in", //foundit followup and cv downloaded messages
    "donotreply@match.indeed.com>", //Indeed matches
    "alerts@jobs.shine.com", //shine alerts and reccs
  ],

  // Negative domain patterns: exclude entire subdomains
  negativeDomains: [
    "alert.naukri.com",
    "digest.naukri.com",
    "promo.indeed.com",
    "email.linkedin.com", // LinkedIn marketing
    "otp.workday.com", //workday
  ],

  // Negative subjects: exclude by keyword
  negativeSubjects: [
    "digest",
    "weekly summary",
    "job recommendations",
    "new jobs matching",
    "unsubscribe",
    "newsletter",
    "promotion",
    "webinar",
    "course",
    "bootcamp",
    "sale",
    "discount",
    "match",
    "matching jobs based on your preferences",
    "you're invited to apply",
    "discover roles that match your interests",
    "podcast",
    "tips",
    "article",
    "blog",
    "how to",
    "event",
    "guide",
  ],
};

// ============================================================================
// LAYER 2: PARSING LAYER (Email classification — detect pipeline stages)
// ============================================================================

/**
 * Stage keywords: used by the parser to classify emails into pipeline stages
 * NOT used in Gmail queries — these are for string matching on email content.
 *
 * Stages: applied → recruiter → interview → assessment → offer/rejected
 */
export const STAGES = {
  /**
   * Applied: confirmation that an application was submitted
   * Signals: "thank you for applying", "we received your application", etc.
   */
  applied: [
    "application received",
    "thank you for applying",
    "we received your application",
    "application confirmation",
    "thanks for applying",
    "application submitted",
    "your application for",
    "we have received your application",
    "your application has been received",
    "application",
  ],

  /**
   * Recruiter: outreach from a recruiter or company (unsolicited interest)
   * Signals: "we came across your profile", "interested in learning more", etc.
   */
  recruiter: [
    "we came across your profile",
    "your background caught our attention",
    "we think you'd be a great fit",
    "interested in learning more about you",
    "exciting opportunity",
    "would love to connect",
    "let's schedule a call",
    "quick chat about opportunity",
    "open role",
  ],

  /**
   * Interview: invitation to interview or scheduling confirmation
   * Signals: "interview", "schedule an interview", "your interview", etc.
   */
  interview: [
    "interview",
    "interview invitation",
    "schedule an interview",
    "schedule your interview",
    "book your interview",
    "interview availability",
    "next steps interview",
    "technical interview",
    "onsite interview",
    "virtual interview",
    "final interview",
    "panel interview",
  ],

  /**
   * Assessment: coding challenge, take-home, or technical evaluation
   * Signals: "coding challenge", "technical assessment", "take home", etc.
   */
  assessment: [
    "coding challenge",
    "technical assessment",
    "online assessment",
    "coding test",
    "take home assignment",
    "take home challenge",
    "hackerrank test",
    "codility test",
    "codesignal assessment",
    "technical challenge",
  ],

  /**
   * Rejected: explicit rejection or decision to not move forward
   * Signals: "we regret to inform you", "not moving forward", etc.
   */
  rejected: [
    "we regret to inform you",
    "unfortunately",
    "we will not be moving forward",
    "not moving forward",
    "we have decided to pursue other candidates",
    "after careful consideration",
    "position has been filled",
    "another candidate",
  ],

  /**
   * Offer: job offer letter or employment offer
   * Signals: "job offer", "offer letter", "we are pleased to offer", etc.
   */
  offer: [
    "job offer",
    "offer letter",
    "we are pleased to offer",
    "offer of employment",
    "compensation package",
    "formal offer",
    "employment offer",
  ],
};

// ============================================================================
// LAYER 3: DISPLAY/CONFIG (UI and other purposes)
// ============================================================================

/**
 * Pipeline stages: for UI display and data structure
 * Used to define the job application pipeline states.
 */
export const PIPELINE_STAGES = {
  applied: "applied",
  recruiter: "recruiter",
  interview: "interview",
  assessment: "assessment",
  rejected: "rejected",
  offer: "offer",
} as const;

export type PipelineStage =
  (typeof PIPELINE_STAGES)[keyof typeof PIPELINE_STAGES];

// export const JOB_PLATFORM_SENDERS = [
//     "linkedin.com",
//     "indeed.com",
//     "naukri.com",
//     "wellfound.com",       // angel.co
//     "greenhouse.io",
//     "lever.co",
//     "ashbyhq.com",
//     "workday.com",
//     "smartrecruiters.com",
//     "jobvite.com",
//     "icims.com",
//     "bamboohr.com",
//     "myworkdayjobs.com",
//     "recruitee.com",
//     "workablemail.com",
//     "hire.lever.co",
//     "boards.greenhouse.io",
//     "app.greenhouse.io",
//     "talent.icims.com",
//     "jobs.lever.co"
// ]
// export const EXACT_JOB_SENDERS = [
//     "jobs-noreply@linkedin.com"
// ]
// export const APPLICATION_CONFIRMATION = [
//     "application received",
//     "thank you for applying",
//     "we received your application",
//     "application confirmation",
//     "thanks for applying",
//     "application submitted",
//     "your application for",
//     "we have received your application",
//     "your application has been received"
// ]
// export const RECRUITER_OUTREACH = [
//     "we came across your profile",
//     "your background caught our attention",
//     "we think you'd be a great fit",
//     "interested in learning more about you",
//     "exciting opportunity",
//     "looking for a frontend engineer",
//     "would love to connect",
//     "let's schedule a call",
//     "quick chat about opportunity",
//     "open role"
// ]
// export const INTERVIEW_INVITES = [
//     "interview",
//     "interview invitation",
//     "schedule an interview",
//     "schedule your interview",
//     "book your interview",
//     "interview availability",
//     "next steps interview",
//     "technical interview",
//     "onsite interview",
//     "virtual interview",
//     "final interview",
//     "panel interview"
// ]
// export const SCHEDULING_PLATFORMS = [
//     "calendly.com",
//     "goodtime.io",
//     "hirevue.com",
//     "coderpad.io",
//     "codesignal.com",
//     "karat.io",
//     "hackerrank.com",
//     "codility.com"
// ]
// export const ASSESSMENT_KEYWORDS = [
//     "coding challenge",
//     "technical assessment",
//     "online assessment",
//     "coding test",
//     "take home assignment",
//     "take home challenge",
//     "hackerRank test",
//     "codility test",
//     "codesignal assessment",
//     "technical challenge"
// ]
// export const REJECTION_KEYWORDS = [
//     "we regret to inform you",
//     "unfortunately",
//     "we will not be moving forward",
//     "not moving forward",
//     "we have decided to pursue other candidates",
//     "after careful consideration",
//     "position has been filled",
//     "another candidate"
// ]
// export const OFFER_KEYWORDS = [
//     "job offer",
//     "offer letter",
//     "we are pleased to offer",
//     "offer of employment",
//     "compensation package",
//     "formal offer",
//     "employment offer"
// ]
// export const NEGATIVE_KEYWORDS = [
//     "unsubscribe",
//     "newsletter",
//     "promotion",
//     "marketing",
//     "event",
//     "webinar",
//     "course",
//     "bootcamp",
//     "sale",
//     "discount"
// ]

// export const NEGATIVE_SENDERS = [
//   "naukrialerts@naukri.com"
// ]
// export const COMPANY_RECRUITING_PREFIXES = [
//     "careers@",
//     "jobs@",
//     "talent@",
//     "recruiting@",
//     "hr@"
// ]

// export const gmailFilters = {
//     jobSenders: JOB_PLATFORM_SENDERS,
//     exactSenders: EXACT_JOB_SENDERS,
//     schedulingPlatforms: SCHEDULING_PLATFORMS,
//     recruitingPrefixes: COMPANY_RECRUITING_PREFIXES,
//     negativeKeywords: NEGATIVE_KEYWORDS
// }

// export const stageKeywords = {
//     applied: APPLICATION_CONFIRMATION,
//     recruiter: RECRUITER_OUTREACH,
//     interview: INTERVIEW_INVITES,
//     assessment: ASSESSMENT_KEYWORDS,
//     rejected: REJECTION_KEYWORDS,
//     offer: OFFER_KEYWORDS
// }

// export const gmailQuery = `
// category:primary newer_than:30d (
//   from:linkedin.com OR
//   from:indeed.com OR
//   from:naukri.com OR
//   from:greenhouse.io OR
//   from:lever.co OR
//   from:ashbyhq.com OR
//   from:workday.com OR
//   from:smartrecruiters.com OR
//   from:jobvite.com OR
//   from:icims.com OR
//   from:no-reply@ OR
//   from:noreply@ OR
//   from:careers@ OR
//   from:jobs@ OR
//   from:recruiting@ OR
//   from:talent@ OR
//   from:hire@ OR
//   subject:(interview OR application OR applied OR assessment OR recruiter OR submitting OR "next steps" OR "coding challenge")
// )
// `;

// export const gmailQuery_v2 = `
// (category:{primary updates})
// newer_than:30d

// from:{linkedin.com indeed.com naukri.com greenhouse.io lever.co ashbyhq.com workday.com smartrecruiters.com jobvite.com icims.com workablemail.com}

// OR from:{no-reply@ noreply@ recruiting@ recruiter@ talent@ careers@ jobs@ hiring@}

// (subject:{interview application applied opportunity recruiter position role assessment})

// OR "thank you for applying"
// OR "we received your application"
// OR "schedule an interview"
// `

// export const gmailQuery_v3 = `(category:{primary updates})
// newer_than:30d

// (
//   from:{linkedin.com indeed.com naukri.com}
//   OR
//   from:{recruiting@ recruiter@ careers@ jobs@ hiring@ talent@}
//   OR
//   greenhouse.io
//   OR
//   lever.co
//   OR
//   ashbyhq.com
//   OR
//   smartrecruiters.com
//   OR
//   jobvite.com
//   OR
//   icims.com
//   OR
//   myworkdayjobs.com
//   OR
//   workablemail.com
// )

// (
//   subject:{interview application applied assessment recruiter role position}
//   OR
//   "thank you for applying"
//   OR
//   "application received"
//   OR
//   "next steps"
//   OR
//   "schedule an interview"
// )`

// //q: gmailQuery.replace(/\s+/g, " ").trim()
