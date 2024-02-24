import { Session, useAction } from "../..";

const setDefaultTools = (
  $s: ReturnType<typeof Session>,
  { $a, $$a }: ReturnType<typeof useAction>,
) => ({
  abort: (abrupt = true) => $s.end(abrupt),
  store: $s.store,
  hooks: {
    ...$s.storeHooks,
    saveAsJson: $s.saveAsJson,
    saveItemsLocally: $s.saveItemsLocally,
    notify: $s.notify,
    logError: $s.error,
    /**
     * @description Normal action. If an error is handled, will not break the app.
     */
    $$a,
    /**
     * @description Critical action. If an error is handled, will break the app.
     */
    $a,
  },
});

export default setDefaultTools;
