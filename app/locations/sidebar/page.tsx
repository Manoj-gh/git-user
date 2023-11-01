"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const SidebarLocation = dynamic(() => import("./SidebarLocation").then((mod) => mod.default), { ssr: false });

const SidebarPage = async () => {
  return (
    <Suspense>
      <SidebarLocation />
    </Suspense>
  );
};

export default SidebarPage;
