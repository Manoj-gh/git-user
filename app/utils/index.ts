import { get, has, set } from "lodash";

import { KeyValueObj } from "../types";
import { ReferenceData } from "../hooks/useReferences";
import { ReferenceDetailLite } from "../components/sidebar/models/models";

const mergeObjects = (target: any, source: any) => {
  // Iterate through `source` properties and if an `Object` then
  // set property to merge of `target` and `source` properties
  Object.keys(source)?.forEach((key) => {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], mergeObjects(target[key], source[key]));
    }
  });

  // Join `target` and modified `source`
  Object.assign(target || {}, source);
  return target;
};

const utils = {
  mergeObjects,
};

export const parseJSON = <T>(value: string | null): T => {
  try {
    return value === "undefined" ? undefined : JSON.parse(value ?? "");
  } catch {
    console.log("parsing error on", { value });
    return undefined as T;
  }
};
export const sleep = (ms: number) => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(true);
    }, ms)
  );
};

export const getUrlEncodedFormData = (params: KeyValueObj) => {
  const formBody: any[] = [];
  for (const property in params) {
    const encodedKey: any = encodeURIComponent(property);
    const encodedValue: any = encodeURIComponent(params[property]);
    formBody.push(encodedKey + "=" + encodedValue);
  }
  return formBody.join("&");
};

export const cleanLocalStorageItem = (item: string) => {
  return item.replaceAll('"', "");
};

export const getUniqueReferenceKeys = (
  arr: ReferenceDetailLite[],
  currentList: string[],
  checkedReferences: Record<string, ReferenceData>
): string[] => {
  currentList = currentList || [];
  currentList.push(
    ...arr
      .filter(
        (r) => checkedReferences && checkedReferences[r.uniqueKey].checked
      )
      .map((a) => a.uniqueKey)
  );

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].references) {
      currentList = getUniqueReferenceKeys(
        arr[i].references,
        currentList,
        checkedReferences
      );
    }
  }
  return currentList.filter((v, i, a) => a.indexOf(v) === i);
};

export const getUniqueReferenceKeysFromList = (
  arr: ReferenceDetailLite[],
  currentList: string[]
): string[] => {
  currentList = currentList || [];
  currentList.push(...arr.map((a) => a.uniqueKey));

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].references) {
      currentList = getUniqueReferenceKeysFromList(
        arr[i].references,
        currentList
      );
    }
  }
  return currentList.filter((v, i, a) => a.indexOf(v) === i);
};

export const flatten = ({
  uniqueKey,
  references = [],
}: ReferenceDetailLite): string[] => {
  return [uniqueKey].concat(...references.map(flatten));
};

export const genericFlatten = <T extends KeyValueObj>(
  propToKeep: string,
  childrenPropName: string,
  obj: T
): string[] => {
  return [obj[propToKeep]].concat(
    ...(obj[childrenPropName] || []).map(flatten)
  );
};

export const flattenEntry = (entry: any) => {
  const result: any = {};
  function recurse(cur: any, propPath: any) {
    if (Object(cur) !== cur) {
      result[propPath] = cur;
    } else if (Array.isArray(cur)) {
      const l = cur.length;
      for (let i = 0; i < l; i++) recurse(cur[i], propPath + "[" + i + "]");
      if (l == 0) result[propPath] = [];
    } else {
      let isEmpty = true;
      for (const p in cur) {
        isEmpty = false;
        recurse(cur[p], propPath ? propPath + "." + p : p);
      }
      if (isEmpty && propPath) result[propPath] = {};
    }
  }
  recurse(entry, "");
  return result;
};

export const assetMapper = (entry: any) => {
  const ASSET_CHECKER = ".content_type";
  const flat = flattenEntry(entry);
  for (const [key, value] of Object.entries(flat)) {
    if (key.includes(ASSET_CHECKER)) {
      if (has(entry, key)) {
        if (get(entry, key) === value) {
          const path = key.replace(ASSET_CHECKER, "");
          if (path) {
            const assetsObject = get(entry, path);
            if (assetsObject && assetsObject?.url && assetsObject?.filename) {
              set(entry, path, assetsObject.uid);
            }
          }
        }
      }
    }
  }
};

export const calculatePercentage = (current: number, total: number) => {
  return Math.floor((current / total) * 100);
};

export const throwRanddomError = (percentage: number) => {
  // //Throw an execption 20% of the time to test the retry logic.
  const threshold = 100 / percentage;
  const rand = Math.floor(Math.random() * threshold);
  if (rand === 0) {
    console.log("RANDOM ERROR, SO WE CAN TEST RETRY LOGIC");
    throw new Error("Random error");
  }
};

export const debugEnabled = process.env.NEXT_PUBLIC_NEXTJS_LOGS === "true";

export const debug = (message?: any, ...optionalParams: any[]): void => {
  if (debugEnabled) {
    console.log(message, ...optionalParams);
  }
};

export default utils;
