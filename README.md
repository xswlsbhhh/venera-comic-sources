# Venera 漫画源（个人自用）

把「阅读 / Legado」格式的书源 JSON，改写成 Venera 能直接加载的 JS 源。

## 一、怎么导入（二选一）

### 方法一：填仓库地址（一次装好，以后还能检查更新）

Venera → 首页「漫画源」→ 添加漫画源 → 点「漫画源列表」，在「仓库地址」框里清空后粘贴：

```
https://cdn.jsdelivr.net/gh/xswlsbhhh/venera-comic-sources@main/index.json
```

如果刷新不出内容，换成：

```
https://raw.githubusercontent.com/xswlsbhhh/venera-comic-sources/main/index.json
```

点「刷新」→ 列表里出现「漫客栈 1.1.0」→ 点右侧「添加」→ 返回「发现」页就能看了。

### 方法二：直接用单个源文件

用浏览器打开下面这个地址，保存/下载 `mkzhan.js` 到手机：

```
https://raw.githubusercontent.com/xswlsbhhh/venera-comic-sources/main/mkzhan.js
```

然后 Venera → 添加漫画源 → 点「使用配置文件」→ 选刚存的 `mkzhan.js`。

## 二、仓库内容

| 文件 | 说明 |
| --- | --- |
| `index.json` | 源列表清单（Venera 认的就是这个） |
| `mkzhan.js` | 漫客栈（comic.mkzhan.com）漫画源 |

## 三、已实测的接口

以下接口在 2026-11-23 逐个请求并确认返回正常，不是推测：

- 搜索：`/search/keyword/`
- 分类筛选：`/search/filter/`
- 漫画详情：`/comic/info/`
- 章节目录：`/chapter/`
- 章节图片：`/chapter/content/v1/`（`sign=0` 即可直出图片链接）

已实现功能：发现页（热门 / 最近更新）、分类页（排序 + 25 个题材）、搜索、详情（简介 / 题材 / 连载状态）、目录、逐话读图、粘贴链接识司。

注：“接口实测通过”指接口本身返回正常；真机阅读体验还请以实际使用为准，若站点改版导致失效，改对应字段重新请求即可。

## 四、关于原来那 95 条书源

Legado 的 `bookSource.json` 是「阅读」专有格式，Venera 没有任何入口能直接读它，只能逐站重写。不是每条都能搬：

- 依赖远程 `<js>` 脚本、`java.ajax` / `java.put` / `cache` 取 sign、token 的站，需要逐个手写等价逻辑；
- 需要 App 内登录（WebView 登录、VIP / 付费账号）才给图的站，不写账号体系就拿不到图；
- 图片加密、需特制请求头签名的站；
- 已关站或域名失效的源。

另外，你那份清单里相当一部分站（拷贝、包子、漫蛙、绅士、禁漫、漫画柜、再漫画、优酷漫画、漫画人、MYCOMIC、MangaDex、nhentai 等）官方仓库已经有维护好的现成源，没必要重写。想要的话在「仓库地址」里填：

```
https://cdn.jsdelivr.net/gh/venera-app/venera-configs@main/index.json
```

## 五、免责

仅个人自用；仓库里只有网站公开接口的请求配置，不包含、不分发任何漫画内容；版权归各网站与作者。仓库可随时删除。
