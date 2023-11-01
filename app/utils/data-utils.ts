import {
  IEntryReleaseInfo,
  ReferenceDetailLite,
  ReferenceLocaleData,
} from "../components/sidebar/models/models";
import { omit, omitBy, remove, unset } from "lodash";

export const getReleaseInfo = (
  data: ReferenceLocaleData[],
  checkedReferences: Record<string, Record<string, boolean>>,
  allReferences: boolean
): IEntryReleaseInfo[] => {
  const releaseInfo: IEntryReleaseInfo[] = [];
  data.forEach((d) => {
    const { locale, topLevelEntry } = d;

    if (!allReferences && !checkedReferences[locale]) return;
    if (allReferences || topLevelEntry.checked) {
      const topLevelEntryReleaseInfo: IEntryReleaseInfo = {
        uid: topLevelEntry.uid,
        version: parseInt(topLevelEntry.version.toString()),
        locale: locale,
        content_type_uid:
          topLevelEntry.content_type_uid === "asset"
            ? "built_io_upload"
            : topLevelEntry.content_type_uid,
        action: "publish",
        title: topLevelEntry.title,
      };
      releaseInfo.push(topLevelEntryReleaseInfo);
    }
    releaseInfo.push(
      ...getReleaseInfoRecursive(
        locale,
        topLevelEntry.references,
        allReferences,
        checkedReferences
      )
    );
  });

  return releaseInfo;
};

const getReleaseInfoRecursive = (
  locale: string,
  references: ReferenceDetailLite[],
  allReferences: boolean,
  checkedReferences: Record<string, Record<string, boolean>>
): IEntryReleaseInfo[] => {
  const info: IEntryReleaseInfo[] = [];
  if (!references || references.length === 0) return info;
  references.forEach((r) => {
    const checked = allReferences || checkedReferences[locale][r.uniqueKey];
    if (checked) {
      info.push({
        uid: r.uid,
        version: parseInt(r.version.toString()),
        locale: locale,
        content_type_uid:
          r.content_type_uid === "asset"
            ? "built_io_upload"
            : r.content_type_uid,
        action: "publish",
        title: r.title,
      });
    }
    if (r.references && r.references.length > 0) {
      info.push(
        ...getReleaseInfoRecursive(
          locale,
          r.references,
          allReferences,
          checkedReferences
        )
      );
    }
  });
  return info;
};

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
