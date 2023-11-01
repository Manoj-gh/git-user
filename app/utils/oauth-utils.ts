export const baseAppUrlSelector = (location: string): string => {
  switch (location) {
    case "NA":
      return process.env.NEXT_PUBLIC_BASE_URL_NA as string;
    case "EU":
      return process.env.NEXT_PUBLIC_BASE_URL_EU as string;
    case "AZURE_NA":
      return process.env.NEXT_PUBLIC_BASE_URL_AZURE_NA as string;
    case "AZURE_EU":
      return process.env.NEXT_PUBLIC_BASE_URL_AZURE_EU as string;
    default:
      return process.env.NEXT_PUBLIC_BASE_URL_NA as string;
  }
};

export const baseApiUrlSelector = (location: string): string => {
  switch (location) {
    case "NA":
      return process.env.NEXT_PUBLIC_API_NA as string;
    case "EU":
      return process.env.NEXT_PUBLIC_API_EU as string;
    case "AZURE_NA":
      return process.env.NEXT_PUBLIC_API_AZURE_NA as string;
    case "AZURE_EU":
      return process.env.NEXT_PUBLIC_BASE_URL_AZURE_EU as string;
    default:
      return process.env.NEXT_PUBLIC_API_AZURE_EU as string;
  }
};
