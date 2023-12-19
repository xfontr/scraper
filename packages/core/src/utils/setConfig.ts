import ENVIRONMENT from "../configs/environment";
import { TASK_LENGTH_MAX } from "../configs/scraper";
import { GLOBAL_TIMEOUT_MAX, LIMIT_MAX, TIMEOUT_MAX } from "../configs/session";
import SessionConfig from "../types/SessionConfig";

/**
 * TODO: If we allow this to be set outside of the script itself, add more checkers:
 * - Verify they are actually numbers
 * - Add minimum values
 */
export const defaultSessionConfig: SessionConfig = {
  offset: {
    url: ENVIRONMENT.baseUrl,
    page: 0,
    item: "",
  },
  limit: 150,
  timeout: 1_500,
  taskLength: 800,
  globalTimeout: 10 * 30 * 1_000,
};

const getMax = (max: number, fallback: number, value?: number) =>
  ((value ?? 0) > max ? max : value) ?? fallback;

export const setConfig = (config?: Partial<SessionConfig>): SessionConfig => ({
  ...defaultSessionConfig,
  ...config,
  offset: {
    ...defaultSessionConfig.offset,
    ...config?.offset,
  },
  limit: getMax(LIMIT_MAX, defaultSessionConfig.limit, config?.limit),
  globalTimeout: getMax(
    GLOBAL_TIMEOUT_MAX,
    defaultSessionConfig.globalTimeout,
    config?.globalTimeout,
  ),
  timeout: getMax(TIMEOUT_MAX, defaultSessionConfig.timeout, config?.timeout),
  taskLength: getMax(
    TASK_LENGTH_MAX,
    defaultSessionConfig.taskLength,
    config?.taskLength,
  ),
});

export default setConfig;
