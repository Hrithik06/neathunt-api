// import { getOAuthClient } from "../config/googleOAuth.js";
// import { gmail } from "@googleapis/gmail";
// import { normalizeMetadataMessage } from "../utils/gmail.utils.js";
// import { GmailClient, GmailMessage } from "../types/gmail.js";
// import { gmailQuery } from "../constants/gmailFilters.js";
import { getFormattedDate, isDefined, isFulfilled } from "../utils/helper.js";
// import { GaxiosResponse } from "gaxios";
// export async function exchangeCodeForTokens(code: string) {
//   const oauth2Client = getOAuthClient();
//   const { tokens } = await oauth2Client.getToken(code);
//   return tokens;
// }

// // Use the actual type from googleapis
// // import type { Credentials } from "google-auth-library";
// // export async function getGrantedScopes(tokens: Credentials): Promise<string[]>
// //   return tokens.scope?.split(" ") ?? [];
// // }

// export async function listMessageIds(gmailClient: GmailClient, maxResults = 500) {
//   try {
//     //get first 10 message ids
//     const today = new Date();
//     const priorDate = new Date(new Date().setDate(today.getDate() - 30));

//     const formattedAfterDate = getFormattedDate(priorDate);
//     console.log(today);
//     console.log(priorDate);
//     console.log(formattedAfterDate);
//     const messageListResponse = await gmailClient.users.messages.list({
//       userId: "me",
//       maxResults: maxResults,
//       // q: gmailQuery.replace(/[\r\n]+/gm, "")
//       // q: `after:${formattedAfterDate}`
//       q: `after:2026/02/07`,
//     });

//     return messageListResponse;
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error("listMessageIds Error:", error.message);
//     } else {
//       console.error("listMessageIds Error:", error);
//     }
//     return null;
//   }
// }
// async function fetchMessageById(
//   id: string,
//   gmailClient: GmailClient,
//   format: "metadata" | "full",
// ): Promise<GmailMessage | null> {
//   try {
//     const messageResponse = await gmailClient.users.messages.get({
//       id,
//       userId: "me",
//       format,
//       metadataHeaders: ["Date", "Subject", "From", "Reply-To"],
//     });
//     return messageResponse.data;
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error(`fetchMessageById (${format}) Error:`, error.message);
//     } else {
//       console.error(`fetchMessageById (${format}) Error:`, error);
//     }
//     return null;
//   }
// }

// export async function fetchMetadataMessageById(
//   id: string | null | undefined,
//   gmailClient: GmailClient,
// ): Promise<GmailMessage | null> {
//   if (!id) return null;

//   return fetchMessageById(id, gmailClient, "metadata");
// }

// export async function fetchFullMessageById(
//   id: string | null | undefined,
//   gmailClient: GmailClient,
// ): Promise<GmailMessage | null> {
//   if (!id) return null;
//   return fetchMessageById(id, gmailClient, "full");
// }

// export async function fetchEmails(refreshToken: string, accessToken: string) {
//   try {
//     const oauth2Client = getOAuthClient();
//     oauth2Client.setCredentials({
//       access_token: accessToken,
//       refresh_token: refreshToken,
//       // Optional: expiry_date: 123456789 (timestamp in ms)
//     });

//     // const gmailClient = google.gmail({ version: "v1", auth: oauth2Client });
//     const gmailClient = gmail({ version: "v1", auth: oauth2Client });

//     //"??" guard against if messageIds is null/empty (empty inbox)
//     const messageIds = await listMessageIds(gmailClient).then(
//       (res) => res?.data.messages ?? [],
//     );

//     //Use allSettled to fetch what you can, skip what fails
//     const results = await Promise.allSettled(
//       messageIds.map((msgRef) => fetchMetadataMessageById(msgRef.id, gmailClient)),
//     );

//     const rawMessages = results
//       .filter(isFulfilled)
//       .map((result) => result.value)
//       .filter(isDefined);

//     // const normalizedMessages = rawMessages.map(normalizeMessage)
//     // const messagesWithBody = normalizedMessages.map(attachBodyPart)
//     // const decodedEmails = messagesWithBody
//     //   .map(decodeEmail)
//     //   .filter(Boolean)

//     const decodedEmails = rawMessages.map(normalizeMetadataMessage);

//     // const decodedEmails = rawMessages
//     //   .map(normalizeFullMessage)
//     //   .map(attachBodyPart)
//     //   .filter(isDefined)
//     //   .map(decodeEmail)
//     //   .filter(isDefined)

//     return decodedEmails;
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error("fetchEmails Error:", error.message);
//     } else {
//       console.error("fetchEmails Error:", error);
//     }
//     return null;
//   }
// }


import { google } from "googleapis";
import { GaxiosError } from "gaxios";
import { disconnectGmail, getGoogleTokens } from './user.service.js';
import getAuthenticatedClient from '../utils/getAuthenticatedClient.js';
import { GmailClient } from "../types/gmail.js";
import {
  JOB_PLATFORM_SENDERS,
  COMPANY_RECRUITING_PREFIXES,
  SCHEDULING_PLATFORMS,
  NEGATIVE_KEYWORDS,
  NEGATIVE_SENDERS,
} from "../constants/gmailFilters.js";

function isInvalidGrant(error: unknown): boolean {
  return (
    error instanceof GaxiosError &&
    error.response?.data?.error === "invalid_grant"
  );
}
export async function intiialSyncJobApplications(userId:string) {

  try {
    const tokensFromDb = await getGoogleTokens(userId)

   const authenticatedClient = getAuthenticatedClient(tokensFromDb)

   const gmailClient:GmailClient = google.gmail({
     version: "v1",
     auth: authenticatedClient,
   });

    const data = await gmailClient.users.getProfile({
      userId: "me"
    })



    // return data
    // return buildInitialSyncQuery()

    const messageIds = await listMessageIds(gmailClient)
return messageIds
  } catch (error) {
    if (isInvalidGrant(error)) {
      await disconnectGmail(userId);
      return;
    }

    throw error;
}
}


export async function listMessageIds(gmailClient: GmailClient, maxResults = 500) {
  try {
    //get first 10 message ids
    const today = new Date();
    const priorDate = new Date(new Date().setDate(today.getDate() - 30));

    const formattedAfterDate = getFormattedDate(priorDate);
    console.log(today);
    console.log(priorDate);
    console.log(formattedAfterDate);
    const messageListResponse = await gmailClient.users.messages.list({
      userId: "me",
      maxResults: maxResults,
      // q: gmailQuery.replace(/[\r\n]+/gm, "")
      // q: `after:${formattedAfterDate}`
      // q:"subject:session tokens"
      // q: `after:2026/02/07`,
      // q: `after:today`,
      q:buildInitialSyncQuery()
    });

    return messageListResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error("listMessageIds Error:", error.message);
    } else {
      console.error("listMessageIds Error:", error);
    }
    return null;
  }
}


// utils/gmailQuery.ts



/**
 * Build initial sync query: last 30 days of job-related emails
 * Focuses on high-confidence signals (known platforms, recruiting addresses)
 */
export function buildInitialSyncQuery(): string {
  // All "from:" clauses
  const fromClauses = [
    ...JOB_PLATFORM_SENDERS.map(domain => `from:${domain}`),
    ...COMPANY_RECRUITING_PREFIXES.map(prefix => `from:${prefix}`),
    ...SCHEDULING_PLATFORMS.map(domain => `from:${domain}`),
  ];

  // Exclude noise
  const negativeFilter = NEGATIVE_KEYWORDS
    .map(kw => `-subject:${kw}`)
    .join(' ');

  return `category:primary
    newer_than:30d
    (${fromClauses.join(' OR ')})
    ${negativeFilter}
  `.trim();
}

/**
 * Build nightly sync query: today's emails only
 * Runs every night to catch new applications, interviews, rejections
 */
export function buildNightlySyncQuery(): string {
  const today = new Date().toISOString().split('T')[0];

  const fromClauses = [
    ...JOB_PLATFORM_SENDERS.map(domain => `from:${domain}`),
    ...COMPANY_RECRUITING_PREFIXES.map(prefix => `from:${prefix}`),
    ...SCHEDULING_PLATFORMS.map(domain => `from:${domain}`),
  ];

  const negativeFilter = NEGATIVE_KEYWORDS
    .map(kw => `-subject:${kw}`)
    .join(' ');
  const negativeFromFilter = NEGATIVE_SENDERS
    .map(kw => `-from:${kw}`);

  return `
    category:primary    after:${today}
    (${fromClauses.join(' OR ')})    ${negativeFilter}    ${negativeFromFilter.join(' OR ')}
  `.trim();
}

/**
 * Build fallback query when historyId expires
 * Same as initial, but only fetches emails we haven't already parsed
 */
export function buildResyncQuery(lastSyncTimestamp: Date): string {
  const fromDate = new Date(lastSyncTimestamp);
  fromDate.setDate(fromDate.getDate() - 1); // 1 day buffer for safety
  const dateStr = fromDate.toISOString().split('T')[0];

  const fromClauses = [
    ...JOB_PLATFORM_SENDERS.map(domain => `from:${domain}`),
    ...COMPANY_RECRUITING_PREFIXES.map(prefix => `from:${prefix}`),
    ...SCHEDULING_PLATFORMS.map(domain => `from:${domain}`),
  ];

  const negativeFilter = NEGATIVE_KEYWORDS
    .map(kw => `-subject:${kw}`)
    .join(' ');

  return `
    category:primary
    after:${dateStr}
    (${fromClauses.join(' OR ')})
    ${negativeFilter}
  `.trim();
}
