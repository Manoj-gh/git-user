"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useEventCallback, useEventListener } from "usehooks-ts";

const KEY_PREFIX = "@secure-storage.";

declare global {
  interface WindowEventMap {
    "local-storage": CustomEvent;
  }
}

function useLocalStorage<T>(
  key: string
): [T | undefined, Dispatch<SetStateAction<T | undefined>>] {
  const storageKey = `${KEY_PREFIX}${key}`;
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = useCallback((): T | undefined => {
    // Prevent build error "window is undefined" but keeps working
    if (typeof window === "undefined") {
      console.warn("useLocalStorage :: NO WINDOW!");
      return undefined;
    }

    try {
      const item = window.localStorage.getItem(storageKey);
      if (item === null) {
        return undefined;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Error reading localStorage key “${storageKey}”:`, error);
      return undefined;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T | undefined>(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useEventCallback((value) => {
    // Prevent build error "window is undefined" but keeps working
    if (typeof window === "undefined") {
      console.warn(
        `Tried setting localStorage key “${storageKey}” even though environment is not a client`
      );
    }

    try {
      // Allow value to be a function so we have the same API as useState
      const newValue = value instanceof Function ? value(storedValue) : value;

      // Save to local storage, if defined
      if (newValue !== undefined) {
        window.localStorage.setItem(storageKey, JSON.stringify(newValue));
        // Save state
        setStoredValue(newValue);
      }

      // We dispatch a custom event so every useLocalStorage hook are notified
      window.dispatchEvent(new Event("local-storage"));
    } catch (error) {
      console.warn(`Error setting localStorage key “${storageKey}”:`, error);
    }
  });

  useEffect(() => {
    console.log("useLocalStorage useEffect", storageKey, readValue());
    const currentValue = readValue();
    setStoredValue(currentValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      if (
        (event as StorageEvent)?.key &&
        (event as StorageEvent).key !== storageKey
      ) {
        return;
      }

      const newValue = readValue();
      setStoredValue(newValue);
    },
    [storageKey, readValue]
  );

  // this only works for other documents, not the current one
  useEventListener("storage", handleStorageChange);

  // this is a custom event, triggered in writeValueToLocalStorage
  // See: useLocalStorage()
  useEventListener("local-storage", handleStorageChange);

  return [storedValue, setValue];
}

export default useLocalStorage;
