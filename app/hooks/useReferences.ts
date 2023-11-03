import {
  IEntryReleaseInfo,
  ReferenceDetailLite,
  ReferenceLocaleData,
} from "../components/sidebar/models/models";

import React from "react";
import { getUniqueReferenceKeys } from "../utils";

export interface ReferenceData {
  checked: boolean;
  details: IEntryReleaseInfo;
}

export interface UseReferencesProps {
  // data: ReferenceLocaleData[];
  // setData: React.Dispatch<React.SetStateAction<ReferenceLocaleData[]>>;
  checkedLocales: Record<string, boolean>;
  setCheckedLocales: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;

  checkedReferences: Record<string, Record<string, ReferenceData>>;
  setCheckedReferences: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, ReferenceData>>>
  >;
  openReferences: Record<string, Record<string, boolean>>;
  setOpenReferences: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, boolean>>>
  >;
  totalReferenceCount: number;
}
const getCheckedReferences = (
  reference: ReferenceDetailLite,
  locale: string
) => {
  const { references } = reference;

  const cr: Record<string, ReferenceData> = {};
  references.forEach((r) => {
    cr[r.uniqueKey] = {
      checked: r.checked,
      details: {
        uid: r.uid,
        content_type_uid: r.content_type_uid,
        locale: locale,
        title: r.title,
        version: parseInt(r.version.toString()),
        action: "publish",
      },
    };
    if (r.references.length > 0) {
      const subCheckedReferences = getCheckedReferences(r, locale);
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
  const [checkedLocales, setCheckedLocales] = React.useState<
    Record<string, boolean>
  >({});
  const [checkedReferences, setCheckedReferences] = React.useState<
    Record<string, Record<string, ReferenceData>>
  >({});
  const [checkedReferences2, setCheckedReferences2] = React.useState<
    Record<string, Record<string, ReferenceData>>
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
        Object.values(checkedReferences[d.locale]).some(
          (v) => v.checked === true
        )
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
    let cr: Record<string, Record<string, ReferenceData>> = {};
    let or: Record<string, Record<string, boolean>> = {};
    data.forEach((ld) => {
      const locale = ld.locale;
      const checked = ld.topLevelEntry.checked;
      cl[locale] = checked;
      cr[locale] = {
        ...{
          [ld.topLevelEntry.uniqueKey]: {
            checked: checked,
            details: {
              uid: ld.topLevelEntry.uid,
              content_type_uid: ld.topLevelEntry.content_type_uid,
              locale: locale,
              title: ld.topLevelEntry.title,
              version: parseInt(ld.topLevelEntry.version.toString()),
              action: "publish",
            },
          },
        },
        ...getCheckedReferences(ld.topLevelEntry, locale),
      };

      const opposite = (input: Record<string, ReferenceData>) => {
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
        ...opposite(getCheckedReferences(ld.topLevelEntry, locale)),
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
