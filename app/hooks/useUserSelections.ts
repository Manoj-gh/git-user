import {
  ADD_REFERENCES_SELECTIONS_STORAGE_KEY,
  UserSelections,
} from "../components/sidebar/models/models";

import useAppStorage from "./useAppStorage";

const useUserSelections = (key?: string) => {
  const { value: selections, store: setSelections } =
    useAppStorage<UserSelections>(key || ADD_REFERENCES_SELECTIONS_STORAGE_KEY);

  return {
    ...selections,
    setSelections,
  };
};

export default useUserSelections;
