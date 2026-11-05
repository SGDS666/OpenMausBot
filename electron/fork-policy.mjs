export const FORK_PRODUCT_NAME = "Dynasturn Console";
export const FORK_APP_ID = "com.dynasturn.console";
export const FORK_PROTOCOL = "dynasturn-console";
export const FORK_DATA_DIRECTORY = ".dynasturn-console";
export const FORK_RELEASES_URL = "https://github.com/SGDS666/OpenMausBot/releases";

/** This fork never downloads or installs an update from an application session. */
export function createManualForkUpdater(openExternal) {
  return {
    check: async (manual = false) => {
      if (manual) await openExternal(FORK_RELEASES_URL);
    },
    install: async () => false,
  };
}

export function upstreamCompatibleDeepLink(value) {
  return typeof value === "string" && value.startsWith(`${FORK_PROTOCOL}://`)
    ? `openmausbot://${value.slice(FORK_PROTOCOL.length + 3)}`
    : value;
}
