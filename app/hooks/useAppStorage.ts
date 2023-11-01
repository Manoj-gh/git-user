"use client";

import ContentstackAppSDK from "@contentstack/app-sdk";
import React from "react";
import { debug } from "../utils";
import { isEmpty } from "lodash";
import { useEventListener } from "usehooks-ts";

declare global {
  interface WindowEventMap {
    "app-storage": CustomEvent;
  }
}

interface UseAppStorageResult<T> {
  value: T | undefined;
  store: (value: Partial<T>) => Promise<void>;
  reset: () => Promise<void>;
  delete: () => Promise<void>;
  storeInProgress: boolean;
  setValue: React.Dispatch<React.SetStateAction<T>>;
}

const useAppStorage = <T>(key: string): UseAppStorageResult<T> => {
  const [value, setValue] = React.useState<T>(undefined as T);
  const [storeInProgress, setStoreInProgress] = React.useState<boolean>(false);

  const handleStorageChange = React.useCallback(
    (event: StorageEvent | CustomEvent) => {
      if ((event as StorageEvent)?.key && (event as StorageEvent).key !== key) {
        return;
      }
      ContentstackAppSDK.init().then((appSdk) => {
        appSdk.store.get(key).then((v) => {
          if (v) {
            setValue(v);
          }
        });
      });
    },
    [key, setValue]
  );

  React.useEffect(() => {
    ContentstackAppSDK.init().then((appSdk) => {
      appSdk.store.get(key).then((v) => {
        if (v) {
          setValue(v);
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEventListener("storage", handleStorageChange);
  useEventListener("app-storage", handleStorageChange);

  return {
    value,
    storeInProgress,
    setValue,
    delete: async () => {
      setStoreInProgress(true);
      ContentstackAppSDK.init().then((appSdk) => {
        setValue(() => {
          console.log("delete", key);
          appSdk.store.remove(key).then(() => {
            debug("Value deleted successfully: ", key);
            setStoreInProgress(false);
            window.dispatchEvent(new Event("app-storage"));
          });
          return undefined as T;
        });
      });
    },
    reset: async () => {
      setStoreInProgress(true);
      ContentstackAppSDK.init().then((appSdk) => {
        let newValue: T = {} as T;
        setValue(() => {
          appSdk.store.set(key, newValue).then(() => {
            debug("Value stored successfully: ", key, newValue);
            setStoreInProgress(false);
            window.dispatchEvent(new Event("app-storage"));
          });
          return newValue;
        });
      });
    },
    store: async (v: Partial<T>) => {
      setStoreInProgress(true);
      ContentstackAppSDK.init().then((appSdk) => {
        let newValue: T = {} as T;
        setValue((prev) => {
          if (!isEmpty(v)) {
            newValue = {
              ...prev,
              ...v,
            };
          }

          appSdk.store.set(key, newValue).then(() => {
            debug("Value stored successfully: ", key, newValue);

            setStoreInProgress(false);
            window.dispatchEvent(new Event("app-storage"));
          });
          return newValue;
        });
      });
    },
  };
};
export default useAppStorage;
