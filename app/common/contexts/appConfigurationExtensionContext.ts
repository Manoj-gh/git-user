import React from "react";

export type InstallationData = {
  configuration: { [key: string]: any };
  serverConfiguration: { [key: string]: any };
};

export type AppConfigurationExtensionContextType = {
  installationData: InstallationData;
  setInstallationData: (installationData: InstallationData) => void;
  loading: boolean;
};

/**
 * Context to store the installation data for the app.
 */
export const AppConfigurationExtensionContext =
  React.createContext<AppConfigurationExtensionContextType>({
    installationData: {
      configuration: {},
      serverConfiguration: {},
    },
    setInstallationData: () => {},
    loading: false,
  });
