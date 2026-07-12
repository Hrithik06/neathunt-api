import { google } from "googleapis";
export const getOAuthClient = () =>
 {const oauth2Client= new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    undefined, //cuz i have  multiple redirect_uri i set it in callbacks
  );

 return oauth2Client
}
