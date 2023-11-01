import {
  ReferenceDetailLite,
  ReferenceLocaleData,
} from "../components/sidebar/models/models";

import EncryptionService from "./oauth/encryption";
import { FetchPlusStrategy } from "../utils/fetchPlus";
import { NextResponse } from "next/server";
import { SUCCESSFUL_RESPONSES } from "./models";
import { baseApiUrlSelector } from "../utils/oauth-utils";
import { debug } from "../utils";

/**
 * The response object for the utils route.
 *
 * @export
 * @interface UtilsResponse
 */
export interface UtilsResponse {
  status: number;
  payload: any;
}

// const fetchStrategy = new DefaultFetchRepeatStrategy();
const fetchStrategy = new FetchPlusStrategy();
export const ASSET_REGEXP: RegExp =
  /"url":[\s:]+"https:\/\/images.contentstack.io\/v3\/assets\/[a-z0-9]+\/([a-z0-9]+)\//gm;
export const REF_REGEXP: RegExp =
  /"uid":[\s]+"(.*)",[\s]+"_content_type_uid":[\s]+"(.*)"/gm;

/**
 * Handles the response from the Contentstack REST API.
 * @param response
 * @returns
 */
export const doResponse = (response: UtilsResponse) => {
  if (SUCCESSFUL_RESPONSES.includes(response.status)) {
    return NextResponse.json(response.payload);
  } else {
    return new Response(JSON.stringify(response.payload), {
      status: response.status,
    });
  }
};

/**
 * Prepares the fetch request to inclulde the Contentstack API key and bearer token.
 * @param headers
 * @returns
 */
export const prepareHeaders = (headers: Headers) => {
  const enableEncryption =
    process.env.NEXT_PUBLIC_CS_OAUTH_ENCRYPTION === "true";
  const newHeaders: Record<string, string> = {};

  newHeaders["Content-Type"] =
    headers.get("content-type") || "application/json";
  newHeaders["api_key"] = headers.get("cs-api-key") || "";
  newHeaders["branch"] = headers.get("branch") || "";
  newHeaders["region"] = headers.get("region") || "";

  const bearer = headers.get("authorization")?.replace("Bearer ", "");

  if (enableEncryption) {
    const encryption = new EncryptionService();
    newHeaders["authorization"] = `Bearer ${encryption.decrypt(bearer || "")}`;
  } else {
    newHeaders["authorization"] = `Bearer ${bearer}`;
  }
  return newHeaders;
};

/**
 * Gets the reference data for a given entry.
 * @param contentTypeUid
 * @param uid
 * @param locale
 * @param depth
 * @param headers
 * @returns
 */
export const getLocaleData = async (
  contentTypeUid: string,
  uid: string,
  locale: string,
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>
): Promise<ReferenceLocaleData | null> => {
  const detail = await getLocaleReferenceData(
    contentTypeUid,
    uid,
    locale,
    branch,
    maxDepth,
    currentDepth,
    headers
  );
  if (detail === null) {
    throw new Error(
      `Entry ${uid} not found in locale ${locale} for content type ${contentTypeUid}`
    );
  } else {
    const localeData: ReferenceLocaleData = {
      checked: true,
      topLevelEntry: detail,
      locale,
    };
    return localeData;
  }
};

/**
 * Gets the reference data for a given entry on multiple locales.
 * @param contentTypeUid
 * @param uid
 * @param locales
 * @param depth
 * @param headers
 * @returns
 */
export const getReferences = async (
  contentTypeUid: string,
  uid: string,
  locales: string[],
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>
): Promise<UtilsResponse> => {
  try {
    let locale = "n/a";
    const payload: ReferenceLocaleData[] = [];
    for (let i = 0; i < locales.length; i++) {
      locale = locales[i];
      const localeData = await getLocaleData(
        contentTypeUid,
        uid,
        locale,
        branch,
        maxDepth,
        currentDepth,
        headers
      );
      if (localeData !== null) {
        payload.push(localeData);
      } else {
        console.warn(
          `Entry ${uid} not found in locale ${locale} for content type ${contentTypeUid}`
        );
        payload.push({
          locale,
          checked: true,
          topLevelEntry: {
            uniqueKey: `${uid}_${locale}`,
            uid: uid,
            isAsset: false,
            content_type_uid: contentTypeUid,
            title: "n/a",
            references: [],
            checked: false,
            version: 0,
          },
        } as ReferenceLocaleData);
      }
    }

    return {
      payload: payload.reverse(),
      status: 200,
    };
  } catch (e) {
    return {
      payload: `Something went wrong fetching the data: '${contentTypeUid} :: ${uid} :: ${locales}]', Error: ${e}`,
      status: 500,
    };
  }
};

//Util Methods

/**
 * Gets the reference data for a given entry recursively.
 * @param contentTypeUid
 * @param uid
 * @param locale
 * @param references
 * @param depth
 * @param headers
 * @returns
 */
const getLocaleReferenceData = async (
  contentTypeUid: string,
  uid: string,
  locale: string,
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>
): Promise<ReferenceDetailLite> => {
  const uniqueKey = `${uid}_${locale}`;
  const theEntry = await getEntry(contentTypeUid, uid, locale, branch, headers);
  const entryAsString = JSON.stringify(theEntry, null, 2);

  if (theEntry === null || entryAsString === undefined) {
    throw new Error(
      `Entry ${uid} not found in locale ${locale} for content type ${contentTypeUid}`
    );
  } else {
    const e = await getRegexEntryReferences(
      entryAsString,
      locale,
      branch,
      maxDepth,
      currentDepth,
      headers,
      []
    );
    const a = await getRegexAssetReferences(
      entryAsString,
      locale,
      branch,
      maxDepth,
      currentDepth,
      headers
    );
    return {
      uniqueKey: uniqueKey,
      uid: uid,
      isAsset: false,
      content_type_uid: contentTypeUid,
      title: theEntry.title,
      references: [...e, ...a],
      checked: true,
      version: theEntry._version,
    };
  }
};

/**
 * Gets the reference data for a given entry using a regex.
 * Such regex is used to find all the entry references in the entry json.
 *
 * @param entryAsString
 * @param locale
 * @param depth
 * @param headers
 * @returns
 */
const getRegexEntryReferences = async (
  entryAsString: any,
  locale: string,
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>,
  allRefs: ReferenceDetailLite[]
): Promise<ReferenceDetailLite[]> => {
  if (currentDepth >= maxDepth) {
    return [];
  }
  const references: ReferenceDetailLite[] = [];
  const refs: ReferenceDetailLite[] =
    allRefs && allRefs.length > 0 ? [...allRefs] : [];

  const refMatches: any = entryAsString.matchAll(REF_REGEXP);
  const groupedMatches: any = {};
  for (const rMatch of refMatches) {
    const refUid = rMatch[1] as string;
    const refCtUid = rMatch[2] as string;
    if (!groupedMatches[refCtUid]) {
      groupedMatches[refCtUid] = [];
    }
    if (groupedMatches[refCtUid].indexOf(refUid) === -1) {
      groupedMatches[refCtUid].push(refUid);
    }
  }
  const keys = Object.keys(groupedMatches);

  for (let i = 0; i < keys.length; i++) {
    const refCtUid = keys[i];
    const refUids = groupedMatches[refCtUid];

    const entryRefs = await getEntriesDetail(
      refCtUid,
      refUids,
      locale,
      branch,
      maxDepth,
      currentDepth,
      headers,
      refs
    );

    if (entryRefs && entryRefs.length > 0) {
      //Update the memo with the new references
      allRefs.push(...entryRefs.filter((r) => !refs.includes(r)));
      references.push(...entryRefs.filter((r) => !refs.includes(r)));
    }
  }
  return references;
};

/**
 * Gets the reference data for a given entry using a regex.
 * Such regex is used to find all the asset references in the entry json.
 *
 * @param entryAsString
 * @param locale
 * @param depth
 * @param headers
 * @returns
 */
const getRegexAssetReferences = async (
  entryAsString: string,
  locale: string,
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>
): Promise<ReferenceDetailLite[]> => {
  const assetMatches: any = entryAsString.matchAll(ASSET_REGEXP);

  const assetUids: string[] = [];
  for (const aMatch of assetMatches) {
    assetUids.push(aMatch[1] as string);
  }
  if (assetUids.length > 0) {
    const refs = await getAssetReference(assetUids, locale, branch, headers);
    return refs || [];
  }
  return [];
};

/**
 * Gets an asset data.
 * @param uid
 * @param locale
 * @param depth
 * @param headers
 * @returns
 */
const getAssetReference = async (
  uid: string[],
  locale: string,
  branch: string,
  headers: Record<string, string>
): Promise<ReferenceDetailLite[] | null> => {
  try {
    const baseUrl = baseApiUrlSelector(headers.region);
    const data = await fetchStrategy.executeRequest(
      `${baseUrl}/v3/assets?query={"uid": {"$in":[${uid.map(
        (u) => `"${u}"`
      )}]}}`,
      {
        method: "GET",
        headers: {
          ...headers,
          branch,
        },
      }
    );
    if (data) {
      debug(`getAssetReference, ${data}`);

      const result: ReferenceDetailLite[] = [];
      data?.assets?.forEach((a: any) => {
        result.push({
          uniqueKey: `${a.uid}_${locale}`,
          uid: a.uid,
          isAsset: true,
          content_type_uid: "asset",
          title: a.title,
          references: [],
          checked: true,
          version: a._version,
        });
      });
      return result;
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

/**
 * Gets the entry detail for a given content type and entry uid.
 * It recursively gets the references for the entry.
 *
 * @param contentTypeUid
 * @param uid
 * @param locale
 * @param depth
 * @param headers
 * @param allRefs
 * @returns
 */
const getEntriesDetail = async (
  contentTypeUid: string,
  uid: string[],
  locale: string,
  branch: string,
  maxDepth: number,
  currentDepth: number,
  headers: Record<string, string>,
  allRefs: ReferenceDetailLite[]
): Promise<ReferenceDetailLite[]> => {
  try {
    if (currentDepth >= maxDepth) {
      return [];
    }
    const baseUrl = baseApiUrlSelector(headers.region);
    //TODO: THIS CALL MIGHT CAUSE TROUBLE FOR LARGER REFERENCE COUNT AS IT IS LIMITED TO 100
    if (uid.length === 0) {
      return [];
    }
    const data = await fetchStrategy.executeRequest(
      `${baseUrl}/v3/content_types/${contentTypeUid}/entries?locale=${locale}&query={"uid": {"$in":[${uid.map(
        (u) => `"${u}"`
      )}]}}`,
      {
        method: "GET",
        headers: {
          ...headers,
          branch,
        },
      }
    );
    if (data) {
      const rr: ReferenceDetailLite[] =
        allRefs && allRefs.length > 0 ? [...allRefs] : [];
      debug("getEntriesDetail", data);

      if (data && data.entries && data.entries.length > 0) {
        for (let i = 0; i < data.entries.length; i++) {
          const e = data.entries[i];
          const uniqueKey = `${e.uid}_${locale}`;
          try {
            const entryAsString = JSON.stringify(e, null, 2);
            const found = allRefs.find(
              (r) =>
                r.uniqueKey === uniqueKey &&
                r.content_type_uid === contentTypeUid
            );
            let detail: any = {};

            if (found) {
              rr.push(found);
              continue;
            } else {
              detail = {
                uniqueKey: uniqueKey,
                uid: e.uid,
                isAsset: false,
                content_type_uid: contentTypeUid,
                title: e.title,
                references: [],
                checked: true,
                version: e._version,
              };

              currentDepth++;
              if (currentDepth >= maxDepth) {
                rr.push(detail);
                continue;
              }
              const ne = await getRegexEntryReferences(
                entryAsString,
                locale,
                branch,
                maxDepth,
                currentDepth,
                headers,
                rr
              );
              const na = await getRegexAssetReferences(
                entryAsString,
                locale,
                branch,
                maxDepth,
                currentDepth,
                headers
              );
              detail.references = [...ne, ...na]; //JAIME?
              rr.push(detail);
            }
          } catch (error) {
            console.error(
              `Something went wrong while getting entries detail for ${uniqueKey}`
            );
            console.error(error);
            const detail = {
              uniqueKey: uniqueKey,
              uid: e.uid,
              isAsset: false,
              content_type_uid: contentTypeUid,
              title: e.title,
              references: [],
              checked: true,
              version: e._version,
            };
            rr.push(detail);
          }
        }
      } else {
        console.log(`No entries found for ${contentTypeUid} :: ${uid}`);
      }

      return rr;
    } else {
      return [];
    }
  } catch (e) {
    console.log("Something went wrong while getting entries detail");
    console.log(e);
    return [];
  }
};

/**
 * Gets an entry data.
 * @param contentTypeUid
 * @param uid
 * @param locale
 * @param headers
 * @returns
 */
const getEntry = async (
  contentTypeUid: string,
  uid: string,
  locale: string,
  branch: string,
  headers: Record<string, string>
): Promise<any> => {
  const baseUrl = baseApiUrlSelector(headers.region);
  const data = await fetchStrategy.executeRequest(
    `${baseUrl}/v3/content_types/${contentTypeUid}/entries/${uid}?locale=${locale}`,
    {
      method: "GET",
      headers: {
        ...headers,
        branch,
      },
    }
  );
  if (!data) {
    debug("getEntry :: null response.");

    return null;
  }

  debug("getEntry :: data :: ", data);

  return data ? data.entry : null;
};
