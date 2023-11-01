import { KeyValueObj } from "@/app/types";
import React from "react";
import UiLocation from "@contentstack/app-sdk/dist/src/uiLocation";

interface MarketplaceAppContextType {
  appSdk?: UiLocation;
  appConfig: KeyValueObj | null;
}
export default MarketplaceAppContextType;

/**
 * Context to store the app state.
 */
export const MarketplaceAppContext =
  React.createContext<MarketplaceAppContextType>({
    appSdk: undefined,
    appConfig: null,
  });
