import { IContentstackResponse, SUCCESSFUL_RESPONSES } from "../../models";
import { NextRequest, NextResponse } from "next/server";
import { debug, debugEnabled } from "@/app/utils";

import { FetchPlusStrategy } from "@/app/utils/fetchPlus";
import { baseApiUrlSelector } from "@/app/utils/oauth-utils";
import { prepareHeaders } from "../../helper";

const fetchStrategy = new FetchPlusStrategy();
const DATA_METHODS = ["POST", "PUT"];

/**
 * Handles the POST request to proxy calls to the Contentstack REST API.
 *
 * @export
 * @param {NextRequest} request
 * @param {{ params: { slug: string[] } }} context
 * @return {*}
 */
export async function POST(
  request: NextRequest,
  context: { params: { slug: string[] } }
) {
  return doResponse(
    await doFetch(
      context.params.slug,
      "POST",
      request.url,
      request.headers,
      await request.json()
    )
  );
}

/**
 * Handles the PUT request to proxy calls to the Contentstack REST API.
 *
 * @export
 * @param {NextRequest} request
 * @param {{ params: { slug: string[] } }} context
 * @return {*}
 */
export async function PUT(
  request: NextRequest,
  context: { params: { slug: string[] } }
) {
  return doResponse(
    await doFetch(
      context.params.slug,
      "PUT",
      request.url,
      request.headers,
      await request.json()
    )
  );
}

/**
 * Handles the GET request to proxy calls to the Contentstack REST API.
 *
 * @export
 * @param {NextRequest} request
 * @param {{ params: { slug: string[] } }} context
 * @return {*}
 */
export async function GET(
  request: NextRequest,
  context: { params: { slug: string[] } }
) {
  return doResponse(
    await doFetch(context.params.slug, "GET", request.url, request.headers)
  );
}

/**
 * Handles the DELETE request to proxy calls to the Contentstack REST API.
 *
 * @export
 * @param {NextRequest} request
 * @param {{ params: { slug: string[] } }} context
 * @return {*}
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { slug: string[] } }
) {
  return doResponse(
    await doFetch(context.params.slug, "DELETE", request.url, request.headers)
  );
}

/**
 * Utility function to handle the response.
 *
 * @param {IContentstackResponse} response
 * @return {*}
 */
const doResponse = (response: IContentstackResponse) => {
  //TODO: SUPPORT MORE SUCCESSFUL RESPONSES

  if (SUCCESSFUL_RESPONSES.includes(response.status)) {
    debug("Response Payload", response.payload);

    return NextResponse.json(response.payload);
  } else {
    console.error(response.friendlyMessage, response.payload);
    return NextResponse.json(response.payload, { status: response.status });
  }
};

/**
 * Utility function to handle the fetch.
 *
 * @param {string[]} slug
 * @param {string} method
 * @param {string} url
 * @param {Headers} headers
 * @param {*} [data]
 * @return {*}  {Promise<IContentstackResponse>}
 */
const doFetch = async (
  slug: string[],
  method: string,
  url: string,
  headers: Headers,
  data?: any
): Promise<IContentstackResponse> => {
  if (debugEnabled) {
    console.log(
      `Proxying ${method} request to [${slug.join("/")}] with data: `,
      data
    );
    const iterator = headers.entries();
    console.log("INPUT HEADERS ======================");
    for (const entry of iterator) {
      console.log(entry);
    }
    console.log("/INPUT HEADERS =====================");
  }
  const newHeaders = prepareHeaders(headers);
  if (debugEnabled) {
    console.log("OUTPUT HEADERS =====================");
    console.log(newHeaders);
    console.log("/OUTPUT HEADERS ====================");
  }
  const config = {
    method: method,
    headers: newHeaders,
    body:
      DATA_METHODS.includes(method) && data ? JSON.stringify(data) : undefined,
  };
  debug("CONFIG", config);

  try {
    const data = await fetchStrategy.executeRequest(
      getUrl(headers.get("region") || "", slug, url),
      config
    );
    return {
      status: 200,
      friendlyMessage: `Successfully ${method}ed the data to [${slug.join(
        "/"
      )}"]`,
      payload: data,
    };
  } catch (e) {
    console.log("Error executing request", e);
    return {
      payload: e,
      status: 500,
      friendlyMessage: `Something went wrong ${method}ing the data: '[${slug.join(
        "/"
      )}]'`,
    };
  }
};

/**
 * Utility function to handle the URL.
 *
 * @param {string[]} slug
 * @param {string} url
 * @return {*}
 */
const getUrl = (region: string, slug: string[], url: string) => {
  const baseUrl = baseApiUrlSelector(region);
  const query = url.split("?")[1];
  let u = `${baseUrl}/v3/${slug.join("/")}`;
  if (query) {
    u = `${u}?${query}`;
  }
  return u;
};
