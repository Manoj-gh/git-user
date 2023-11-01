"use client";

import AuthorizeButton from "../../components/AuthorizeButton";
import DefaultLoading from "../DefaultLoading";
import React from "react";
import SecurityOptions from "@/app/locations/sidebar/SecurityOptions";
import { auto } from "@popperjs/core";
import useAuth from "../../hooks/oauth/useAuth";

const RequireOAuthToken = ({ children }: { children: React.ReactNode }) => {
  const { isValid, isRefreshingToken, canRefresh, expiresOn } = useAuth({
    autoRefresh: true,
    from: "RequireOAuthToken",
  });

  return (
    <>
      {isValid ? (
        <div>{children}</div>
      ) : canRefresh || isRefreshingToken ? (
        <DefaultLoading title={"Authorizing..."} />
      ) : (
        <div className="p-4">
          <SecurityOptions renderExpanded />
        </div>
      )}
    </>
  );
};

export default RequireOAuthToken;
