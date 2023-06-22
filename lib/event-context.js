import Debug from "debug";

const debug = Debug("ambr:event-context");

const eventContext = {};

/**
 * Get the "event context" values.
 */
export const getEventContext = () => ({ ...eventContext });

/**
 * Set an "event context" value that is automatically included in the payload
 * of every event.
 */
export const setEventContext = (key, value) => {
  debug(`setEventContext ${key}=${value}`);
  eventContext[key] = value;
};

/**
 * Reset the "event context" values.
 */
export const clearEventContext = () => {
  debug("clearEventContext");
  for (const [key] of Object.entries(eventContext)) {
    delete eventContext[key];
  }
};
