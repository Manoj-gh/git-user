import { AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  IEntryReleaseInfo,
  IReference,
  ReferenceLocaleData,
} from "./models/models";

import { getReleaseInfo } from "@/app/utils/data-utils";
import { showError } from "@/app/utils/notifications";
import useAuth from "@/app/hooks/oauth/useAuth";
import useContentstackAxios from "@/app/hooks/oauth/useContentstackAxios";

export const MAX_ENTRIES_PER_RELEASE = parseInt(
  process.env.NEXT_PUBLIC_CS_MAX_ENTRIES_PER_RELEASE || "500"
);

export const MAX_ITEMS_AT_ONCE_PER_RELEASE = parseInt(
  process.env.NEXT_PUBLIC_CS_MAX_ITEMS_AT_ONCE_PER_RELEASE || "25"
);

export interface ItemsResult {
  items: EntryOrAssetBasicInfo[];
  errors: Record<string, string[]>;
}

export interface EntryOrAssetBasicInfo {
  uid: string;
  title: string;
  locale: string;
  contentTypeUid?: string;
}
export interface AttToReleaseResult {
  errorDetails: ItemsResult[];
}
export interface IPublishInstruction {
  entries?: {
    uid: string;
    content_type?: string;
    locale: string;
  }[];
  assets?: { uid: string }[];
  locales?: string[];
  environments?: string[];
}

export interface Release {
  name: string;
  locale: string;
}

export interface IEntryMap {
  [key: string]: IReference[];
}

interface SdkResult {
  axios: (query: string, options?: AxiosRequestConfig) => AxiosPromise;
  createRelease: (
    name: string,
    description: string,
    options?: AxiosRequestConfig
  ) => AxiosPromise;
  getLocales: (options?: AxiosRequestConfig) => AxiosPromise;
  getEnvironments: (options?: AxiosRequestConfig) => AxiosPromise;

  getReferencesByLocale: (
    contentTypeUid: string,
    uid: string,
    locale: string,
    depth: number,
    options?: AxiosRequestConfig
  ) => any;
  getReleases: () => AxiosPromise<Release[]>;
  addToRelease: (
    release: string,
    data: ReferenceLocaleData[],
    allReferences: boolean,
    checkedReferences: Record<string, Record<string, boolean>>,
    options?: AxiosRequestConfig
  ) => Promise<AttToReleaseResult>;
  createEntry: (
    contentTypeUid: string,
    entry: any,
    locale: string,
    options?: AxiosRequestConfig<any>
  ) => AxiosPromise;
  updateEntry: (
    contentTypeUid: string,
    uid: string,
    entry: any,
    locale: string,
    options?: AxiosRequestConfig<any>
  ) => AxiosPromise;
  getEntryLocales: (
    entryUid: string,
    contentTypeUid: string,
    options?: AxiosRequestConfig
  ) => AxiosPromise;
  getEntryInLocale: (
    entryUid: string,
    contentTypeUid: string,
    locale: string,
    options?: AxiosRequestConfig
  ) => AxiosPromise;
  entryExists: (
    contentTypeUid: string,
    title: string,
    locale: string,
    options?: AxiosRequestConfig
  ) => AxiosPromise;
  isReady: boolean;
}

/**
 * Custom hook that exposes useful methods to interact with the OAuth Contentstack API
 * @param endpoint, the OAuth Contentstack API endpoint
 * @returns
 */
export const useCsOAuthApi = (): SdkResult => {
  const { strategy: axios, ready } = useContentstackAxios();
  const { isValid } = useAuth({
    from: "useCsOAuthApi",
  });

  return {
    isReady: ready && isValid,
    axios: (query: string, options?: AxiosRequestConfig): AxiosPromise => {
      return axios.executeRequest(`${query}`, options);
    },
    getLocales: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios.executeRequest(`/v3/locales`, {
        ...options,
        headers: {
          ...options?.headers,
        },
      });
    },
    getEnvironments: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios.executeRequest(`/v3/environments`, {
        ...options,
        headers: {
          ...options?.headers,
        },
      });
    },
    getReleases: (options?: AxiosRequestConfig<any>): AxiosPromise => {
      return axios.executeRequest(`/v3/releases`, {
        ...options,
        headers: {
          ...options?.headers,
        },
      });
    },
    createEntry: (
      contentTypeUid: string,
      entry: any,
      locale: string,
      options?: AxiosRequestConfig<any>
    ): AxiosPromise => {
      return axios.executeRequest(
        `/v3/content_types/${contentTypeUid}/entries?locale=${locale}`,
        {
          method: "POST",
          data: { entry: entry },
          headers: {
            ...options?.headers,
          },
          ...options,
        }
      );
    },
    updateEntry: (
      contentTypeUid: string,
      uid: string,
      entry: any,
      locale: string,
      options?: AxiosRequestConfig<any>
    ): AxiosPromise => {
      return axios.executeRequest(
        `/v3/content_types/${contentTypeUid}/entries/${uid}?locale=${locale}`,
        {
          method: "PUT",
          data: { entry: entry },
          ...options,
          headers: {
            ...options?.headers,
          },
        }
      );
    },
    getEntryLocales: (
      uid: string,
      contentTypeUid: string,
      options?: AxiosRequestConfig
    ): AxiosPromise => {
      return axios.executeRequest(
        `/v3/content_types/${contentTypeUid}/entries/${uid}/locales`,
        {
          ...options,
          headers: {
            ...options?.headers,
          },
        }
      );
    },
    getEntryInLocale: (
      uid: string,
      contentTypeUid: string,
      locale: string,
      options?: AxiosRequestConfig
    ): AxiosPromise => {
      return axios.executeRequest(
        `/v3/content_types/${contentTypeUid}/entries/${uid}?locale=${locale}`,
        {
          ...options,
          headers: {
            ...options?.headers,
          },
        }
      );
    },
    getReferencesByLocale: (
      contentTypeUid: string,
      uid: string,
      locale: string,
      depth: number,
      options?: AxiosRequestConfig
    ): AxiosPromise<IReference[]> => {
      return axios.executeRequest(`/utils/${locale}/references`, {
        method: "POST",
        data: {
          contentTypeUid,
          uid,
          depth,
        },
        ...options,
      });
    },
    createRelease: async (
      name: string,
      description: string,
      options?: AxiosRequestConfig
    ): Promise<any> => {
      return axios.executeRequest(`/v3/releases`, {
        method: "POST",
        data: {
          release: {
            name,
            description,
            locked: false,
            archived: false,
          },
        },
        ...options,
        headers: {
          ...options?.headers,
          "Content-Type": "application/json",
        },
      });
    },
    addToRelease: async (
      release: string,
      data: ReferenceLocaleData[],
      allReferences: boolean,
      checkedReferences: Record<string, Record<string, boolean>>,
      options?: AxiosRequestConfig
    ): Promise<AttToReleaseResult> => {
      let releaseInfo: IEntryReleaseInfo[] = getReleaseInfo(
        data,
        checkedReferences,
        allReferences
      );

      //We only support the max number of items
      releaseInfo = releaseInfo.splice(0, MAX_ENTRIES_PER_RELEASE);
      console.log("releaseInfo", releaseInfo, releaseInfo.length);
      const itemsStatus: ItemsResult[] = [];
      let maxItemsAtOnce: IEntryReleaseInfo[] = [];
      while (releaseInfo.length > 0) {
        try {
          maxItemsAtOnce = releaseInfo.splice(0, MAX_ITEMS_AT_ONCE_PER_RELEASE);
          const data = {
            items: maxItemsAtOnce,
          };
          console.log("data", data);
          const response = await axios.executeRequest(
            `/v3/releases/${release}/items`,
            {
              method: "POST",
              data: data,
              headers: {
                ...options?.headers,
              },
            }
          );
          if (response.data.error_code) {
            switch (response.data.error_code) {
              case 141:
                itemsStatus.push({
                  items: maxItemsAtOnce.map(
                    (i: IEntryReleaseInfo): EntryOrAssetBasicInfo => {
                      return {
                        uid: i.uid,
                        title: i.title,
                        locale: i.locale,
                        contentTypeUid: i.content_type_uid,
                      };
                    }
                  ),
                  errors: response?.data?.errors || {},
                });
                break;
              default:
                showError(response.data.error_message);
                break;
            }
          } else {
            console.log("response", response.data);
          }
        } catch (e: AxiosResponse<any> | any) {
          showError("Error adding items to release", e);
        }
      }

      if (itemsStatus && itemsStatus.length > 0) {
        let newItemStatus: ItemsResult[] = [];
        itemsStatus.forEach((itemStatus: ItemsResult) => {
          if (itemStatus.errors && Object.keys(itemStatus.errors).length > 0) {
            const keys = Object.keys(itemStatus.errors);
            keys.forEach((key: string) => {
              const index = parseInt(key.split(".")[1]);
              const entryOrAssetInfo = itemStatus.items[index];
              const newKey = entryOrAssetInfo.uid;
              const value = itemStatus.errors[key];
              newItemStatus.push({
                items: itemStatus.items,
                errors: {
                  [newKey]: value,
                },
              });
            });
          }
        });
        return {
          errorDetails: newItemStatus,
        };
      }
      return {
        errorDetails: itemsStatus,
      };
    },
    entryExists: async (
      contentTypeUid: string,
      title: string,
      locale: string,
      options?: AxiosRequestConfig
    ) => {
      return axios.executeRequest(
        `/v3/content_types/${contentTypeUid}/entries?query={"title":"${title}"}&locale=${locale}`,
        {
          ...options,
          method: "GET",
          headers: {
            ...options?.headers,
          },
        }
      );
    },
  };
};
