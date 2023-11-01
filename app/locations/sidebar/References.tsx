"use client";

import {
  Accordion,
  Checkbox,
  Icon,
  Tooltip,
} from "@contentstack/venus-components";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import React, { useContext } from "react";
import {
  ReferenceDetailLite,
  ReferenceLocaleData,
} from "@/app/components/sidebar/models/models";
import { genericFlatten, getUniqueReferenceKeys } from "@/app/utils";

import DefaultLoading from "@/app/components/DefaultLoading";
import { ReleaseOptions } from "./ReleaseOptions";
import { useAddReferencesToRelease } from "@/app/hooks/useAddReferencesToRelease";
import useAuth from "@/app/hooks/oauth/useAuth";
import useUserSelections from "@/app/hooks/useUserSelections";

// import { theData } from "@/app/utils/data";

interface ReferencesProps {
  contentTypeUid: string;
  entryUid: string;
  loadedData: ReferenceLocaleData[];
  closeModal: (data?: any) => void;
}
interface ReferenceDetailComponentProps {
  reference: ReferenceDetailLite;
  locale: string;
  isChild?: boolean;
}

const References = ({
  contentTypeUid,
  entryUid,
  loadedData,
  closeModal,
}: ReferencesProps) => {
  const { isRefreshingToken, isValid, auth } = useAuth({
    from: "References",
    autoRefresh: true,
  });

  const [depthValue, updateDepthValue] = React.useState({
    label: process.env.NEXT_PUBLIC_CS_MAX_REF_DEPTH
      ? process.env.NEXT_PUBLIC_CS_MAX_REF_DEPTH
      : "5",
    value: process.env.NEXT_PUBLIC_CS_MAX_REF_DEPTH
      ? parseInt(process.env.NEXT_PUBLIC_CS_MAX_REF_DEPTH)
      : 5,
  });
  const { locales } = useUserSelections();
  const {
    data,
    loading,
    progress,
    checkedLocales,
    checkedReferences,
    openReferences,
    totalReferenceCount,
    setCheckedReferences,
    setOpenReferences,
  } = useAddReferencesToRelease({
    depth: depthValue.value,
    entryUid: entryUid,
    contentTypeUid: contentTypeUid,
    loadedData: loadedData,
  });

  const searchReference = React.useCallback(
    (
      reference: ReferenceDetailLite,
      uniqueKey: string
    ): ReferenceDetailLite | null => {
      if (reference.uniqueKey == uniqueKey) {
        return reference;
      } else if (
        reference.references !== null &&
        reference.references.length > 0
      ) {
        var i;
        var result: any = null;
        for (i = 0; result == null && i < reference.references.length; i++) {
          result = searchReference(reference.references[i], uniqueKey);
        }
        return result;
      }
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const ReferenceDetailComponent = ({
    reference,
    locale,
    isChild = false,
  }: ReferenceDetailComponentProps) => {
    return (
      <div className="flex flex-row ">
        <div
          className={`flex flex-row gap-1 -mb-4 ${isChild ? "-mt-2" : "-mt-4"}`}
        >
          <div className="py-4 px-1 ">
            <Icon icon="Reference" size="small" />
          </div>
          <div className="py-4">
            <Checkbox
              key={`check_${reference.uniqueKey}`}
              checked={checkedReferences[locale][reference.uniqueKey]}
              onClick={() => {
                setCheckedReferences((prev) => {
                  const r = searchReference(
                    data.find((d) => d.locale === locale)?.topLevelEntry!,
                    reference.uniqueKey
                  );

                  if (r !== null) {
                    const flat = genericFlatten("uniqueKey", "references", r);
                    const newCheckedReferences = { ...prev };
                    const checked =
                      !newCheckedReferences[locale][reference.uniqueKey];
                    flat.forEach((f) => {
                      newCheckedReferences[locale][f] = checked;
                    });
                    console.log("CR", newCheckedReferences);
                    return newCheckedReferences;
                  }
                  return prev;
                });
              }}
              label={""}
            />
          </div>
          <div className="py-4">
            <Collapsible
              className="top-0"
              open={openReferences[locale][reference.uniqueKey]}
              onOpenChange={() => {
                if (reference.references.length > 0) {
                  setOpenReferences((prev) => {
                    const newOpenReferences = { ...prev };
                    newOpenReferences[locale][reference.uniqueKey] =
                      !newOpenReferences[locale][reference.uniqueKey];
                    return newOpenReferences;
                  });
                } else {
                  setCheckedReferences((prev) => {
                    const newCheckedReferences = { ...prev };
                    newCheckedReferences[locale][reference.uniqueKey] =
                      !newCheckedReferences[locale][reference.uniqueKey];
                    return newCheckedReferences;
                  });
                }
              }}
            >
              <CollapsibleTrigger>
                <Tooltip
                  content={`Reference UID: ${reference.uid}`}
                  position="right"
                  type="primary"
                  variantType="light"
                >
                  <span
                    className={`${
                      reference.references.length > 0
                        ? "font-semibold hover:text-[#6C5CE7]"
                        : ""
                    }`}
                  >
                    {reference.title}
                    {" - "}
                    <span className=" font-normal italic">
                      {reference.content_type_uid}
                    </span>
                  </span>
                </Tooltip>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {reference.references.map((r) => {
                  return (
                    <ReferenceDetailComponent
                      key={r.uniqueKey}
                      reference={r}
                      locale={locale}
                      isChild
                    />
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    );
  };

  React.useEffect(() => {
    if ((auth !== undefined && !isValid) || isRefreshingToken) {
      closeModal({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValid, isRefreshingToken]);
  return loading ? (
    <div className="p-5">
      <DefaultLoading
        progress={progress}
        title="Retrieving references..."
        showProgressBar
      />
    </div>
  ) : !isValid || isRefreshingToken ? (
    <DefaultLoading title="Authorizing..." />
  ) : (
    <div className="">
      {data && data.length > 0 && (
        <div className="grid grid-cols-5">
          <div className="p-4 m-1 col-span-2">
            <ReleaseOptions
              data={data}
              checkedReferences={checkedReferences}
              totalReferenceCount={totalReferenceCount}
              setDepthValue={updateDepthValue}
              depthValue={depthValue}
            />
          </div>
          <div className="p-2 m-1  col-span-3">
            <div className="max-h-[38rem] overflow-y-scroll pl-6 px-4 mb-4 pb-4">
              {totalReferenceCount > 0 ? (
                <div className="">
                  <h3 className="text-l pt-2">
                    References (
                    {totalReferenceCount > 0 ? totalReferenceCount : ""})
                  </h3>
                </div>
              ) : (
                <h3 className="text-l pb-2">No references selected</h3>
              )}
              {data
                .filter((ld) => checkedLocales[ld.locale])
                .map((localeData) => {
                  const localeName = locales?.find(
                    (l) => l.code === localeData.locale
                  )?.name;

                  const list = getUniqueReferenceKeys(
                    localeData.topLevelEntry.references,
                    [],
                    checkedReferences[localeData.locale]
                  );
                  let count = list.length;
                  if (
                    checkedReferences[localeData.locale] &&
                    Object.values(checkedReferences[localeData.locale]).some(
                      (v) => v === true
                    )
                  ) {
                    count++;
                  }

                  return (
                    <div
                      className="-mb-3 pl-2"
                      key={`${localeData.locale}_content`}
                    >
                      <Accordion title={`${localeName} (${count})`}>
                        <ReferenceDetailComponent
                          reference={localeData.topLevelEntry}
                          locale={localeData.locale}
                        />
                      </Accordion>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default References;
