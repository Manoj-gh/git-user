import { DefaultAxiosStrategy, RepeatStrategy } from "@/app/utils/axios";
import { debug, debugEnabled } from "@/app/utils";

import React from "react";
import useAuth from "./useAuth";
import { useBranch } from "../useBranch";
import { useEffect } from "react";

interface UseContentstackAxiosResult {
  strategy: RepeatStrategy;
  ready: boolean;
}

const useContentstackAxios = (): UseContentstackAxiosResult => {
  const { branch } = useBranch();
  const { auth, setAuth, syncRefresh, isValid } = useAuth({
    from: "useContentstackAxios",
  });
  const [strategy] = React.useState<RepeatStrategy>(new DefaultAxiosStrategy());
  const [ready, setReady] = React.useState<boolean>(false);

  useEffect(() => {
    if (!isValid || !branch?.api_key || !branch?.uid || !auth?.access_token) {
      setReady(false);
      return;
    }

    let requestIntercept: number;
    let responseIntercept: number;

    debug("Setting interceptors");

    requestIntercept = strategy.axiosInstance.interceptors.request.use(
      (config: any) => {
        if (config && config.headers) {
          config.headers["authorization"] = `Bearer ${auth?.access_token}`;
          config.headers["cs-api-key"] = branch?.api_key || "";
          config.headers["branch"] = branch?.uid || "";
          config.headers["region"] = sessionStorage.getItem("region") || "NA";

          if (debugEnabled) {
            console.log("Axios Request Intercept :: URL", config.url);
            console.log("Axios Request Intercept :: Headers", config.headers);
          }
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    responseIntercept = strategy.axiosInstance.interceptors.response.use(
      (response: any) => {
        return response;
      },
      async (error: any) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          console.log("Axios Response Intercept :: Access Error", error);
          prevRequest.sent = true;
          const data = await syncRefresh();
          await setAuth(data);
          prevRequest.headers["authorization"] = `Bearer ${data.access_token}`;
          return strategy.executeRequest(prevRequest);
        }
        return Promise.reject(error);
      }
    );
    setReady(true);

    return () => {
      if (requestIntercept >= 0 && responseIntercept >= 0) {
        debug("Removing interceptors");

        strategy.axiosInstance.interceptors.response.eject(responseIntercept);
        strategy.axiosInstance.interceptors.request.eject(requestIntercept);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, branch, isValid]);

  return {
    strategy,
    ready,
  };
};

export default useContentstackAxios;
