"use client";

import React, { Suspense } from "react";

import dynamic from "next/dynamic";

const AppConfigurationLocation = dynamic(
  () => import("./AppConfigurationLocation").then((mod) => mod.default),
  {
    ssr: false,
  }
);

const AppConfigurationPage = () => {
  return (
    <Suspense>
      <AppConfigurationLocation />
    </Suspense>
  );
};

export default AppConfigurationPage;
