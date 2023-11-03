import {
  IEntryReleaseInfo,
  ReferenceDetailLite,
  ReferenceLocaleData,
} from "../components/sidebar/models/models";
import { omit, omitBy, remove, unset } from "lodash";

import { ReferenceData } from "../hooks/useReferences";
import { release } from "os";

export const getReleaseInfo = (
  checkedReferences: Record<string, Record<string, ReferenceData>>,
  allReferences: boolean,
  info: IEntryReleaseInfo[] = []
): IEntryReleaseInfo[] => {
  const releaseInfo: IEntryReleaseInfo[] = info ?? [];

  Object.keys(checkedReferences).forEach((locale) => {
    const references = checkedReferences[locale];
    Object.keys(references).forEach((key) => {
      const reference = references[key];
      if (allReferences || reference.checked) {
        releaseInfo.push({
          ...reference.details,
          content_type_uid:
            reference.details.content_type_uid === "asset"
              ? "built_io_upload"
              : reference.details.content_type_uid,
        });
      }
    });
  });
  return releaseInfo;
};

// const getReleaseInfoRecursive = (
//   locale: string,
//   references: ReferenceDetailLite[],
//   allReferences: boolean,
//   checkedReferences: Record<string, Record<string, ReferenceData>>,
//   info: IEntryReleaseInfo[] = []
// ): IEntryReleaseInfo[] => {
//   const releaseInfo: IEntryReleaseInfo[] = info.length > 0 ? [...info] : [];
//   if (!references || references.length === 0) return releaseInfo;
//   references.forEach((r) => {
//     //AVOID DUPLICATES
//     if (!info.some((ri) => ri.uid === r.uid && ri.locale === locale)) {
//       const checked = allReferences || checkedReferences[locale][r.uniqueKey];
//       if (checked) {
//         releaseInfo.push({
//           uid: r.uid,
//           version: parseInt(r.version.toString()),
//           locale: locale,
//           content_type_uid:
//             r.content_type_uid === "asset"
//               ? "built_io_upload"
//               : r.content_type_uid,
//           action: "publish",
//           title: r.title,
//         });
//       }
//     }
//     if (r.references && r.references.length > 0) {
//       releaseInfo.push(
//         ...getReleaseInfoRecursive(
//           locale,
//           r.references,
//           allReferences,
//           checkedReferences,
//           releaseInfo
//         )
//       );
//     }
//   });
//   return releaseInfo;
// };

export const cleanEntryPayload = (entry: any) => {
  unset(entry, "created_at");
  unset(entry, "updated_at");
  unset(entry, "created_by");
  unset(entry, "updated_by");
  unset(entry, "ACL");
  unset(entry, "_metadata");
  unset(entry, "_version");
  unset(entry, "_in_progress");
};
