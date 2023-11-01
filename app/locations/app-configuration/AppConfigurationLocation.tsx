"use client";

import AppConfiguration from "./AppConfiguration";
import { MarketplaceAppProvider } from "@/app/common/providers/MarketplaceAppProvider";

const AppConfigurationLocation = () => {
  return (
    <MarketplaceAppProvider>
      <AppConfiguration />
    </MarketplaceAppProvider>
  );
};

export default AppConfigurationLocation;
