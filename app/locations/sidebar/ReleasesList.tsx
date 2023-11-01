import DefaultLoading from "@/app/components/DefaultLoading";
import React from "react";
import { Select } from "@contentstack/venus-components";
import { useCsOAuthApi } from "@/app/components/sidebar/ContentstackOAuthApi";

export interface ReleasesListProps {
  reload: boolean;
  disabled?: boolean;
  selectedRelease: any;
  setSelectedRelease: React.Dispatch<React.SetStateAction<any>>;
}

const ReleasesList = ({
  reload,
  disabled,
  selectedRelease,
  setSelectedRelease,
}: ReleasesListProps) => {
  const { getReleases, isReady } = useCsOAuthApi();

  const [loading, setLoading] = React.useState<boolean>(true);
  const [releases, setReleases] = React.useState([]);
  const [reloadList] = React.useState(reload);

  //Get Releases
  React.useEffect(() => {
    if (!isReady || disabled) return;
    setLoading(true);
    getReleases().then((res: any) => {
      const releases = res?.data?.releases?.map((r: any) => {
        return {
          id: r.uid,
          label: `${r.name} ${r.locked ? ` (locked)` : ""}`,
          searchableLabel: r.name,
          value: r.uid,
          isDisabled: r.locked,
        };
      });
      setReleases(() => {
        setLoading(false);
        return releases;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, reloadList, isReady, disabled]);
  return loading ? (
    <DefaultLoading title="Loading releases..." />
  ) : (
    <div className="grid grid-cols-1">
      <Select
        menuPlacement="bottom"
        isSearchable
        noOptionsMessage={() => "No Releases Available"}
        onChange={(v: any) => {
          setSelectedRelease(() => {
            return v;
          });
        }}
        options={releases}
        placeholder="Select Release"
        selectLabel="Available Releases"
        value={selectedRelease}
        version="v2"
        className="w-full"
        isDisabled={disabled}
      />
    </div>
  );
};

export default ReleasesList;
