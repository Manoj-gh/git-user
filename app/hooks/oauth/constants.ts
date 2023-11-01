// This file contains the constants used in the OAuth flow
// You can change the values of the constants to match your environment
export const API_HOST = `${process.env.NEXT_PUBLIC_CS_LAUNCH_HOST}/api`; // The host (with prefix) of the Contentstack API
export const EXCHANGE_CODE_URL = `/oauth/exchange-code`; // The path of the endpoint that exchanges the code for an access token
export const REFRESH_TOKEN_URL = `/oauth/refresh-token`; // The path of the endpoint that refreshes the access token
