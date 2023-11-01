import { FetchRepeatStrategy } from "./fetch";
import { debug } from ".";

const INITIAL_DELAY = process.env.NEXT_PUBLIC_CS_RETRY_INITIAL_DELAY
  ? parseInt(process.env.NEXT_PUBLIC_CS_RETRY_INITIAL_DELAY)
  : 200;
debug("FetchPlusStrategy :: INITIAL_DELAY", INITIAL_DELAY);
const fetchPlus = async (
  infoOrUrl: RequestInfo | URL,
  options = {},
  retries: number,
  currentRetryCount: number = 0
): Promise<any> =>
  fetch(infoOrUrl, options)
    .then(async (res) => {
      if (res.ok) {
        return res.json();
      }
      if (res.status === 429) {
        console.log(`Error fetching data on attempt #${currentRetryCount}...`);
        if (retries > 0) {
          currentRetryCount++;
          console.log("Waiting...", currentRetryCount * 250, "ms");
          await new Promise((resolve) =>
            setTimeout(resolve, currentRetryCount * 250)
          );
          console.log("Retrying...");
          return fetchPlus(infoOrUrl, options, retries - 1, currentRetryCount);
        }
      }
      console.error(
        "Error executing request, not a 429",
        res.status,
        res.statusText
      );
      return res.json();
    })
    .catch((error) => console.error(error.message));

export const FetchPlusStrategy = class implements FetchRepeatStrategy {
  async executeRequest(infoOrUrl: RequestInfo | URL, config?: RequestInit) {
    const retries = process.env.NEXT_PUBLIC_CS_MAX_RESTRIES
      ? parseInt(process.env.NEXT_PUBLIC_CS_MAX_RESTRIES)
      : 5;
    debug("FetchPlusStrategy :: MAX RETRIES", retries);
    return fetchPlus(infoOrUrl, config, retries);
  }
};

export default fetchPlus;
