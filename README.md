# Venera 漫画源（个人自用）

把「阅读 / Legado」格式的 `bookSource` JSON 改写成 Venera 可用的 JS 源。

## 为什么不能直接导入

Venera 只认两种源：

1. 源列表仓库的 `index.json` 链接（仓库内是 `.js` 源）；
2. 本地 `.js` 配置文件（设置 → 漫画源 → 添加漫画源 → 「使用配置文件」）。

Legado 的 `bookSource.json` 是「阅读」专有格式，Venera 没有对应入口，所以只能逐站重写。

## 导入方式

### 方式 A：一键装官方 30+ 源（强烈建议先做这步）

在 Venera 里「添加漫画源」的 URL 框粘贴：

```
https://cdn.jsdelivr.net/gh/venera-app/venera-configs@main/index.json
```

这个列表已经包含拷贝漫画、Komiic、包子漫画、MangaDex、manghuagui、zaimanhua、wnacg、ehentai、禁漫、hitomi、comick、MYCOMIC 等常见站，你那份 95 条里很多站它已经覆盖了，不必重写。

### 方式 B：装本仓库自己改写的源

URL 框粘贴：

```
https://raw.githubusercontent.com/xswlsbhhh/venera-comic-sources/main/index.json
```

或手机浏览器打开上面的 `mkzhan.js`，右键/下载保存，再到 Venera →「添加漫画源」→「使用配置文件」选那个文件。

## 当前已改写（实测通过）

| 源 | 网站 | 验证状态 |
| --- | --- | --- |
| `mkzhan.js` 漫客栈 | comic.mkzhan.com | ✅ 搜索、分类筛选、详情、目录、章节图片 均逐个接口实测返回正常 |

## 兼容性说明

以下类型的 Legado 源无法直接遷移，需要单独处理：

- 依赖远程 `<js>` 脚本、`java.ajax` / `java.put` / `cache.get` 取 sign、token 的站；
- 需要 App 内容登录（WebView 登录、VIP 账号）才能看图的站；
- 加密图（图片需 AES 解密或需特制请求头签名）的站；
- 已关站、域名失效的源。

## 免责

仅个人自用，仅包含网站公开的接口配置，不包含、不存储任何漫画内容；版权归各站与作者。
