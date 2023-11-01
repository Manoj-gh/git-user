import {
  Accordion,
  Button,
  Field,
  Icon,
  Info,
  InstructionText,
  TextInput,
  ToggleSwitch,
} from "@contentstack/venus-components";
import {
  COPY_ENTRY_SELECTIONS_STORAGE_KEY,
  ILocaleConfig,
} from "@/app/components/sidebar/models/models";
import { assetMapper, calculatePercentage } from "@/app/utils";
import { has, set } from "lodash";
import {
  showError,
  showErrorDetail,
  showMessage,
  showSuccess,
} from "@/app/utils/notifications";

import DefaultLoading from "@/app/components/DefaultLoading";
import { KeyValueObj } from "@/app/types";
import NoLocalesInfo from "@/app/components/sidebar/NoLocalesInfo";
import React from "react";
import SelectLanguagesButton from "./SelectLanguagesButton";
import { cleanEntryPayload } from "@/app/utils/data-utils";
import { fail } from "assert";
import { useBranch } from "@/app/hooks/useBranch";
import { useCsOAuthApi } from "@/app/components/sidebar/ContentstackOAuthApi";
import { useEntryChange } from "@/app/hooks/useEntryChange";
import useUserSelections from "@/app/hooks/useUserSelections";

interface CopyEntryProps {
  disabled?: boolean;
}

const CopyEntry = ({ disabled }: CopyEntryProps) => {
  const { branch } = useBranch();
  const [loading, setLoading] = React.useState(true);
  const [locales, setLocales] = React.useState<ILocaleConfig[]>([]);
  const { locales: copyLocales } = useUserSelections(
    COPY_ENTRY_SELECTIONS_STORAGE_KEY
  );

  const {
    getLocales,
    getEntryInLocale,
    createEntry,
    updateEntry,
    getEntryLocales,
    isReady,
  } = useCsOAuthApi();
  const { entry, contentTypeUid, currentLocale, loadingEntry } =
    useEntryChange();
  const [progress, setProgress] = React.useState(0);
  const [progressTitle, setProgressTitle] = React.useState("");
  const [showProgressBar, setShowProgressBar] = React.useState(true);
  const [localeCount, setLocaleCount] = React.useState(1);
  const [newEntryTitle, setNewEntryTitle] = React.useState("");
  const [mainLocale, setMainLocale] = React.useState("en-us");
  const [newEntryUid, setNewEntryUid] = React.useState("");
  const [copyName, setCopyName] = React.useState<string | undefined>(undefined);
  const [appendDate, setAppendDate] = React.useState(true);
  const [keepOriginalTitle, setKeepOriginalTitle] = React.useState(true);
  const [forceUrlUniqueness, setForceUrlUniqueness] = React.useState(true);

  const [validName, setValidName] = React.useState(false);
  const [isMasterEntry, setIsMasterEntry] = React.useState(true);
  const [validLocales, setValidLocales] = React.useState<string[]>([]);

  // Validate Copy Name
  React.useEffect(() => {
    if (copyName === undefined) {
      setValidName(false);
      return;
    }
    if (copyName && copyName.length >= 3) {
      setValidName(true);
    } else {
      setValidName(false);
    }
  }, [copyName]);
  // Master Locale to Copy Entries
  React.useEffect(() => {
    if (isReady && currentLocale && !disabled) {
      getLocales().then((response) => {
        const locales = response.data.locales;
        setLocales(locales);
        if (locales && locales.length > 0) {
          const masterLocale = locales.find((l) => l.fallback_locale === null);

          if (masterLocale) {
            const isMaster = masterLocale.code === currentLocale;
            setIsMasterEntry(isMaster);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, currentLocale, disabled]);

  React.useEffect(() => {
    if (
      disabled ||
      !isReady ||
      !entry ||
      !entry.uid ||
      !contentTypeUid ||
      !locales ||
      !(locales.length > 0) ||
      !branch ||
      !branch?.uid
    ) {
      setLoading(false);
      return;
    }
    async function getValidLocales(): Promise<string[]> {
      if (locales && isReady && !disabled) {
        const checkedLocales = locales.filter((l) => l.checked);
        checkedLocales.sort((a, b) => {
          if (a.fallback_locale === null && b.fallback_locale === null)
            return 0;
          if (a.fallback_locale === null) return -1;
          if (b.fallback_locale === null) return 1;
          return 0;
        });

        //Get entry locales
        const response = await getEntryLocales(entry.uid, contentTypeUid);
        const entryLocales = response?.data?.locales || [];
        //Check locales, if not localized, skip

        return entryLocales.filter((l) => l.localized).map((ll) => ll.code);
      }
      return [];
    }
    setLoading(true);
    getValidLocales()
      .then((vl) => {
        setValidLocales(() => {
          return vl;
        });
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.uid, contentTypeUid, locales, isReady, disabled]);

  React.useEffect(() => {
    setLocaleCount(() => {
      const newCount = copyLocales?.filter((l) => l.checked).length;
      return newCount ? newCount + 1 : 1;
    });
  }, [copyLocales]);

  const copyEntries = React.useCallback(async () => {
    //1. Iterate over selected locales
    if (
      !disabled &&
      locales &&
      locales.length > 0 &&
      isReady &&
      entry &&
      entry.uid &&
      contentTypeUid &&
      branch &&
      branch?.uid
    ) {
      setProgressTitle("Copying entries...");
      setProgress(0);
      setLoading(true);

      //1.1. Make sure master locale is first

      const checkedLocales = [
        ...locales.filter((l) => l.fallback_locale === null),
      ];
      if (copyLocales && copyLocales.length > 0) {
        checkedLocales.push(...copyLocales.filter((l) => l.checked));
      }
      checkedLocales.sort((a, b) => {
        if (a.fallback_locale === null && b.fallback_locale === null) return 0;
        if (a.fallback_locale === null) return -1;
        if (b.fallback_locale === null) return 1;
        return 0;
      });

      let newEntry: any = {};

      //Get entry locales
      const response = await getEntryLocales(entry.uid, contentTypeUid);
      const entryLocales = response?.data?.locales || [];
      //Check locales, if not localized, skip
      const localesToCopyInto = checkedLocales.filter((l) => {
        if (l.fallback_locale === null) {
          setMainLocale(l.code);
          return true;
        }
        const entryLocale = entryLocales.find((el: any) => el.code === l.code);
        return entryLocale.localized || false;
      });

      if (localesToCopyInto.length === 0) {
        showMessage(
          "Entry is not localized in any of the selected languages.",
          `${entryLocales
            .filter((l) => l.localized)
            .map((ll) => ll.code)
            .join(",")}.`
        );
        setLoading(false);
        return;
      }

      let copiedEntryUid = "";
      const failedEntries: string[] = [];
      for (let i = 0; i < localesToCopyInto.length; i++) {
        try {
          const locale = localesToCopyInto[i];
          setProgressTitle(`Copying entry in ${locale.name}...`);
          //Ensure that the entry is available in that locale
          const entryInLocale = await getEntryInLocale(
            entry.uid,
            contentTypeUid,
            locale.code
          );

          newEntry = entryInLocale.data.entry;
          assetMapper(newEntry);

          let newTitle = `** ${copyName}`;
          newTitle = keepOriginalTitle
            ? `${newTitle} [${newEntry.title}]`
            : newTitle;
          const datePortion = appendDate
            ? ` - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
            : "";

          const newTitleLength = newTitle.length;
          const datePortionLength = datePortion.length;
          const maxLength = 200 - datePortionLength - 1; //1 for space
          newTitle =
            newTitleLength > maxLength
              ? newTitle.substring(0, maxLength)
              : newTitle;

          newEntry.title = `${newTitle} ${datePortion}`;

          if (has(newEntry, "url")) {
            newEntry.url = `/copy-of${newEntry.url}${
              forceUrlUniqueness ? `${new Date().getTime()}` : ""
            }`;
          }

          cleanEntryPayload(newEntry);
          if (locale.fallback_locale === null) {
            setNewEntryTitle(newEntry.title);

            const response = await createEntry(
              contentTypeUid,
              newEntry,
              locale.code
            );

            if (response.data.error_code) {
              if (response.data.error_message) {
                if (response.data.errors) {
                  Object.keys(response.data.errors).forEach((key) => {
                    failedEntries.push(
                      ` ${locale.code} :: ${newEntry.title} - ${key} : ${response.data.errors[key]}`
                    );
                  });
                }
              }
            }

            if (response?.data?.entry?.uid) {
              copiedEntryUid = response.data.entry.uid; //We need it now
              setNewEntryUid(response.data.entry.uid); //This will be used later to open the entry
            }
          } else {
            const r = await updateEntry(
              contentTypeUid,
              copiedEntryUid,
              newEntry,
              locale.code
            );

            if (r.data.error_code) {
              if (r.data.error_message) {
                if (r.data.errors) {
                  Object.keys(r.data.errors).forEach((key) => {
                    failedEntries.push(
                      ` ${locale.code} :: ${newEntry.title} - ${key} : ${response.data.errors[key]}`
                    );
                  });
                }
              }
            }
          }
          setProgress((p) => {
            // return calculateProgress(p, localesToCopyInto.length);
            return p + 1;
          });
        } catch (e: any) {
          failedEntries.push(
            ` ${localesToCopyInto[i].code} :: ${newEntry.title}`
          );
          console.error(e);
        }
      }

      if (failedEntries.length > 0) {
        const theErrors: KeyValueObj = {
          Copy: `${failedEntries.join(", ")}.`,
        };
        if (fail.length === checkedLocales.length) {
          showErrorDetail("No locales were copied successfully", theErrors);
        } else {
          showErrorDetail(
            "Some locales were not copied successfully",
            theErrors
          );
        }
      } else {
        showSuccess("Entry copied successfully");
      }
      new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      showMessage("UI not ready, please try again.");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    entry.uid,
    contentTypeUid,
    locales,
    copyName,
    appendDate,
    branch,
    isReady,
    disabled,
  ]);

  return (
    <Accordion
      title="Localization"
      renderExpanded
      noChevron
      accordionLock={disabled}
    >
      {loading ? (
        <DefaultLoading title={progressTitle} progress={progress} />
      ) : validLocales && validLocales.length === 0 ? (
        <NoLocalesInfo />
      ) : (
        <div className="">
          <div className="">
            <div className="">
              <Field labelText="Name" className="">
                <div className="p-2">
                  <TextInput
                    disabled={!isMasterEntry}
                    placeholder="Name for the copied entries..."
                    value={copyName || ""}
                    onChange={(e: any) => {
                      setNewEntryTitle("");
                      const name = e.target.value;
                      setCopyName(name.length > 0 ? name : undefined);
                    }}
                    className="max-w-sm"
                    error={
                      isMasterEntry && !validName && copyName !== undefined
                    }
                  />
                  {isMasterEntry && !validName && (
                    <InstructionText>
                      Please provide at least a name 3 characters long
                    </InstructionText>
                  )}
                </div>
                <div className="px-2 py-1">
                  <ToggleSwitch
                    onClick={() => {
                      setAppendDate((a) => !a);
                    }}
                    label={"Append date string"}
                    checked={appendDate}
                    disabled={loading || !isMasterEntry}
                  />
                </div>
                <div className="px-2 py-1">
                  <ToggleSwitch
                    onClick={() => {
                      setKeepOriginalTitle((k) => !k);
                    }}
                    label={"Keep original title reference"}
                    checked={keepOriginalTitle}
                    disabled={loading || !isMasterEntry}
                  />
                </div>
                <div className="px-2 py-1">
                  <ToggleSwitch
                    onClick={() => {
                      setForceUrlUniqueness((f) => !f);
                    }}
                    label={"Force url uniqueness"}
                    checked={forceUrlUniqueness}
                    disabled={loading || !isMasterEntry}
                  />
                </div>
              </Field>
            </div>

            <div className="p-2">
              <SelectLanguagesButton
                disabled={!isMasterEntry}
                validLocales={validLocales}
                storageKey={COPY_ENTRY_SELECTIONS_STORAGE_KEY}
              />
            </div>

            <div className="p-2">
              <Button
                isFullWidth
                disabled={
                  !isMasterEntry ||
                  !validName ||
                  !locales ||
                  locales.length === 0
                }
                buttonType="primary"
                onClick={() => {
                  if (copyName === undefined) {
                    setValidName(false);
                  } else {
                    setNewEntryTitle("");
                    setShowProgressBar(true);
                    copyEntries()
                      .then(() => {
                        console.log("Entries copied successfully");
                        setCopyName(undefined);
                      })
                      .catch((e) => {
                        showError("Error copying entries");
                        setLoading(false);
                        console.error("Error copying entries: ", e);
                      });
                  }
                }}
              >
                Copy Entry in {localeCount} Locales
              </Button>
              {newEntryUid && (
                <div className="pt-2">
                  {newEntryTitle !== "" && (
                    <Button
                      isFullWidth
                      icon="LinkSmall"
                      disabled={!isMasterEntry}
                      buttonType="secondary"
                      // href={`https://app.contentstack.com/#!/stack/${branch.api_key}/content-type/${contentTypeUid}/${mainLocale}/entry/${newEntryUid}/edit?branch=${branch.uid}`}
                      onClick={() => {
                        window.open(
                          `https://app.contentstack.com/#!/stack/${branch.api_key}/content-type/${contentTypeUid}/${mainLocale}/entry/${newEntryUid}/edit?branch=${branch.uid}`,
                          "_blank"
                        );
                      }}
                    >
                      Open Copied Entry
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {!isMasterEntry && (
            <div className="p-2">
              <Info
                content={
                  <>
                    To copy an entry accross locales, you need to do so from its
                    master language:
                    <strong>
                      [{locales?.find((l) => l.fallback_locale === null)?.name}]
                    </strong>
                  </>
                }
                icon={<Icon icon="InfoCircleWhite" />}
                type="light"
              />
            </div>
          )}
        </div>
      )}
    </Accordion>
  );
};

export default CopyEntry;
