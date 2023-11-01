"use client";

import AddAllReferencesSection from "./AddAllReferencesSection";
import CopyEntry from "./CopyEntry";
import DefaultLoading from "@/app/components/DefaultLoading";
import React from "react";
import SecurityOptions from "./SecurityOptions";
import useAuth from "@/app/hooks/oauth/useAuth";
import { useBranch } from "@/app/hooks/useBranch";

const ReferencesManagement = () => {
  const ref = React.useRef(null);

  const { branchReady } = useBranch();
  const { isRefreshingToken, canRefresh, isValid } = useAuth({
    from: "ReferencesManagement",
    autoRefresh: true,
  });

  //IFrame setup
  React.useEffect(() => {
    const iframeWrapperRef = ref.current;
    // @ts-ignore
    window.iframeRef = iframeWrapperRef;
  }, []);

  return (
    <div ref={ref}>
      {!isValid || isRefreshingToken || !branchReady ? (
        <DefaultLoading title={`${canRefresh ? "Authorizing..." : ""}`} />
      ) : (
        <div className="gap-y-2">
          <AddAllReferencesSection />
          <CopyEntry />
          <SecurityOptions />
        </div>
      )}
    </div>
  );
};

export default ReferencesManagement;
