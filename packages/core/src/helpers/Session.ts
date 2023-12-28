import { readdir, unlink, writeFile } from "fs/promises";
import t from "../i18n";
import { errorMessage, infoMessage } from "../logger";
import type SessionConfig from "../types/SessionConfig";
import EventBus from "../utils/EventBus";
import setConfig from "../utils/setConfig";
import SessionStore from "./SessionStore";
import { tryCatch } from "@personal/utils";
import { resolve } from "path";
import ENVIRONMENT from "../configs/environment";

let initialized = false;

const Session = (baseConfig?: Partial<SessionConfig>) => {
  const config = setConfig(baseConfig);
  const store = SessionStore();

  const end = (abruptEnd = false): void => {
    if (!initialized) return;

    initialized = false;

    store.end(!abruptEnd);

    EventBus.emit("SESSION:ACTIVE", false);

    EventBus.removeAllListeners();

    infoMessage(t("session.end"));
  };

  const init = () => {
    if (initialized) {
      throw new Error(t("session.error.initialized"));
    }

    store.init(config);

    EventBus.on("SESSION:ERROR", error);
    EventBus.emit("SESSION:ACTIVE", true);
    EventBus.on("SESSION:ACTIVE", (status: boolean) => {
      if (!status && initialized) end();
    });

    infoMessage(t("session.init"));

    initialized = true;

    return session;
  };

  const error = (error: Error | undefined, isCritical?: boolean) => {
    if (!error) return;

    store.logError(error, isCritical);
    errorMessage(error.message);

    if (isCritical) end(true);
  };

  /**
   *
   * @param callback The function will pass a "cleanUp" parameter to the callback, so that the timer can be ended and avoid
   * unexpected behaviours.
   * @example
   * await setGlobalTimeout((cleanUp) => {
   *  // Actions
   *  cleanUp();
   * });
   *
   */
  const setGlobalTimeout = async <T>(
    callback: (cleanUp: () => void) => Promise<T>,
  ): Promise<T | "ABRUPT_ENDING"> => {
    let storedTimeout: NodeJS.Timeout | undefined = undefined;

    const cleanUp = () => {
      clearInterval(storedTimeout);
    };

    return await Promise.race<T | "ABRUPT_ENDING">([
      new Promise(
        (resolve) =>
          (storedTimeout = setTimeout(() => {
            error(Error(t("session.error.global_timeout")), true);
            resolve("ABRUPT_ENDING");
          }, store.current().globalTimeout)),
      ),
      callback(cleanUp),
    ]);
  };

  const saveAsJson = async (): Promise<void> => {
    const dataPath = resolve(__dirname, "../../data");

    const result = await tryCatch(async () => {
      const dataDir = await readdir(dataPath);

      if (ENVIRONMENT.nodeEnv === "dev" && dataDir[0]) {
        await unlink(resolve(dataPath, dataDir[0]));
      }

      await writeFile(
        resolve(dataPath, `${store.current()._id}.json`),
        JSON.stringify(store.current()),
      );
    });

    infoMessage(t(result[1] ? "session.error.not_saved" : "session.saved"));
  };

  const session = {
    init,
    end,
    error,
    store: store.current,
    hooks: {
      updateLocation: store.updateLocation,
      nextPage: store.nextPage,
      previousPage: store.previousPage,
      postItem: store.postItem,
    },
    setGlobalTimeout,
    saveAsJson,
  };

  return session;
};

export default Session;
