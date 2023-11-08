"use client";

import dynamic from "next/dynamic";

const OAuthCallback = dynamic(
  () =>
    import("../../hooks/oauth/useOAuth2Token").then((mod) => mod.OAuthCallback),
  {
    ssr: false,
  }
);

const Callback = () => {
  return <OAuthCallback />;
};

export default Callback;
