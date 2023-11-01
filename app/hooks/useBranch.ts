import { get, isEmpty, keys } from "lodash";

import React from "react";
import { useAppSdk } from "./useAppSdk";

export const useBranch = (): { branch: any; branchReady: boolean } => {
  const appSdk = useAppSdk();
  const [branch, setBranch] = React.useState<any>(null);
  const [branchReady, setBranchReady] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (appSdk?.stack.getCurrentBranch()) {
      setBranch(() => {
        setBranchReady(true);
        return appSdk?.stack.getCurrentBranch();
      });
    } else {
      console.warn("No branch found");
    }
  }, [appSdk?.stack]);

  return { branch, branchReady };
};
