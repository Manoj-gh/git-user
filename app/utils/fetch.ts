export interface FetchRepeatStrategy {
  executeRequest: (
    infoOrUrl: RequestInfo | URL,
    config?: RequestInit
  ) => Promise<any>;
}

export const DefaultFetchRepeatStrategy = class implements FetchRepeatStrategy {
  attempts: number;
  initialDelay: number;
  resolveDelay: (attempt: number) => number;

  constructor() {
    this.attempts = 5;
    this.initialDelay = 250;
    this.resolveDelay = (attempt: number) => {
      console.warn(
        `Attempt #${attempt + 1} failed, waiting ${
          this.initialDelay * (attempt + 1)
        }...`
      );
      return this.initialDelay * (attempt + 1);
    };
  }
  async executeRequest(infoOrUrl: RequestInfo | URL, config?: RequestInit) {
    const url = infoOrUrl.toString().toLowerCase();
    let data: any = undefined;
    let shouldContinue = true;
    for (let i = 0; i < this.attempts && shouldContinue; i++) {
      const response = await fetch(url, { ...config });
      data = await response.json();
      if (data.error_code) {
        const code = data.error_code;
        switch (code) {
          case 429:
            if (i < this.attempts - 1) {
              console.warn(`Error executing request, retrying...`);
              await new Promise((resolve) =>
                setTimeout(resolve, this.resolveDelay(i))
              );
            }
            break;
          default:
            shouldContinue = false;
            break;
        }
      }
    }
    if (data.error_code) {
      return data;
    }
    if (data === undefined) {
      throw new Error(
        "Unable to execute request after 5 attempts, or because it's not a rate limit problem."
      );
    }
    return data;
  }
};
