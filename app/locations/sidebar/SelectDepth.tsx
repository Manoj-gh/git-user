import React from "react";
import { Select } from "@contentstack/venus-components";

interface SelectDepthProps {
  onDepthSelected?: (v: any) => void;
  depthValue: any;
  disabled?: boolean;
}
const SelectDepth = ({
  onDepthSelected,
  depthValue,
  disabled,
}: SelectDepthProps) => {
  const [depth, setDepth] = React.useState(depthValue);
  const getDepthOptions = React.useCallback(() => {
    return Array.from(
      Array(
        process.env.NEXT_PUBLIC_CS_MAX_REF_DEPTH
          ? parseInt(process.env.NEXT_PUBLIC_CS_MAX_REF_DEPTH)
          : 5
      ).keys()
    ).map((i) => {
      return {
        label: (i + 1).toString(),
        value: i + 1,
      };
    });
  }, []);

  return (
    <div className="pb-2">
      <Select
        selectedLabel="Select Depth"
        className=""
        selectLabel="Depth"
        options={getDepthOptions() || []}
        value={depth}
        placeholder="Select Depth"
        onChange={(v: any) => {
          setDepth(() => {
            if (onDepthSelected) onDepthSelected(v);
            return v;
          });
        }}
        multiDisplayLimit={2}
        version="v2"
        isDisabled={disabled}
      ></Select>
    </div>
  );
};

export default SelectDepth;
