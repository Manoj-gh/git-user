import {
  Accordion,
  Button,
  Field,
  Icon,
  Info,
  TextInput,
} from "@contentstack/venus-components";
import {
  AttToReleaseResult,
  MAX_ENTRIES_PER_RELEASE,
  useCsOAuthApi,
} from "@/app/components/sidebar/ContentstackOAuthApi";
import {
  showError,
  showErrorDetail,
  showSuccess,
} from "@/app/utils/notifications";

import DefaultLoading from "@/app/components/DefaultLoading";
import { KeyValueObj } from "@/app/types";
import MaxReferencesReached from "@/app/components/sidebar/MaxReferencesReached";
import React from "react";
import { ReferenceData } from "@/app/hooks/useReferences";
import { ReferenceLocaleData } from "@/app/components/sidebar/models/models";
import ReleasesList from "./ReleasesList";
import SelectDepth from "./SelectDepth";

interface ReleaseOptionsProps {
  data: ReferenceLocaleData[];
  checkedReferences: Record<string, Record<string, ReferenceData>>;
  totalReferenceCount: number;
  depthValue: any;
  setDepthValue: React.Dispatch<React.SetStateAction<any>>;
}

export const ReleaseOptions = ({
  checkedReferences,
  totalReferenceCount,
  data,
  depthValue,
  setDepthValue,
}: ReleaseOptionsProps) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const { createRelease, addToRelease, isReady } = useCsOAuthApi();

  const [releaseName, setReleaseName] = React.useState("");
  const [releaseDescription, setReleaseDescription] = React.useState("");
  const [canCreateRelease, setCanCreateRelease] = React.useState(false);
  const [canAddToRelease, setCanAddToRelease] = React.useState(false);
  const [reloadReleasesList, setReloadReleasesList] = React.useState(false);

  const [creatingRelease, setCreatingRelease] = React.useState(false);
  const [selectedRelease, setSelectedRelease] = React.useState<any>(null);

  //Check whether any references are checked so that we can enable the add to release button
  React.useEffect(() => {
    if (selectedRelease !== null) {
      if (
        checkedReferences &&
        Object.values(checkedReferences).some((v) => {
          return (
            v &&
            Object.values(v).some((v) => {
              return v.checked === true;
            })
          );
        })
      ) {
        setCanAddToRelease(true);
      } else {
        setCanAddToRelease(false);
      }
    } else {
      setCanAddToRelease(false);
    }
  }, [checkedReferences, selectedRelease]);

  //Check whether release name and description are empty so that we can enable the create button
  React.useEffect(() => {
    if (!isReady) return;
    if (releaseName !== undefined && releaseName !== "") {
      setCanCreateRelease(true);
    } else {
      setCanCreateRelease(false);
    }
  }, [releaseName, releaseDescription, isReady]);

  return loading ? (
    <DefaultLoading />
  ) : (
    <div className="w-full">
      <Accordion title="Releases" renderExpanded>
        <div className="grid grid-cols-1 gap-2 p-2">
          <div>
            <ReleasesList
              reload={reloadReleasesList}
              selectedRelease={selectedRelease}
              setSelectedRelease={setSelectedRelease}
            />
          </div>
          <div>
            <SelectDepth
              depthValue={depthValue}
              onDepthSelected={(v) => {
                setDepthValue(v);
              }}
            />
          </div>
          <div>
            <Button
              disabled={!canAddToRelease}
              onClick={() => {
                setLoading(true);
                addToRelease(
                  selectedRelease?.value || "",
                  data,
                  false,
                  checkedReferences
                )
                  .then((res: AttToReleaseResult) => {
                    if (res.errorDetails && res.errorDetails.length > 0) {
                      const errorDetail: KeyValueObj = {};
                      res.errorDetails.forEach((e) => {
                        const keys = Object.keys(e.errors);
                        keys.forEach((k) => {
                          if (errorDetail[k]) return;
                          const item = e.items.find((i) => i.uid === k);
                          const value = e.errors[k];
                          if (item?.title && item?.uid) {
                            errorDetail[
                              `${item?.title} [${item.uid}]`
                            ] = `${value.join(", ")}`;
                          }
                        });
                      });
                      showErrorDetail(
                        "Adding to release failed. Please enter valid data.",
                        errorDetail
                      );
                      console.log(
                        "Error Adding to Release: ",
                        res,
                        errorDetail
                      );
                    } else {
                      showSuccess("References added to Release Successfully");
                    }
                  })
                  .catch(() => {
                    showError("Error Adding to Release");
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
              icon={"PurpleAdd"}
              buttonType="primary"
              isFullWidth
            >
              Add
            </Button>
          </div>
          <MaxReferencesReached count={totalReferenceCount} />
        </div>
      </Accordion>
      <Accordion title="Create New Release" renderExpanded>
        <div className="pl-2">
          <div className="grid">
            <Field labelText="Name">
              <TextInput
                disabled={creatingRelease}
                onChange={(e: any) => {
                  setReleaseName(e.target.value);
                }}
                placeholder={"Release name..."}
              />
            </Field>
            <Field labelText="Description">
              <TextInput
                disabled={creatingRelease}
                onChange={(e: any) => {
                  setReleaseDescription(e.target.value);
                }}
                placeholder={"Release description..."}
              />
            </Field>
          </div>
          <div className="">
            <Button
              isFullWidth
              isLoading={creatingRelease}
              onClick={() => {
                setCreatingRelease(true);
                createRelease(releaseName, releaseDescription || "")
                  .then(() => {
                    showSuccess("Release Created Successfully");
                    setReloadReleasesList((prev) => !prev);
                  })
                  .catch((err: any) => {
                    showError(
                      `Error Creating Release. Status: ${err.response.status}`
                    );
                    console.log("Error Creating Release: ");
                  })
                  .finally(() => {
                    setCreatingRelease(false);
                  });
              }}
              buttonType="secondary"
              disabled={!canCreateRelease || creatingRelease}
            >
              Create Release
            </Button>
          </div>
        </div>
      </Accordion>
    </div>
  );
};
