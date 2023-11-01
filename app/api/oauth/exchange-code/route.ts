import { debug, getUrlEncodedFormData } from "@/app/utils";

import { KeyValueObj } from "@/app/types";
import { NextResponse } from "next/server";
import { baseAppUrlSelector } from "@/app/utils/oauth-utils";
import { encryptPayload } from "@/app/api/oauth/encryption";

const enableEncryption = process.env.NEXT_PUBLIC_CS_OAUTH_ENCRYPTION === "true";

/**
 *
 * Handles the POST request to exchange the code for an access token.
 * @export
 * @param {Request} request
 * @return {*}
 */
export async function POST(request: Request) {
  let code = "unknown";
  let region = "NA";
  let codeVerifier = "unknown";

  try {
    const body = await request.json();
    code = body.code;
    region = body.region;
    codeVerifier = body.code_verifier;
    const baseUrl = baseAppUrlSelector(region);

    const params: KeyValueObj = {
      grant_type: "authorization_code",
      client_id: process.env.NEXT_PUBLIC_CS_CLIENT_ID || "",
      redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URL || "",
      code_verifier: codeVerifier,
      code: code,
    };

    const now = Date.now(); //This ensures the expires_at is always correct.

    const response = await fetch(`${baseUrl}/apps-api/apps/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: getUrlEncodedFormData(params),
    });
    let data = { ...(await response.json()), code_verifier: codeVerifier };
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
  } catch (e) {
    console.log("Error exchanging the code", e);
    return new Response(
      `Something went wrong exchanging the code: '${code}, with verifier: ${codeVerifier}', ${e}`,
      { status: 500 }
    );
  }
}
