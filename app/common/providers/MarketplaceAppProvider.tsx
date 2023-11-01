import MarketplaceAppContextType, {
  MarketplaceAppContext,
} from "../contexts/marketplaceContext";
import React, { useState } from "react";

import { AppFailed } from "../../components/AppFailed";
import ContentstackAppSDK from "@contentstack/app-sdk";
import DefaultLoading from "@/app/components/DefaultLoading";
import { KeyValueObj } from "@/app/types";
import UiLocation from "@contentstack/app-sdk/dist/src/uiLocation";
import { isNull } from "lodash";

type ProviderProps = {
  children?: React.ReactNode;
};

/**
 * Marketplace App Provider
 * @param children: React.ReactNode
 */
export const MarketplaceAppProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const [failed, setFailed] = useState<boolean>(false);
  const [appSdk, setAppSdk] = useState<UiLocation>();
  const [appConfig, setConfig] = useState<KeyValueObj | null>(null);
  // Initialize the SDK and track analytics event
  React.useEffect(() => {
    ContentstackAppSDK.init()
      .then(async (appSdk) => {
        // console.log("App SDK initialized", appSdk);
        setAppSdk(appSdk);
        const appConfig = await appSdk.getConfig();
        setConfig(appConfig);
      })
      .catch(() => {
        setFailed(true);
      });
  }, []);

  // wait until the SDK is initialized. This will ensure the values are set
  // correctly for appSdk.
  if (!failed && (isNull(appSdk) || isNull(appConfig))) {
    return <DefaultLoading title="Loading..." />;
  }

  if (failed) {
    return <AppFailed />;
  }
  const value: MarketplaceAppContextType = {
    appSdk,
    appConfig,
  };

  return (
    <MarketplaceAppContext.Provider value={value}>
      {children}
    </MarketplaceAppContext.Provider>
  );
};
