import { Button, cbModal } from "@contentstack/venus-components";

import { SelectLanguagesModal } from "./Configuration";

interface SelectLanguagesModalProps {
  validLocales?: string[];
  storageKey?: string;
  disabled?: boolean;
}
const SelectLanguagesButton = ({
  validLocales,
  storageKey,
  disabled,
}: SelectLanguagesModalProps) => {
  return (
    <Button
      isFullWidth
      buttonType="secondary"
      disabled={disabled}
      onClick={() => {
        cbModal({
          component: (props: any) => (
            <SelectLanguagesModal
              {...props}
              validLocales={validLocales}
              storageKey={storageKey}
            />
          ),
          modalProps: {
            size: "customSize",
            onClose: () => {},
          },
        });
      }}
    >
      Select Languages
    </Button>
  );
};

export default SelectLanguagesButton;
