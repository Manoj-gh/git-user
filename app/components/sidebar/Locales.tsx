"use client";

import {
  ADD_REFERENCES_SELECTIONS_STORAGE_KEY,
  ILocaleConfig,
  UserSelections,
} from "./models/models";
import {
  Accordion,
  Button,
  Checkbox,
  Icon,
  Info,
  ToggleSwitch,
} from "@contentstack/venus-components";
import { has, isEmpty } from "lodash";

import DefaultLoading from "../DefaultLoading";
import NoLocalesInfo from "./NoLocalesInfo";
import React from "react";
import useAppStorage from "@/app/hooks/useAppStorage";
import { useCsOAuthApi } from "./ContentstackOAuthApi";

interface LocalesProps {
  storageKey?: string;
  validLocales?: string[];
  closeModal: (data?: any) => void;
}
const DEFAULT_LOADER_TITLE = "Loading Language Selections...";
function Locales({ validLocales, storageKey, closeModal }: LocalesProps) {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingTitle, setLoadingTitle] =
    React.useState<string>(DEFAULT_LOADER_TITLE);
  const { getLocales, isReady } = useCsOAuthApi();
  const [locales, setLocales] = React.useState<ILocaleConfig[]>([]);

  const {
    value: selections,
    store: setSelections,
    storeInProgress,
  } = useAppStorage<UserSelections>(
    storageKey || ADD_REFERENCES_SELECTIONS_STORAGE_KEY
  );

  React.useEffect(() => {
    if (!isReady || (selections !== undefined && isEmpty(selections))) return;
    setLoading(true);
    getLocales()
      .then((response) => {
        setLocales(() => {
          const newLocales = [
            ...response.data.locales.filter((l) => {
              if (validLocales) {
                return validLocales.includes(l.code);
              }
              return true;
            }),
          ];
          if (
            !selections ||
            !has(selections, "locales") ||
            isEmpty(selections?.locales)
          ) {
            setLoading(false);
            return newLocales;
          }
          selections.locales.forEach((l: ILocaleConfig) => {
            const index = newLocales.findIndex((nl) => nl.code === l.code);
            if (index > -1) {
              newLocales[index].checked = l.checked;
            }
          });
          setLoading(false);
          return newLocales;
        });
      })
      .catch((error) => {
        console.error("Error getting locales");
      });
  }, [selections, isReady]);

  return loading ? (
    <DefaultLoading title={loadingTitle} />
  ) : (
    <Accordion title={`Languages`} renderExpanded>
      {loading && storeInProgress && (
        <DefaultLoading title={"Saving selections..."} />
      )}
      <div key="locales" className="">
        <div className="flex flex-col">
          <div key="locale_all" className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 pl-2">
              {validLocales && validLocales.length === 0 && <NoLocalesInfo />}
              {locales &&
                locales.length > 0 &&
                locales.map((locale: ILocaleConfig, index: number) => {
                  return (
                    <div key={locale.code} className="pl-2 pb-2">
                      <Checkbox
                        onClick={() => {
                          setLocales((prevLocales) => {
                            const newLocales = [...prevLocales];
                            newLocales[index].checked =
                              !newLocales[index].checked;
                            return newLocales;
                          });
                        }}
                        label={locale.name}
                        checked={locales[index].checked}
                        isButton={false}
                        isLabelFullWidth={false}
                        disabled={loading}
                      />
                    </div>
                  );
                })}
            </div>
          </div>
          {(validLocales === undefined || validLocales.length > 0) && (
            <>
              <div className="flex flex-row pt-2">
                <div className="pl-2 pb-2">
                  <ToggleSwitch
                    disabled={!locales || loading}
                    onClick={() => {
                      setLocales((prevLocales) => {
                        const newLocales = [...prevLocales];
                        const selectAll = !newLocales.every(
                          (l) => l.checked === true
                        );
                        newLocales.forEach((l) => {
                          l.checked = selectAll;
                        });
                        return newLocales;
                      });
                    }}
                    label={"Select All"}
                    checked={locales?.every((l: any) => l.checked)}
                  />
                </div>
              </div>
              <div className="p-2">
                <Button
                  buttonType="secondary"
                  isLoading={loading}
                  isFullWidth
                  onClick={() => {
                    setSelections({
                      locales: locales,
                    }).then(() => {
                      closeModal();
                    });
                  }}
                  icon="RefreshCircleThin"
                >
                  Save & Close
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Accordion>
  );
}
export default Locales;
