import { isEmpty, isNull } from "lodash";
import { useCallback, useEffect, useState } from "react";

import { useAppLocation } from "./useAppLocation";

type OnChange = (a: any, b: any) => void;
type OnSave = OnChange;

/**
 * Getter and setter hook for entry data
 * @return Array of [entryData, setEntryDataFn, loadingState]
 *
 * Eg:
 * const [data, setData, loading] = useEntry();
 */
export const useEntry = ({
  onChange,
  onSave,
}: {
  onChange?: OnChange;
  onSave?: OnSave;
}) => {
  const [loadingEntry, setLoadingEntry] = useState<boolean>(true);
  const { location, locationName } = useAppLocation();
  const [entryData, setEntry] = useState<{ [key: string]: any }>({});
  const [contentTypeUid, setContentTypeUid] = useState<string | undefined>(
    undefined
  );

  if (locationName !== "SidebarWidget") {
    throw new Error(`useEntry hook cannot be used inside ${locationName}`);
  }

  useEffect(() => {
    if (!isEmpty(entryData) || isNull(location) || isNull(location)) return;

    setLoadingEntry(true);
    const data = location.entry.getData();
    const entry: { [key: string]: any } = {
      ...data,
      content_type: {
        title: location.entry.content_type.title,
        uid: location.entry.content_type.uid,
      },
    };

    if (onChange) {
      location.entry.onChange(onChange);
    }
    if (onSave) {
      location.entry.onSave(onSave);
    }
    setContentTypeUid(location.entry.content_type.uid);
    setEntry(entry);
    setLoadingEntry(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryData, location]);

  const setEntryData = useCallback(
    async (entry: any) => {
      setLoadingEntry(true);
      await location.entry.setData(entry);
      setEntry(entry);
      setLoadingEntry(false);
    },
    [location, setEntry, setLoadingEntry]
  );

  return {
    entryData,
    setEntryData,
    loadingEntry,
    contentTypeUid,
    currentLocale: location.entry.locale,
  };
};
