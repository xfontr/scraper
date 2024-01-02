import { CustomFunction, PromiseFunction, tryCatch } from "@personal/utils";
import ScraperSpeed from "../types/ScraperSpeed";
import EventBus from "./EventBus";
import t from "../i18n";

// TODO: Consider placing these two inside the function itself, and then rearranging the tests without mocking the EventBus

const useAction = (taskLength: number) => {
  let isSessionOn = true;

  EventBus.on("SESSION:ACTIVE", (status: boolean) => {
    isSessionOn = status;
  });

  const delay = async <T>(
    callback: CustomFunction<T>,
    speed: ScraperSpeed,
  ): Promise<T | void> => {
    if (speed * taskLength === 0) return callback(); // TODO: Test this, or maybe simply remove it, as it probably doesn't really change anything for good

    return await new Promise((resolve) => {
      setTimeout(() => {
        resolve(callback());
      }, speed * taskLength);
    });
  };

  const action = async <T>(
    callback: CustomFunction<T> | PromiseFunction<T>,
    speed: ScraperSpeed,
    isCritical: boolean,
  ): Promise<[void | Awaited<T>, void | Error]> => {
    if (!isSessionOn) return [undefined, undefined];

    const [response, error] = await tryCatch<T>(delay, callback, speed);
    
    EventBus.emit("ACTION:COUNT", speed);

    error &&
      EventBus.emit("SESSION:ERROR", error, {
        name: t("error_index.action"),
        publicMessage: t("session_actions.error.default"),
        isCritical,
      });

    return [response as Awaited<T>, error];
  };

  /**
   * @description Normal action. If an error is hanlded, will not break the app.
   */
  const $a = <T>(callback: CustomFunction<T>, speed: ScraperSpeed = 0) =>
    action(callback, speed, false);

  /**
   * @description Critical action. If an error is hanlded, will break the app.
   */
  const $$a = <T>(callback: CustomFunction<T>, speed: ScraperSpeed = 0) =>
    action(callback, speed, true);

  return {
    $a,
    $$a,
  };
};

export default useAction;
