"use client";

import { Button, cbModal } from "@contentstack/venus-components";

import AdvancedOptionsModal from "./modals/AdvancedOptionsModal";
import React from "react";
import { useBranch } from "@/app/hooks/useBranch";
import { useEntryChange } from "@/app/hooks/useEntryChange";
import useUserSelections from "@/app/hooks/useUserSelections";

interface ActionsProps {
  loading: boolean;
}

const Actions = ({ loading }: ActionsProps) => {
  const { branch } = useBranch();
  const { locales } = useUserSelections();
  const { entry, contentTypeUid } = useEntryChange();

  return (
    <div>
      <div className="">
        <div className="">
          <Button
            isFullWidth
            buttonType="secondary"
            disabled={locales?.every((l: any) => !l.checked) || !branch?.uid}
            onClick={() => {
              cbModal({
                component: (props: any) => (
                  <AdvancedOptionsModal
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
      </div>
    </div>
  );
};

export default Actions;
