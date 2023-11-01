import {
  ModalProps,
  ReturnCbModalProps,
} from "@contentstack/venus-components/build/components/Modal/Modal";

import { KeyValueObj } from "../../../types";

export const ASSET_REGEXP: RegExp =
  /"url":[\s:]+"https:\/\/images.contentstack.io\/v3\/assets\/[a-z0-9]+\/([a-z0-9]+)\//gm;
export const REF_REGEXP: RegExp =
  /"uid":[\s]+"(.*)",[\s]+"_content_type_uid":[\s]+"(.*)"/gm;

export interface IAppConfiguration extends KeyValueObj {}

export interface IProgress {
  percentage: number;
  current: number;
  total: number;
  label?: string;
}
export interface ICheckable extends Record<string, any> {
  name: string;
  checked: boolean;
}

export interface Selections {
  [key: string]: Selection;
}

export interface IEnvironmentConfig extends ICheckable {
  uid: string;
}
export interface ILocaleConfig extends ICheckable {
  code: string;
  fallback_locale: boolean;
  name: string;
}

export interface ILog {
  message: string;
  type: "error" | "info" | "warning";
}
export interface IPublishData {
  key: string;
  uid: string;
  isAsset: boolean;
}
export interface AppContext {}

export interface IBaseItem {
  id: string;
}

export interface IProcessedItem extends IBaseItem {
  completed: boolean;
}
export interface IReference {
  uniqueKey: string;
  uid: string;
  isAsset: boolean;
  content_type_uid?: string;
  entry: any;
  references?: string[];
  locales?: any;
  locale: string;
  parent?: string;
  depth?: number;
}

export interface ReferenceDetailLite {
  uid: string;
  checked: boolean;
  uniqueKey: string;
  content_type_uid: string;
  title: string;
  references: ReferenceDetailLite[];
  isAsset: boolean;
  version: string | number;
}

export interface ReferenceResult {
  data: ReferenceDetailLite[];
  objAsString: string;
}

export interface ReferenceLocaleData {
  locale: string;
  checked: boolean;
  topLevelEntry: ReferenceDetailLite;
}
export interface IStatus {
  success: boolean;
  payload: any;
}
export interface IPublishStatus {
  uid: string;
  content_type_uid?: string;
  status: IStatus;
}

export interface ReferenceTree {
  [key: string]: IReference;
}

export interface IDictionary<T> {
  [key: string]: T;
}

export enum OPERATIONS {
  NONE = 0,
  PUBLISHING = 1,
  CREATE_RELEASE = 2,
  CREATING_RELEASE = 3,
  ADD_TO_RELEASE = 4,
  ADDING_TO_RELEASE = 5,
  REFRESHING_OAUTH_TOKEN = 6,
  LOADING_REFERENCES = 100,
}

export const ADD_REFERENCES_SELECTIONS_STORAGE_KEY =
  "@secure-storage.csselections";
export const TOKEN_STORAGE_KEY = "@secure-storage.csat";
export const COPY_ENTRY_SELECTIONS_STORAGE_KEY =
  "@secure-storage.cscopyentryselections";

export interface UserSelections {
  locales: ILocaleConfig[];
}

export type CsModalProps = ModalProps & ReturnCbModalProps;

export interface ReferenceCheck {
  checked: boolean;
  children: Record<string, ReferenceCheck>;
}

export interface IEntryReleaseInfo {
  uid: string;
  title: string;
  version: number;
  locale: string;
  content_type_uid?: string;
  action: "publish" | "unpublish";
}
