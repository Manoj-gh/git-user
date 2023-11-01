import {
  ILocaleConfig,
  ReferenceLocaleData,
} from "../components/sidebar/models/models.js";
import React, { useContext } from "react";
import { calculatePercentage, debug } from "../utils";

import { set } from "lodash";
import { useCsOAuthApi } from "../components/sidebar/ContentstackOAuthApi";
import { useReferences } from "./useReferences";
import useUserSelections from "./useUserSelections";

export interface AddReferencesToReleaseProps {
  depth: number;
  contentTypeUid: string;
  entryUid: string;
  loadedData?: ReferenceLocaleData[];
  loadType?: "sync" | "async";
  readyToLoad?: boolean;
}

export type ReferencesData = ReturnType<typeof useAddReferencesToRelease>;

export const useAddReferencesToRelease = ({
  loadType,
  depth,
  entryUid,
  contentTypeUid,
  loadedData,
  readyToLoad,
}: AddReferencesToReleaseProps) => {
  const [reloadReferences, setReloadReferences] = React.useState<number>(0);
  const [loadingTitle, setLoadingTitle] = React.useState<string>("");
  const { getReferencesByLocale, isReady } = useCsOAuthApi();
  const [progress, setProgress] = React.useState(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [data, setData] = React.useState<ReferenceLocaleData[]>([]);
  const { locales } = useUserSelections();
  const refereceData = useReferences({ data: data });
  const [dataLoadType, setDataLoadType] = React.useState<"sync" | "async">(
    loadType || "sync"
  );
  const [loadReady, setLoadReady] = React.useState<boolean>(
    readyToLoad || false
  );

  const canLoadReferences = React.useCallback(() => {
    return (
      loadReady &&
      isReady &&
      entryUid &&
      contentTypeUid &&
      locales &&
      locales?.length > 0 &&
      locales?.some((l) => l.checked)
    );
  }, [locales, isReady, entryUid, contentTypeUid, loadReady]);

  //Load References
  React.useEffect(() => {
    //TODO: We don't need the synchronous option, unless we face issues.
    function loadReferencesByLocaleAsync() {
      if (!canLoadReferences()) {
        setData(loadedData && loadedData?.length > 0 ? loadedData : []);
        setLoading(false);
        return;
      }

      const loc = locales?.filter((l) => l.checked).map((ll) => ll.code);
      if (loc && loc.length > 0) {
        setLoading(true);
        setProgress(0);
        setData([]);
        for (let i = 0; i < loc.length; i++) {
          const l = loc[i];
          getReferencesByLocale(contentTypeUid, entryUid, l, depth)
            .then((response: any) => {
              setData((prevData) => {
                setProgress((p) => {
                  const cp = p + 1;
                  const percentage = calculatePercentage(cp, loc.length);
                  setLoadingTitle(`Loading references ${percentage}% ...`);
                  return cp;
                });
                return [
                  ...prevData.filter((p) => p.locale !== l),
                  response.data,
                ];
              });
            })
            .catch((e: any) => {
              console.log("Error while getting references");
              console.log(e);
              setLoading(false);
            });
        }
      } else {
        setProgress(0);
        setLoading(false);
      }
    }
    async function loadReferencesByLocaleSync() {
      if (!canLoadReferences()) {
        setData(loadedData && loadedData?.length > 0 ? loadedData : []);
        setLoading(false);
        return;
      }

      const loc = locales?.filter((l) => l.checked).map((ll) => ll.code);
      if (loc && loc.length > 0) {
        setLoading(true);
        setProgress(0);
        setData([]);

        for (let i = 0; i < loc.length; i++) {
          setLoadingTitle(
            `[${i + 1}/${loc.length}] Getting '${loc[i]}' references...`
          );
          try {
            const l = loc[i];
            const response = await getReferencesByLocale(
              contentTypeUid,
              entryUid,
              l,
              depth
            );
            if (response?.data) {
              setData((prevData) => {
                setProgress((p) => p + 1);
                return [
                  ...prevData.filter((p) => p.locale !== l),
                  response.data,
                ];
              });
            }
          } catch (e) {
            console.log("Error while getting references");
            console.log(e);
            setLoading(false);
            setData([]);
            break;
          }
        }
      } else {
        setProgress(0);
        setLoading(false);
      }
    }
    if (dataLoadType === "async") {
      loadReferencesByLocaleAsync();
    } else {
      loadReferencesByLocaleSync().then(() => {
        console.log("References loaded");
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    entryUid,
    contentTypeUid,
    locales,
    isReady,
    depth,
    dataLoadType,
    loadReady,
    reloadReferences,
  ]);

  // Update loading state
  React.useEffect(() => {
    if (
      loading &&
      data &&
      data.length > 0 &&
      data.length === locales?.filter((l: ILocaleConfig) => l.checked)?.length
    ) {
      debug("Loading complete");
      setLoading(false);
      setLoadingTitle("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.length]);

  return {
    data,
    setData,
    loading,
    loadingTitle,
    progress,
    setDataLoadType,
    setLoadReady,
    reload: () => {
      setLoadReady(true);
      setReloadReferences((r) => r + 1);
    },
    ...refereceData,
  };
};
