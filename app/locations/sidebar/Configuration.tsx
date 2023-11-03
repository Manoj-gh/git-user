"use client";

import {
  Icon,
  Info,
  ModalHeader,
} from "@contentstack/venus-components";

import {
  CsModalProps,
} from "@/app/components/sidebar/models/models";
import Locales from "@/app/components/sidebar/Locales";
import { MarketplaceAppProvider } from "@/app/common/providers/MarketplaceAppProvider";
import React from "react";
import SelectLanguagesButton from "./SelectLanguagesButton";
import useUserSelections from "@/app/hooks/useUserSelections";

export interface SelectLanguagesProps {
  validLocales?: string[];
  disabled?: boolean;
}
const SelectLanguages = ({ disabled }: SelectLanguagesProps) => {
  const { locales } = useUserSelections();
  return (
    <div className="px-2">
      <div className="">
        <SelectLanguagesButton disabled={disabled} />
        <div className="pt-2">
          {!locales?.some((l) => l.checked) && (
            <Info
              content={
                <>
                  {!locales?.some((l) => l.checked) && (
                    <div>No Languages have been selected.</div>
                  )}
                </>
              }
              icon={<Icon icon="InfoCircleWhite" />}
              type="attention"
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface SelectLanguagesModalProps extends CsModalProps {
  validLocales?: string[];
  storageKey?: string;
}

export const SelectLanguagesModal = ({
  validLocales,
  storageKey,
  closeModal,
}: SelectLanguagesModalProps) => {
  return (
    <MarketplaceAppProvider>
      <div className="h-[46vh]">
        <ModalHeader title={`Select Languages`} closeModal={closeModal} />
        <div className="h-[40vh] p-4 overflow-y-scroll">
          <div className="grid grid-cols-1 divide-x">
            <div className="pb-5">
              <Locales
                validLocales={validLocales}
                storageKey={storageKey}
                closeModal={closeModal}
              />
            </div>
          </div>
        </div>
      </div>
    </MarketplaceAppProvider>
  );
};
export default SelectLanguages;
