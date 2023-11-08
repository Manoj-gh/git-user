"use client";

import {
  CsModalProps,
  ReferenceLocaleData,
} from "@/app/components/sidebar/models/models";

import { MarketplaceAppProvider } from "@/app/common/providers/MarketplaceAppProvider";
import { ModalHeader } from "@contentstack/venus-components";
import React from "react";
import References from "../References";

interface AdvancedOptionsModalProps extends CsModalProps {
  entryUid: string;
  contentTypeUid: string;
  loadedData: ReferenceLocaleData[];
  depth: number;
}
const AdvancedOptionsModal = ({
  depth,
  contentTypeUid,
  entryUid,
  closeModal,
  loadedData,
}: AdvancedOptionsModalProps) => {
  return (
    <MarketplaceAppProvider>
      <div>
        <div className="w-[50vw]">
          <div className="flex-row">
            <ModalHeader title={`Advanced Options`} closeModal={closeModal} />
          </div>
          <div className="h-[49vh] overflow-y-scroll">
            <References
              depth={depth}
              contentTypeUid={contentTypeUid}
              entryUid={entryUid}
              loadedData={loadedData}
              closeModal={closeModal}
            />
          </div>
        </div>
      </div>
    </MarketplaceAppProvider>
  );
};
export default AdvancedOptionsModal;
