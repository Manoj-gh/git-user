"use client";

import { has, isEmpty } from "lodash";

import { KeyValueObj } from "../../types";
import { REFRESH_TOKEN_URL } from "./constants";
import React from "react";
import { TOKEN_STORAGE_KEY } from "@/app/components/sidebar/models/models";
import axios from "@/app/utils/axios";
import { debug } from "@/app/utils";
import useAppStorage from "../useAppStorage";

export const AUTH_KEY = "csat";

interface UseAuthProps {
  from: string;
  autoRefresh?: boolean;
}

const useAuth = (props?: UseAuthProps) => {
  const { autoRefresh = false, from } = props || {};

  const {
    value: auth,
    store: setAuth,
    reset: resetAuth,
    delete: deleteAuth,
    storeInProgress,
  } = useAppStorage<KeyValueObj>(TOKEN_STORAGE_KEY);

  const [isRefreshingToken, setIsRefreshingToken] = React.useState(false);

  const isValidData = React.useCallback(() => {
    if (isEmpty(auth)) return false;
    return (
      has(auth, "access_token") &&
      has(auth, "refresh_token") &&
      has(auth, "expires_at")
    );
  }, [auth]);

  const isValid = React.useCallback(() => {
    return isValidData() && Date.now() < new Date(auth?.expires_at).getTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const isExpired = React.useCallback(() => {
    return isValidData() && Date.now() > new Date(auth?.expires_at).getTime();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const expiresOn = React.useCallback(() => {
    if (!auth?.expires_at) return "Already Expired or Not Set";
    const date = new Date(auth?.expires_at);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }, [auth]);

  const canRefresh = React.useCallback(() => {
    return isValidData() && isExpired();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const asyncRefresh = React.useCallback(
    (force?: boolean) => {
      if (!auth || !auth?.refresh_token) return;
      if ((!storeInProgress && canRefresh()) || force) {
        setIsRefreshingToken(true);
        axios
          .post(REFRESH_TOKEN_URL, {
            refreshToken: auth?.refresh_token,
          })
          .then((response) => {
            if (response.data.statusCode && response.data.statusCode !== 200) {
              resetAuth()
                .then(() => {
                  setIsRefreshingToken(false);
                })
                .catch((err) => {
                  console.log("setAuthErr", err);
                });
            } else {
              setAuth(response.data)
                .then(() => {
                  setIsRefreshingToken(false);
                })
                .catch((err) => {
                  console.log("setAuthErr", err);
                });
            }
          })
          .catch(() => {
            setIsRefreshingToken(false);
            resetAuth().then(() => {});
          })
          .finally(() => {});
      } else {
        setIsRefreshingToken(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [auth, canRefresh, setAuth]
  );

  const syncRefresh = React.useCallback(async () => {
    if (!storeInProgress && canRefresh()) {
      try {
        setIsRefreshingToken(true);

        const region = sessionStorage.getItem("region") || "NA";
        const key = `code_verifier_${region}`;
        const code_verifier = localStorage.getItem(key);
        const response = await axios.post(REFRESH_TOKEN_URL, {
          refreshToken: auth?.refresh_token,
          code_verifier,
        });
        setIsRefreshingToken(false);
        return response.data;
      } catch (err) {
        return undefined;
      }
    } else {
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.refresh_token, canRefresh]);

  //Auto refresh
  React.useEffect(() => {
    if (!autoRefresh || !auth || !isValidData()) return;

    debug(`Auth Verification :: ${from} :: `, isValid(), expiresOn());

    if (!isValid()) {
      asyncRefresh(true);
    }
    const interval = setInterval(() => {
      debug(`Auth Verification :: ${from} :: `, isValid(), expiresOn());

      if (!isValid()) {
        asyncRefresh(true);
      }
    }, 5000);
    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const result = {
    auth,
    setAuth,
    resetAuth,
    deleteAuth,
    isValid: isValid(),
    canRefresh: !storeInProgress && !isRefreshingToken && canRefresh(),
    asyncRefresh,
    syncRefresh,
    isRefreshingToken,
    expiresOn: expiresOn(),
  };

  return result;
};

export default useAuth;
