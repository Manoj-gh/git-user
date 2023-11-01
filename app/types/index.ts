import { IInstallationData } from "@contentstack/app-sdk/dist/src/types";

export interface KeyValueObj {
  [key: string]: any;
}

export interface TypeAppSdkConfigState {
  installationData: IInstallationData;
  setInstallationData: (event: any) => any;
  appSdkInitialized: boolean;
}

export interface TypeSDKData {
  config: any;
  location: any;
  appSdkInitialized: boolean;
}

export interface SelectValue {
  label: string;
  value: string | number;
}
