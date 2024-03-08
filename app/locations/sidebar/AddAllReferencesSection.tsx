import { Accordion, Button, Icon, ToggleSwitch, Tooltip, cbModal } from "@contentstack/venus-components";
import { AttToReleaseResult, useCsOAuthApi } from "@/app/components/sidebar/ContentstackOAuthApi";
import { showError, showErrorDetail, showSuccess } from "@/app/utils/notifications";

import AdvancedOptionsModal from "./modals/AdvancedOptionsModal";
import DefaultLoading from "@/app/components/DefaultLoading";
import { KeyValueObj } from "@/app/types";
import MaxReferencesReached from "@/app/components/sidebar/MaxReferencesReached";
import React from "react";
import ReleasesList from "./ReleasesList";
import SelectDepth from "./SelectDepth";
import SelectLanguages from "./Configuration";
import { isEmpty } from "lodash";
import { useAddReferencesToRelease } from "@/app/hooks/useAddReferencesToRelease";
import { useBranch } from "@/app/hooks/useBranch";
import { useEntryChange } from "@/app/hooks/useEntryChange";
import useUserSelections from "@/app/hooks/useUserSelections";

const AddAllReferencesSection = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingTitle, setLoadingTitle] = React.useState<string>("Loading...");
  const [selectedRelease, setSelectedRelease] = React.useState<any>(null);
  const { locales } = useUserSelections();
  const { branch } = useBranch();
  const { addToRelease } = useCsOAuthApi();
  const [depthValue, updateDepthValue] = React.useState({
    label: process.env.NEXT_PUBLIC_CS_MAX_REF_DEPTH ? process.env.NEXT_PUBLIC_CS_MAX_REF_DEPTH : "5",
    value: process.env.NEXT_PUBLIC_CS_MAX_REF_DEPTH ? parseInt(process.env.NEXT_PUBLIC_CS_MAX_REF_DEPTH) : 5,
  });
  const { entry, contentTypeUid } = useEntryChange();
  const [loadSynchronously, setLoadSynchronously] = React.useState<"sync" | "async">("async");

  const {
    data,
    loading: loadingReferences,
    loadingTitle: loadingTitleReferences,
    totalReferenceCount,
    setDataLoadType,
    reload,
    checkedReferences,
  } = useAddReferencesToRelease({
    depth: depthValue.value,
    entryUid: entry.uid,
    contentTypeUid: contentTypeUid,
    loadType: "async",
    readyToLoad: false,
  });

  const [reloadReleases, setReloadReleases] = React.useState(false);

  const actions = [
    {
      component: (
        <Tooltip content="Reload Releases" position="top" showArrow={false}>
          <Icon icon="Reload" size="tiny" />
        </Tooltip>
      ),
      onClick: () => {
        setReloadReleases((r) => !r);
      },
      actionClassName: "ActionListItem--warning",
    },
  ];

  return loading ? (
    <DefaultLoading title={loadingTitle} />
  ) : (
    <Accordion title="Releases" renderExpanded noChevron actions={actions}>
      <div className="p-2">
        <ReleasesList
          reload={reloadReleases}
          selectedRelease={selectedRelease}
          setSelectedRelease={setSelectedRelease}
          disabled={loadingReferences}
        />
      </div>
      <div className="p-2">
        <SelectDepth
          onDepthSelected={(v) => {
            updateDepthValue(v);
          }}
          depthValue={depthValue}
          disabled={loadingReferences}
        />
      </div>
      <SelectLanguages disabled={loadingReferences} />
      <div className="px-2">
        <Button
          isFullWidth
          buttonType="secondary"
          disabled={
            !locales ||
            isEmpty(locales) ||
            locales?.every((l: any) => !l.checked) ||
            !branch?.uid ||
            loadingReferences ||
            totalReferenceCount === 0
          }
          onClick={() => {
            cbModal({
              component: (props: any) => (
                <AdvancedOptionsModal
                  depth={depthValue.value}
                  loadedData={data}
                  entryUid={entry.uid}
                  contentTypeUid={contentTypeUid}
                  entryTitle={entry.title}
                  loading={loading}
                  branch={branch?.uid}
                  {...props}
                />
              ),
              modalProps: {
                size: "customSize",
              },
            });
          }}
        >
          Advanced Options
        </Button>
      </div>
      <div className="p-2">
        {process.env.NEXT_PUBLIC_CS_SHOW_LOAD_OPTIONS === "true" && (
          <div className="p-2">
            <ToggleSwitch
              onClick={() => {
                setLoadSynchronously((prev) => {
                  const ls = prev === "sync" ? "async" : "sync";
                  setDataLoadType(ls);
                  return ls;
                });
              }}
              label={"Load Synchronously"}
              checked={loadSynchronously === "sync"}
              disabled={loadingReferences || totalReferenceCount === 0}
            />
          </div>
        )}

        {loadingReferences ? (
          <DefaultLoading title={loadingTitleReferences} />
        ) : (
          <>
            <div className="pb-4">
              <Button
                disabled={loadingReferences}
                isFullWidth
                isLoading={loadingReferences}
                buttonType="secondary"
                onClick={() => {
                  reload();
                }}
              >
                {totalReferenceCount > 0 ? `Reload ` : `Load `}References
              </Button>
            </div>
            <div className="pb-2">
              <MaxReferencesReached count={totalReferenceCount} />
            </div>
            <Button
              disabled={selectedRelease === null || loadingReferences || totalReferenceCount === 0}
              isFullWidth
              icon="PurpleAdd"
              isLoading={loadingReferences}
              buttonType="primary"
              onClick={() => {
                if (selectedRelease === null) return;
                setLoadingTitle("Adding items...");
                setLoading(true);
                addToRelease(selectedRelease.value, data, true, checkedReferences, setLoadingTitle)
                  .then((res: AttToReleaseResult) => {
                    if (res.errorDetails && res.errorDetails.length > 0) {
                      console.log("Error Details", res.errorDetails);
                      const errorDetail: KeyValueObj = {};
                      res.errorDetails.forEach((e) => {
                        const keys = Object.keys(e.errors);
                        keys.forEach((k) => {
                          if (errorDetail[k]) return;
                          const item = e.items.find((i) => i.uid === k);
                          const value = e.errors[k];
                          if (item?.title && item?.uid) {
                            errorDetail[`${item?.title} [${item?.uid}]`] = `${value.join(", ")}`;
                          }
                        });
                      });
                      showErrorDetail("Adding to release failed. Check the console for details.", errorDetail);
                      console.error("Error Adding to Release: ", res, errorDetail);
                    } else {
                      showSuccess("References added to Release Successfully");
                    }
                  })
                  .catch((err: any) => {
                    console.log("Error", err);
                    showError("Error Adding to Release");
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
            >
              Add References to Release
            </Button>
          </>
        )}
      </div>
    </Accordion>
  );
};

export default AddAllReferencesSection;
