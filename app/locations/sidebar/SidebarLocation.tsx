"use client";

import { MarketplaceAppProvider } from "@/app/common/providers/MarketplaceAppProvider";
import React from "react";
import ReferencesManagement from "./ReferencesManagement";
import RequireOAuthToken from "@/app/components/oauth/RequireOAuthToken";
import SecurityOptions from "./SecurityOptions";

const SidebarLocation = () => {
  return (
    <MarketplaceAppProvider>
      <RequireOAuthToken>
        <ReferencesManagement />
      </RequireOAuthToken>
    </MarketplaceAppProvider>
  );
};

export default SidebarLocation;
