import * as PropTypes from "prop-types";
import * as React from "react";

import { EXCHANGE_CODE_URL } from "./constants";
import { Map } from "immutable";
import axios from "../../utils/axios";
import useAuth from "./useAuth";

export const ErrNoCode = new Error("no code available");

/**
 * @hidden
 */
const urlDecode = (urlString: string): Map<string, string> =>
  Map(
    urlString
      .split("&")
      .map<[string, string]>((param: string): [string, string] => {
        const sepIndex = param.indexOf("=");
        const k = decodeURIComponent(param.slice(0, sepIndex));
        const v = decodeURIComponent(param.slice(sepIndex + 1));
        return [k, v];
      })
  );

interface AuthReceived {
  code: string | null;
  location: string | null;
}

const OAuthCallbackHandler: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  // const { setAuth } = useAuth();

  // React.useEffect(() => {
  //   //? tsconfig.js > --downlevelIteration: true
  //   const search = [...urlDecode(window.location.search.slice(1))];
  //   const hash = [...urlDecode(window.location.hash.slice(1))];
  //   const params: Map<string, string> = Map([...search, ...hash]);

  //   //? Do we need this?
  //   // if (state !== params.get("state")) throw ErrIncorrectStateToken;

  //   const code: string | undefined = params.get("code");
  //   if (code === undefined) throw ErrNoCode;

  //   axios(EXCHANGE_CODE_URL, {
  //     method: "POST",
  //     data: {
  //       code: code,
  //     },
  //   })
  //     .then((res) => {
  //       setAuth(res.data);
  //       // window.opener.postMessage({ dummy: true }, "*");
  //       window.close();
  //     })
  //     .catch((err) => {
  //       console.log("🚀 ~ Error while initializing session");
  //     });
  // }, [setAuth]);
  const [cancelAuth, setAuthCancellation] = React.useState();

  const { REACT_APP_HOST_URL } = process.env;
  const [search] = React.useState([
    ...urlDecode(window.location.search.slice(1)),
  ]);
  const [hash] = React.useState([...urlDecode(window.location.hash.slice(1))]);
  React.useEffect(() => {
    const params: Map<string, string> = Map([...search, ...hash]);
    const code: string | undefined = params.get("code");
    const location: string | undefined = params.get("location");
    const cancellationError: any = params.get("error");

    if (code === undefined) throw ErrNoCode;

    const authCredentials: AuthReceived = {
      code: code ?? "Invalid auth token",
      location: location ?? "Invalid location",
    };

    if (cancellationError === "access_denied") {
      setAuthCancellation(cancellationError);
      setTimeout(() => {
        window.opener.postMessage(
          { message: cancellationError },
          REACT_APP_HOST_URL
        );

        window.close();
      }, 3000);
    }

    window.opener.postMessage(authCredentials, REACT_APP_HOST_URL);
    window.close();
  }, [REACT_APP_HOST_URL, search, hash]);

  return <React.Fragment>{children || "please wait..."}</React.Fragment>;
};

/**
 * OAuthCallback is a React component that handles the callback
 * step of the OAuth2 protocol.
 *
 * OAuth2Callback is expected to be rendered on the url corresponding
 * to your redirect_uri.
 *
 * By default, this component will deal with errors by closing the window,
 * via its own React error boundary. Pass `{ errorBoundary: false }`
 * to handle this functionality yourself.
 *
 * @example
 * <Route exact path="/callback" component={OAuthCallback} />} />
 */
export const OAuthCallback: React.FunctionComponent<{
  errorBoundary?: boolean;
  children?: React.ReactNode;
}> = ({
  /**
   * When set to true, errors are thrown
   * instead of just closing the window.
   */
  errorBoundary = true,
  children,
}) => {
  if (errorBoundary === false)
    return <OAuthCallbackHandler>{children}</OAuthCallbackHandler>;
  return (
    <ClosingErrorBoundary>
      <OAuthCallbackHandler>{children}</OAuthCallbackHandler>
    </ClosingErrorBoundary>
  );
};

OAuthCallback.propTypes = {
  errorBoundary: PropTypes.bool,
  children: PropTypes.node,
};

/**
 * @hidden
 */
class ClosingErrorBoundary extends React.PureComponent<{
  children: React.ReactNode;
}> {
  state = { errored: false };

  static getDerivedStateFromError(error: string) {
    console.log(error);
    return { errored: true };
  }

  static propTypes = {
    children: PropTypes.func.isRequired,
  };

  render() {
    return this.state.errored ? null : this.props.children;
  }
}
