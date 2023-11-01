import { includes } from "lodash";
import { useAppLocation } from "./useAppLocation";
import { useSdkDataByPath } from "./useSdkDataByPath";

/**
 * Returns the Iframe instance for the location
 * Works only for CustomField and Dashboard Widgets
 */
export const useFrame = (): null | object | unknown => {
  const { locationName } = useAppLocation();
  const availableFrameLocations: string[] = ["CustomField", "DashboardWidget"];

  if (!includes(availableFrameLocations, locationName)) {
    throw new Error(`useFrame hook cannot be used at ${locationName} location`);
  }
  const frame = useSdkDataByPath(`location.${locationName}`, null);
  return frame;
};
