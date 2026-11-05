import { clipboard, ipcMain, shell } from "electron";
import { packageInstallCommand, stagedInstallFile } from "./package-install-command.mjs";
import { installPackageElevated } from "./elevated-install.mjs";
import { openBlankTerminal } from "./terminal-launch.mjs";
import { createManualForkUpdater } from "./fork-policy.mjs";

export { quietSignals } from "./update-when-quiet-main.mjs";

let win = null;
let pageAllowed = () => false;
const updater = createManualForkUpdater(url => shell.openExternal(url));
const view = () => ({ status: "idle" });

export function reopenedOutOfSight() {
  return false;
}

export function handOffDownloadedPackage(packageType) {
  return async (files) => {
    const command = packageInstallCommand(packageType, stagedInstallFile(files));
    clipboard.writeText(command);
    return { command, terminalOpened: await openBlankTerminal() };
  };
}

export function installDownloadedPackage(files, { sha512 } = {}) {
  return installPackageElevated({ file: stagedInstallFile(files), sha512 });
}

export function sendUpdaterState() {
  const contents = win?.webContents;
  if (contents && !contents.isDestroyed() && pageAllowed({ sender: contents, senderFrame: contents.mainFrame })) {
    contents.send("update:state", view());
  }
}

export function registerUpdaterIpc({ pageAllowed: allowed }) {
  pageAllowed = allowed;
  const guarded = (channel, handler) => (event) => {
    if (!pageAllowed(event)) throw new Error(`${channel} is only available in this app's window`);
    return handler();
  };
  ipcMain.handle("update:get-state", guarded("update:get-state", view));
  ipcMain.handle("update:check", guarded("update:check", () => updater.check(true)));
  ipcMain.handle("update:install", guarded("update:install", () => updater.install()));
  ipcMain.handle("update:seen", guarded("update:seen", () => undefined));
}

export function attachUpdaterWindow(mainWindow) {
  win = mainWindow;
}

export function startUpdater() {
  sendUpdaterState();
}
