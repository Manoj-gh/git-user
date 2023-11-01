import { AppConfigurationExtensionContext, InstallationData } from "../contexts/appConfigurationExtensionContext";
import { useCallback, useEffect, useState } from "react";

import { isEmpty } from "lodash";
import { useAppLocation } from "@/app/hooks/useAppLocation";

export const AppConfigurationExtensionProvider = ({ children }: any) => {
  const [installationData, setInstallation] = useState<InstallationData>({
    configuration: {},
    serverConfiguration: {},
  });
  const [loading, setLoading] = useState<boolean>(false);
  const { location } = useAppLocation();

  useEffect(() => {
    if (!isEmpty(installationData)) return;
    setLoading(true);
    location.installation
      .getInstallationData()
      .then((data: InstallationData) => {
        setInstallation(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error(err);
      });
  }, [installationData, location, setLoading, setInstallation]);

  const setInstallationData = useCallback(
    async (data: { [key: string]: any }) => {
      setLoading(true);
      const newInstallationData: InstallationData = {
        configuration: { ...installationData.configuration, ...data },
        serverConfiguration: installationData.serverConfiguration,
      };
      await location.installation.setInstallationData(newInstallationData);
      setInstallation(newInstallationData);
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location, setInstallation, setLoading]
  );

  return (
    <AppConfigurationExtensionContext.Provider value={{ installationData, setInstallationData, loading }}>
      {children}
    </AppConfigurationExtensionContext.Provider>
  );
};
