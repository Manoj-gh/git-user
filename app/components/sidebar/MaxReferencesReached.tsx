import { Icon, Info } from "@contentstack/venus-components";

import { MAX_ENTRIES_PER_RELEASE } from "./ContentstackOAuthApi";

interface MaxReferencesReachedProps {
  count: number;
}

const MaxReferencesReached = ({ count }: MaxReferencesReachedProps) => {
  return (
    <div>
      {count > MAX_ENTRIES_PER_RELEASE ? (
        <div className="pt-3">
          <Info
            content={
              <>
                <strong>{count}</strong> references found.
                <br />
                You are exceeding the maximum items per release limit of{" "}
                <strong>{MAX_ENTRIES_PER_RELEASE}</strong>. <br />
                Only those will be added.
              </>
            }
            icon={<Icon icon="InfoCircleWhite" />}
            type="warning"
          />
        </div>
      ) : count > 0 ? (
        <Info
          content={
            <>
              <strong>{count}</strong> references found.
            </>
          }
          icon={<Icon icon="InfoCircleWhite" />}
          type="success"
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default MaxReferencesReached;
