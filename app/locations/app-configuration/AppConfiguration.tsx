"use client";

import { Icon, Info } from "@contentstack/venus-components";

import React from "react";

const CONFIGURATION_NAME = "Tools Configuration";

const AppConfiguration = () => {
  return (
    <div className="p-10">
      <div className="app-config">
        <div className="app-config-container">
          <div className="flex-row gap-2">
            <Info
              content={
                <>
                  No configuration is requried.
                  <br />
                  <br />
                  Application setings are handled using environment variables.
                  Make sure your environment variables are set correctly in your
                  application.
                  <br />
                  <br />
                  If you are using Launch, you can set the environment variables
                  in the environment configuration section.
                </>
              }
              icon={<Icon icon="InfoCircleWhite" />}
              type="light"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppConfiguration;
