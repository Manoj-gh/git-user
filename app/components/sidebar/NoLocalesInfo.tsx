import { Icon, Info } from "@contentstack/venus-components";

const NoLocalesInfo = () => {
  return (
    <div className="p-2">
      <Info
        content={
          <>
            <div>
              <strong>No Localizations available.</strong>
            </div>
            <div>
              Use the regular copy command using the
              <code>&lsquo;...&lsquo;</code> menu below.
            </div>
          </>
        }
        icon={<Icon icon="InfoCircleWhite" />}
        type="attention"
      />
    </div>
  );
};

export default NoLocalesInfo;
