import {
  ReferenceDetailLite,
  ReferenceLocaleData,
} from "../components/sidebar/models/models";

import React from "react";
import { getUniqueReferenceKeys } from "../utils";

export interface UseReferencesProps {
  // data: ReferenceLocaleData[];
  // setData: React.Dispatch<React.SetStateAction<ReferenceLocaleData[]>>;
  checkedLocales: Record<string, boolean>;
  setCheckedLocales: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  checkedReferences: Record<string, Record<string, boolean>>;
  setCheckedReferences: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, boolean>>>
  >;
  openReferences: Record<string, Record<string, boolean>>;
  setOpenReferences: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, boolean>>>
  >;
  totalReferenceCount: number;
}
const getCheckedReferences = (reference: ReferenceDetailLite) => {
  const { references } = reference;

  const cr: Record<string, boolean> = {};

  references.forEach((r) => {
    cr[r.uniqueKey] = r.checked;
    if (r.references.length > 0) {
      const subCheckedReferences = getCheckedReferences(r);
      Object.keys(subCheckedReferences).forEach((k) => {
        cr[k] = subCheckedReferences[k];
      });
    }
  });
  return cr;
};
export const useReferences = ({
  data,
}: {
  data: ReferenceLocaleData[];
}): UseReferencesProps => {
  const [d, setData] = React.useState<ReferenceLocaleData[]>(data);
  const [checkedLocales, setCheckedLocales] = React.useState<
    Record<string, boolean>
  >({});
  const [checkedReferences, setCheckedReferences] = React.useState<
    Record<string, Record<string, boolean>>
  >({});
  const [openReferences, setOpenReferences] = React.useState<
    Record<string, Record<string, boolean>>
  >({});

  const getTotalReferenceCount = React.useCallback((): number => {
    let list: string[] = [];
    data.forEach((d) => {
      const uniqueReferenceKeys = getUniqueReferenceKeys(
        d.topLevelEntry.references,
        [],
        checkedReferences[d.locale]
      );

      const newList = [...uniqueReferenceKeys];
      if (
        checkedReferences[d.locale] &&
        Object.values(checkedReferences[d.locale]).some((v) => v === true)
      ) {
        newList.push(d.topLevelEntry.uniqueKey);
      }

      list.push(...newList);
    });

    return list.length;
  }, [checkedReferences, data]);

  React.useEffect(() => {
    if (!data || data.length === 0) return;
    let cl: Record<string, boolean> = {};
    let cr: Record<string, Record<string, boolean>> = {};
    let or: Record<string, Record<string, boolean>> = {};
    data.forEach((ld) => {
      const locale = ld.locale;
      const checked = ld.topLevelEntry.checked;
      cl[locale] = checked;
      cr[locale] = {
        ...{
          [ld.topLevelEntry.uniqueKey]: checked,
        },
        ...getCheckedReferences(ld.topLevelEntry),
      };

      const opposite = (input: Record<string, boolean>) => {
        const output: Record<string, boolean> = {};
        Object.keys(input).forEach((k) => {
          output[k] = !input[k];
        });
        return output;
      };
      or[locale] = {
        ...{
          [ld.topLevelEntry.uniqueKey]: false,
        },
        ...opposite(getCheckedReferences(ld.topLevelEntry)),
      };
    });

    setCheckedLocales(cl);
    setCheckedReferences(cr);
    setOpenReferences(or);
  }, [data]);

  return {
    // data: d,
    // setData,
    checkedReferences,
    setCheckedReferences,
    checkedLocales,
    setCheckedLocales,
    openReferences,
    setOpenReferences,
    totalReferenceCount: getTotalReferenceCount(),
  };
};
