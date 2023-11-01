export const SUCCESSFUL_RESPONSES = [
  200, 201, 202, 203, 204, 205, 206, 207, 208, 226,
];

export interface IContentstackResponse {
  status: number;
  friendlyMessage: string;
  payload: any;
}
