import EncryptionService, { encryptPayload } from "@/app/api/oauth/encryption";
import { debug, getUrlEncodedFormData } from "@/app/utils";

import { KeyValueObj } from "@/app/types";
import { NextResponse } from "next/server";
import { baseAppUrlSelector } from "@/app/utils/oauth-utils";

const enableEncryption = process.env.NEXT_PUBLIC_CS_OAUTH_ENCRYPTION === "true";

/**
 * Handles the POST request to refresh the token.
 *
 * @export
 * @param {Request} request
 * @return {*}
 */
export async function POST(request: Request) {
  const encryption = new EncryptionService();
  try {
    const body = await request.json();
    const { region } = body;
    let { refreshToken } = body;
    const baseUrl = baseAppUrlSelector(region);
    if (enableEncryption) {
      refreshToken = encryption.decrypt(refreshToken);
    }

    const params: KeyValueObj = {
      grant_type: "refresh_token",
      client_id: process.env.NEXT_PUBLIC_CS_CLIENT_ID || "",
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL || "",
      refresh_token: refreshToken,
    };

    const now = Date.now(); //This ensures the expires_at is always correct.
    const response = await fetch(`${baseUrl}/apps-api/apps/token`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
      body: getUrlEncodedFormData(params),
    });
    let data = await response.json();

    const expires_at = now + data.expires_in * 1000;
    //TODO:Testing auto refresh...
    // const expires_at = now + 20 * 1000;
    if (enableEncryption) {
      data = encryptPayload(data);
      debug("ENCRYPTED DATA", data);
    }

    return NextResponse.json({
      ...data,
      expires_at,
    });
  } catch (e: any) {
    console.log("Error refreshing the token", e);
    return new Response(`Something went wrong refreshing the token, ${e}`, {
      status: 403,
    });
  }
}
