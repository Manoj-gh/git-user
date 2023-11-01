import {
  ADD_REFERENCES_SELECTIONS_STORAGE_KEY,
  COPY_ENTRY_SELECTIONS_STORAGE_KEY,
} from "@/app/components/sidebar/models/models";
import { Accordion, Button } from "@contentstack/venus-components";

import AuthorizeButton from "@/app/components/AuthorizeButton";
import { showMessage } from "@/app/utils/notifications";
import useAppStorage from "@/app/hooks/useAppStorage";
import useAuth from "@/app/hooks/oauth/useAuth";

interface SecurityOptionsProps {
  renderExpanded?: boolean;
}
const SecurityOptions = ({ renderExpanded }: SecurityOptionsProps) => {
  const { asyncRefresh, canRefresh, deleteAuth } = useAuth({
    from: "SecurityOptions",
  });
  const { store: setReferenceSelections } = useAppStorage(
    ADD_REFERENCES_SELECTIONS_STORAGE_KEY
  );
  const { delete: deleteCopyEntrySelections } = useAppStorage(
    COPY_ENTRY_SELECTIONS_STORAGE_KEY
  );

  return (
    <Accordion title="Security & Storage" renderExpanded={renderExpanded}>
      <div className="grid grid-cols-1 p-2 gap-2">
        <div>
          <Button
            buttonType="secondary"
            isFullWidth
            disabled={!canRefresh}
            onClick={() => {
              //   setLoadingTitle("Refreshing Token...");
              asyncRefresh(true);
            }}
            icon="RefreshCircleThin"
          >
            Update Credentials
          </Button>
        </div>
        <div>
          <AuthorizeButton />
        </div>
        <div>
          <Button
            buttonType="secondary"
            isFullWidth
            onClick={() => {
              deleteAuth().then(() => {
                deleteCopyEntrySelections().then(() => {
                  showMessage("Data cleared successfully");
                });
              });
            }}
            icon="RefreshCircleThin"
          >
            Clear Data
          </Button>
        </div>
      </div>
    </Accordion>
  );
};

export default SecurityOptions;
