"use client";

import { useEntry } from "./useEntry";
import { useState } from "react";

const SAVE_MESSAGE: string =
  "You need to save the entry, and reload the extension to update the references.";
const SAVED_MESSAGE: string =
  "Entry saved, you need to reload the extension to update the references.";

export const useEntryChange = (): any => {
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [canRefresh, setCanRefresh] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | undefined>(
    undefined
  );

  const { entryData, contentTypeUid, loadingEntry, currentLocale } = useEntry({
    onChange: () => {
      setShowWarning(true);
      setWarningMessage(SAVE_MESSAGE);
      setCanRefresh(false);
    },
    onSave: () => {
      setShowWarning(true);
      setWarningMessage(SAVED_MESSAGE);
      setCanRefresh(true);
    },
  });
  return {
    entry: entryData,
    contentTypeUid,
    showWarning,
    warningMessage,
    canRefresh,
    loadingEntry,
    currentLocale,
  };
};
