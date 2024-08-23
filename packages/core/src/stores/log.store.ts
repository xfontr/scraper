import type { LogData, LogStore } from "../types";
import { useLocationStore } from ".";
import { generateId } from "../utils/utils";
import EventBus from "../utils/EventBus";
import { createStore } from "../utils/stores";

const DEFAULT_OPTIONS: Required<Omit<LogData, "message">> = {
  name: "LOG ENTRY",
  criticality: 5,
  type: "INFO",
};

const useLogStore = createStore(
  "log",
  { totalLogs: 0, logs: [] } as LogStore,
  (state) => {
    const { getCurrentLocation } = useLocationStore();

    const pushLog = (baseLog: LogData | string, emit = true): void => {
      state.totalLogs += 1;

      const logEntry = {
        id: generateId(),
        ...DEFAULT_OPTIONS,
        ...(typeof baseLog === "string"
          ? { message: baseLog }
          : structuredClone(baseLog)),
        index: state.totalLogs,
        location: getCurrentLocation(),
      };

      state.logs.push(logEntry);

      if (emit) EventBus.emit("LOGGER:LOG", structuredClone(logEntry));
    };

    return { pushLog };
  },
);

export default useLogStore;
