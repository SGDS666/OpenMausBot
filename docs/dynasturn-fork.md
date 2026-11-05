# Dynasturn Console 维护版

本仓库是 [OpenMausBot](https://github.com/milind-soni/OpenMausBot) 的维护分叉，保留原作者归属、Apache-2.0 LICENSE、NOTICE 和第三方许可。首个开发基线为上游提交 `e7317a7fd23495ce6cb159279aa0ef9b8f086b06`，本地版本为 `0.1.141-dynasturn.1`。它是待验收版本，版本号不表示已经发布安装包。

## 构建开源版本

使用 Node.js 24 与仓库固定的 pnpm 版本：

```sh
pnpm install --frozen-lockfile
pnpm build:oss
```

该命令产生网页 `dist/` 和服务端 `dist-server/`。服务端打包默认使用 `OMB_EDITION=oss`；它会移除上一次构建残留在 `dist-server/enterprise/` 的产物，不修改 `enterprise/` 源码。构建版在代码中固定 OSS 标志，即使运行时设置企业层目录也不会加载。`dist-server/build-edition.json` 记录本次版本与 edition，LICENSE 与 NOTICE 随服务端一并保存。

直接从源码启动开发服务时设置 `OMB_EDITION=oss`。运行实例还必须指定独立 `OMB_DATA_DIR`；不要用开发实例打开正式数据。OSS 选项不会绕过已经配置的托管工作区认证：此配置缺少授权实现时仍拒绝访问。

无桌面部署把 `dist/`、`dist-server/`、`skills/` 放在同一工作目录，设置 `OMB_STATIC_DIR` 为 `dist/` 的绝对路径，再启动 `node dist-server/server-launcher.js`。同时显式设置独立 `OMB_DATA_DIR`、`OMB_PORT`、`OMB_WEBHOOK_PORT` 与共享服务的 `OMB_LOOPBACK_TRUST=service`；缺少静态目录时，API 可运行但网页入口不可用。基本服务与 MCP 不要求部署源码树或 `node_modules`；Data 功能的 DuckDB、resvg、1Password SDK 和浏览器自动化运行环境是额外能力，需按服务器系统与架构另行准备。不能把 Windows 原生二进制复制到 Linux 当作可用环境。

`OMB_EDITION=enterprise` 仅为保留上游开发兼容性而提供，必须显式选择。使用该目录代码应遵守 `enterprise/LICENSE` 和 `LICENSING.md`；本维护版的默认构建不包含它。

## 更新与安装隔离

本版的桌面产品名为 **Dynasturn Console**，应用标识为 `com.dynasturn.console`，专用协议为 `dynasturn-console://`。桌面默认业务数据目录是 `~/.dynasturn-console`，可用显式 `OMB_DATA_DIR` 配置独立位置。不会注册上游 `openmausbot://` 协议，也不会自动搬动原有数据。

桌面自动下载、退出时安装和静默安装均关闭。“检查更新”仅打开本分叉的 [Releases](https://github.com/SGDS666/OpenMausBot/releases)，由维护者选择、核验和安装固定版本。服务器仅检查同一仓库的正式发布，返回版本和链接，不建议安装上游 npm 包或拉取上游容器。没有正式发布时返回无更新；候选版本从 Releases 页面手动查看。

`electron-builder.yml` 的发布目标也指向本分叉。未来启用自动更新前，必须先验证自己的 Windows/macOS 安装包、更新元数据、签名、升级恢复和数据版本兼容性；不能只切换一个开关。

桌面专用协议在入口转换为上游内部解析格式，保留已有路径与校验规则。手机配对等上游协议兼容功能没有被整体更名；独立手机应用不属于首版发布范围。

## 维护与回退

保持上游追踪分支与自有补丁分支分离，每次更新固定提交并审查差异，先在临时数据目录完成中文、接口、身份与恢复检查，再发布自己的版本。通用缺陷可整理成独立上游补丁，业务规则和凭证放在独立私有配置中。

回退前暂停新任务、保存业务和 OpenMausBot 数据恢复点。数据库模式有变更时，不能只替换旧可执行文件；必须使用与恢复点匹配的程序与数据。源代码、模型账户和服务器凭证不进入公开发布包。

## 当前验证边界

源码单元测试覆盖自有更新源、无发布时响应、仅手动打开更新页、专用协议转换、OSS 不加载企业层与清理旧产物。正式 Windows 安装、签名、语音、菜单操作和跨版本恢复仍需在打包后隔离验证。网页及服务端构建成功不等同于这些验收通过。

2026-11-05 本次验证：`pnpm build:oss` 成功；更新与 OSS 相关 28 项单元测试通过；`node --experimental-strip-types scripts/smoke-packaged-server.mjs` 在临时目录、临时 HOME 且没有可寻的 `node_modules` 下通过健康检查、13 个子进程代理路径、MCP 初始化与调用、doctor/bots、加密备份工作进程、两次编译缓存启动，以及 `/api/edition` 返回 `oss` 且无企业功能。
