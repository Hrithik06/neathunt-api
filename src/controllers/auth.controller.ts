import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { getOAuthClient } from "../config/googleOAuth.js";
import { checkScopes } from "../utils/checkScopes.js";
import {
  enableAutomaticTracking,
  findOrCreateUser,
  getUserById,
  getUserByGoogleId,
  saveGmailTokens,
  updateScopes,
} from "../services/user.service.js";

import { hasFullGmailTokens } from "../utils/hasFullGmailTokens.js";
import { signToken, verifyToken } from "../services/jwt.service.js";
import { JwtPayload } from "../types/auth.js";

const BASE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const ALL_SCOPES = [...BASE_SCOPES, ...GMAIL_SCOPES];

export const googleAuth = async (req: Request, res: Response) => {
  const token = req.cookies.session;

  if (token) {
    try {
      const decoded = verifyToken(token) as JwtPayload;
      // 🔴 IMPORTANT: check DB
      const user = await getUserById(decoded.userId);

      if (!user) {
        throw new Error("User not found");
      }

      // ✅ already logged in → skip OAuth
      return res.redirect("http://localhost:5173/dashboard");
    } catch {
      // invalid token OR user missing → continue to OAuth
    }
  }

  const oauth2Client = getOAuthClient();
  const authUrl = oauth2Client.generateAuthUrl({
    scope: BASE_SCOPES,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });

  return res.redirect(authUrl);
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken({
      code: code,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI, //need to send again cuz we have multiple if not sent google uses last used/default callback
    });

    oauth2Client.setCredentials(tokens);
    const grantedScopes = tokens?.scope?.split(" ") || [];
    //NO need as these are given by default
    // const hasAllScopes = checkScopes(grantedScopes, BASE_SCOPES);

    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    const data = await response.json();

    if (!data.id || !data.email || !data.name || !data.picture) {
      throw new Error("Missing data in OAuth callback");
    }

    const profile = {
      googleId: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
      scopes: grantedScopes,
    };
    const user = await findOrCreateUser(profile);
    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    res.cookie("session", token, {
      httpOnly: true,
      secure: false, // true in production (https)
      maxAge: 7 * 24 * 60 * 60,
      // sameSite: "lax",
    });

    res.redirect("http://localhost:5173/dashboard");
  } catch (err) {
    console.log("googleCallback ERROR");
    console.error(err);
    res.status(500).send("Auth failed");
  }
};

export const googleUpgrade = (req: Request, res: Response) => {
  try {
    const oauth2Client = getOAuthClient();
    const state = JSON.stringify({
      flow: "upgrade",
      redirectTo: "/dashboard",
    });
    const upgradeAuthUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ALL_SCOPES, //need to add BASE_SCOPES too cuz google doesnt remember previously given it replaces them with new ones
      redirect_uri: process.env.GOOGLE_UPGRADE_REDIRECT_URI,
      state,
    });
    res.redirect(upgradeAuthUrl);
  } catch (err) {
    console.log("googleUpgrade ERROR");
    console.error(err);
    res.status(500).send("Auth failed");
  }
};

export const googleUpgradeCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const state = JSON.parse(req.query.state as string);
    console.log(state);
    const oauth2Client = getOAuthClient();

    const { tokens } = await oauth2Client.getToken({
      code: code,
      redirect_uri: process.env.GOOGLE_UPGRADE_REDIRECT_URI, //need to send again cuz we have different uris if not sent google uses last used/default callbacklogout
    });

    oauth2Client.setCredentials(tokens);

    // const oauth2 = google.oauth2({
    //   auth: oauth2Client,
    //   version: "v2",
    // });

    // const { data } = await oauth2.userinfo.get();

    // const accessToken = (await oauth2Client.getAccessToken()).token;
    // console.log(accessToken)
    // console.log(tokens.access_token === accessToken)

    if (!tokens.scope) {
      throw new Error("Missing scopes in OAuth callback");
    }
    const grantedScopes = tokens?.scope.split(" ") || [];

    const hasGmailScope = checkScopes(grantedScopes, GMAIL_SCOPES);

    if (!hasGmailScope) {
      // User denied the scope
      return res.redirect(
        `http://localhost:5173${state.redirectTo}?error=gmail_access_denied`,
      );
    }
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      },
    );

    const data = await response.json();

    const googleId = data.id;
    if (!googleId) {
      throw new Error("Missing googleId in OAuth callback");
    }
    const user = await getUserByGoogleId(googleId);
    await updateScopes(user.id, grantedScopes);
    await enableAutomaticTracking(user.id);

    if (hasFullGmailTokens(tokens) && googleId) {
      await saveGmailTokens(
        user.id,
        tokens.access_token,
        tokens.refresh_token,
        new Date(tokens.expiry_date),
      );
    }

    // Trigger initial email scan
    // await scanGmailForApplications(req.session.userId);

    res.redirect(
      `http://localhost:5173${state.redirectTo}?success=automatic_enabled`,
    );
  } catch (err) {
    console.log("googleUpgradeCallback ERROR");
    console.error(err);
    res.redirect("http://localhost:5173/dashboard?error=upgrade_failed");
  }
};

export const getMe = async (req: Request, res: Response) => {
  const user = await getUserById(req.user.userId);
  //NOTE:Don't send all data
  res.json({ user });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("session");
  res.json({ success: true });
};
