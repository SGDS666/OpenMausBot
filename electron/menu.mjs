// Electron has no role for the macOS Preferences… item, so it is built explicitly.
import { Menu, app } from "electron";

/** A local environment has a folder and no address. */
const whereItLives = (environment) => (environment.kind === "local" ? environment.dataDir : new URL(environment.origin).host);

/**
 * @param {object} input
 * @param {({ id: string, name: string, origin: string } | { id: string, name: string, kind: "local", dataDir: string })[]} input.environments
 * @param {string} input.activeId  "local" or an environment id
 * @param {(id: string) => void} input.onSwitch
 * @param {() => void} input.onAddFromClipboard
 * @param {() => void} input.onConnect
 * @param {(id: string) => void} input.onForget
 * @param {() => void} input.onOpenSettings
 * @param {() => void} input.onOrganizationSignIn
 * @param {{ origin: string, onBack: () => void } | null} [input.home] My Cloud once the person's bots moved there: the
 *   menu lists only the other saved servers, with Back to My Cloud, and is absent without any.
 * @param {{ checked: boolean, onToggle: (on: boolean) => void } | null} [input.openAtLogin] Open at Login, in the app
 *   menu on macOS and the File menu elsewhere; absent when this build cannot add a login item.
 */
export function buildApplicationMenu({ environments, activeId, onSwitch, onAddFromClipboard, onConnect, onForget, onOpenSettings, onOrganizationSignIn, onAddCloud, sublabels = {}, home = null, openAtLogin = null, language = null }) {
  const isMac = process.platform === "darwin";
  const locale = (language === "" ? app.getLocale() : language ?? "zh").toLowerCase();
  const chinese = locale === "zh" || /^zh-(?:cn|sg|hans)(?:-|$)/.test(locale);
  const words = (english, simplified) => chinese ? simplified : english;
  const role = (name, english, simplified) => ({ role: name, label: words(english, simplified) });
  const forgetLabel = (name) => words(`Forget “${name}”`, `移除“${name}”`);
  const active = environments.find((e) => e.id === activeId) ?? null;
  const others = home ? environments.filter((e) => e.origin !== home.origin && e.kind !== "local") : [];
  const away = Boolean(active && home && active.origin !== home.origin);
  const homeServer = {
    label: words("Server", "服务器"),
    submenu: [
      { id: "back-to-my-cloud", label: words("Back to My Cloud", "返回我的云端"), enabled: away, click: () => home?.onBack() },
      { type: "separator" },
      ...others.map((e) => ({ label: `${e.name} — ${new URL(e.origin).host}`, type: "radio", checked: e.id === activeId, click: () => onSwitch(e.id) })),
      { type: "separator" },
      { label: words("Add Server from Copied Pairing Link…", "从已复制的配对链接添加服务器…"), click: () => onAddFromClipboard() },
      { label: away ? forgetLabel(active.name) : words("Forget Server", "移除服务器"), enabled: away, click: () => away && onForget(active.id) },
    ],
  };
  const server = home ? homeServer : {
    label: words("Server", "服务器"),
    submenu: [
      { label: words("This computer", "这台电脑"), type: "radio", checked: !active, click: () => onSwitch("local") },
      ...environments.map((e) => ({
        label: `${e.name} — ${Object.hasOwn(sublabels, e.id) ? sublabels[e.id] : whereItLives(e)}`,
        type: "radio",
        checked: e.id === activeId,
        click: () => onSwitch(e.id),
      })),
      ...(onAddCloud ? [{ id: "add-cloud", label: words("Add a Cloud…", "添加云端…"), click: () => onAddCloud() }] : []),
      { type: "separator" },
      { id: "organization-sign-in", label: words("Sign in with your organization…", "使用组织账户登录…"), click: onOrganizationSignIn },
      { label: words("Connect to a server…", "连接服务器…"), click: onConnect },
      { label: words("Add Server from Copied Pairing Link…", "从已复制的配对链接添加服务器…"), click: () => onAddFromClipboard() },
      {
        label: active ? forgetLabel(active.name) : words("Forget Server", "移除服务器"),
        enabled: Boolean(active),
        click: () => active && onForget(active.id),
      },
    ],
  };
  const atLogin = openAtLogin ? [{ id: "open-at-login", label: words("Open at Login", "登录时启动"), type: "checkbox", checked: openAtLogin.checked, click: () => openAtLogin.onToggle(!openAtLogin.checked) }] : [];
  const fileMenu = chinese ? { label: "文件", submenu: [isMac ? role("close", "Close Window", "关闭窗口") : role("quit", "Quit", "退出")] } : { role: "fileMenu" };
  const editMenu = chinese ? { label: "编辑", submenu: [role("undo", "Undo", "撤销"), role("redo", "Redo", "重做"), { type: "separator" }, role("cut", "Cut", "剪切"), role("copy", "Copy", "复制"), role("paste", "Paste", "粘贴"), role("pasteAndMatchStyle", "Paste and Match Style", "粘贴并匹配样式"), role("selectAll", "Select All", "全选")] } : { role: "editMenu" };
  const viewMenu = chinese ? { label: "视图", submenu: [role("reload", "Reload", "重新加载"), role("forceReload", "Force Reload", "强制重新加载"), role("toggleDevTools", "Toggle Developer Tools", "切换开发者工具"), { type: "separator" }, role("resetZoom", "Actual Size", "实际大小"), role("zoomIn", "Zoom In", "放大"), role("zoomOut", "Zoom Out", "缩小"), { type: "separator" }, role("togglefullscreen", "Toggle Full Screen", "切换全屏")] } : { role: "viewMenu" };
  const windowMenu = chinese ? { label: "窗口", submenu: [role("minimize", "Minimize", "最小化"), role("zoom", "Zoom", "缩放"), ...(isMac ? [{ type: "separator" }, role("front", "Bring All to Front", "全部置于前台")] : [role("close", "Close Window", "关闭窗口")])] } : { role: "windowMenu" };
  const template = [
    ...(isMac ? [{ label: app.name, submenu: [role("about", "About", `关于 ${app.name}`), { label: words("Preferences…", "偏好设置…"), accelerator: "CmdOrCtrl+,", click: () => onOpenSettings() }, ...atLogin, { type: "separator" }, role("hide", "Hide", "隐藏"), role("hideOthers", "Hide Others", "隐藏其他应用"), role("unhide", "Show All", "全部显示"), { type: "separator" }, role("quit", "Quit", "退出")] }] : []),
    !isMac && openAtLogin ? { label: words("File", "文件"), submenu: [...atLogin, { type: "separator" }, role("quit", "Quit", "退出")] } : fileMenu,
    editMenu,
    ...(home && !others.length ? [] : [server]),
    viewMenu,
    windowMenu,
  ];
  return Menu.buildFromTemplate(template);
}
