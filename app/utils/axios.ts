import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import { API_HOST } from "../hooks/oauth/constants";
import { debug } from "./index";

export default axios.create({
  baseURL: API_HOST,
});

export interface RepeatStrategy {
  attempts: number;
  initialDelay: number;
  resolveDelay: (attempt: number) => number;
  axiosInstance: AxiosInstance;
  executeRequest: (url: string, config?: AxiosRequestConfig) => Promise<any>;
}

export const DefaultAxiosStrategy = class implements RepeatStrategy {
  attempts: number;
  initialDelay: number;
  resolveDelay: (attempt: number) => number;
  axiosInstance: AxiosInstance;
  apiHost: string = API_HOST;

  constructor() {
    this.attempts = 5;
    this.initialDelay = 250;
    this.resolveDelay = (attempt: number) => {
      return this.initialDelay * attempt;
    };
    this.axiosInstance = axios.create({
      baseURL: API_HOST,
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
  }
  async executeRequest(url: string, config?: AxiosRequestConfig) {
    let response: any = {};
    for (let i = 0; i < this.attempts; i++) {
      debug("Call #", i + 1, "to", url);

      try {
        response = await this.axiosInstance(url, {
          ...config,
        });
        break;
      } catch (error: any) {
        //Only throw the error if it's not a 429, otherwise wait and try again.
        if (i === this.attempts - 1 && error?.response?.status !== 429) {
          console.error(
            "Unable to execute request after 5 attempts, or because it's not a rate limit problem."
          );
          console.error(error);
          throw error;
        }
        console.warn("Error executing request, waiting and trying again...");
        await new Promise((resolve) =>
          setTimeout(resolve, this.resolveDelay(i))
        );
      }
    }
    return response;
  }
};
