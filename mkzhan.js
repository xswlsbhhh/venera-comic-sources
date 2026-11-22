class Mkzhan extends ComicSource {
    name = "漫客栈"
    key = "mkzhan"
    version = "1.1.0"
    minAppVersion = "1.0.0"
    url = "https://github.com/xswlsbhhh/venera-comic-sources"

    apiHost = "comic.mkzcdn.com"
    siteHost = "comic.mkzhan.com"

    headers = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "Referer": "https://comic.mkzhan.com/",
    }

    // 题材 ID 对照表（来自站点分类筛选参数）
    themeMap = {
        "1": "霸总", "2": "修真", "3": "恋爱", "4": "校园", "5": "冒险",
        "6": "搞笑", "7": "生活", "8": "热血", "9": "架空", "10": "后宫",
        "11": "耽美", "12": "玄幻", "13": "悬疑", "14": "恐怖", "15": "灵异",
        "16": "动作", "17": "科幻", "18": "战争", "19": "古风", "20": "穿越",
        "21": "竞技", "22": "百合", "23": "励志", "24": "同人", "26": "真人",
    }

    async getData(url) {
        const res = await Network.get(url, this.headers)
        if (res.status !== 200) throw new Error("HTTP " + res.status)
        let json
        try {
            json = JSON.parse(res.body)
        } catch (e) {
            throw new Error("返回内容无法解析")
        }
        if (json.code !== "200") throw new Error(json.message || "接口返回异常")
        return json.data
    }

    parseThemes(themeId) {
        if (!themeId) return []
        const out = []
        for (const t of String(themeId).split(",")) {
            const name = this.themeMap[t.trim()]
            if (name) out.push(name)
        }
        return out
    }

    toComic(item) {
        return new Comic({
            id: String(item.comic_id),
            title: item.title || "",
            subtitle: item.chapter_title || "",
            cover: item.cover || "",
            tags: this.parseThemes(item.theme_id),
            description: item.feature || "",
        })
    }

    async loadList(query, page, pageSize) {
        const data = await this.getData(
            "https://" + this.apiHost + "/search/filter/?" + query +
            "&page_num=" + page + "&page_size=" + pageSize
        )
        const list = (data && data.list) || []
        const count = parseInt((data && data.count) || "0") || 0
        return {
            comics: list.map((e) => this.toComic(e)),
            maxPage: Math.max(1, Math.ceil(count / pageSize)),
        }
    }

    explore = [
        {
            title: "热门",
            type: "multiPageComicList",
            load: async (page) => this.loadList("order=1", page, 12),
        },
        {
            title: "最近更新",
            type: "multiPageComicList",
            load: async (page) => this.loadList("order=2", page, 12),
        },
    ]

    category = {
        title: "分类",
        parts: [
            {
                name: "排序",
                type: "fixed",
                categories: ["热门人气", "最近更新", "连载中", "已完结"],
                itemType: "category",
                categoryParams: ["order=1", "order=2", "order=2&finish=1", "order=1&finish=2"],
            },
            {
                name: "题材",
                type: "fixed",
                categories: [
                    "霸总", "修真", "恋爱", "校园", "冒险", "搞笑", "生活", "热血",
                    "架空", "后宫", "耽美", "玄幻", "悬疑", "恐怖", "灵异", "动作",
                    "科幻", "战争", "古风", "穿越", "竞技", "百合", "励志", "同人", "真人",
                ],
                itemType: "category",
                categoryParams: [
                    "theme_id=1", "theme_id=2", "theme_id=3", "theme_id=4", "theme_id=5",
                    "theme_id=6", "theme_id=7", "theme_id=8", "theme_id=9", "theme_id=10",
                    "theme_id=11", "theme_id=12", "theme_id=13", "theme_id=14", "theme_id=15",
                    "theme_id=16", "theme_id=17", "theme_id=18", "theme_id=19", "theme_id=20",
                    "theme_id=21", "theme_id=22", "theme_id=23", "theme_id=24", "theme_id=26",
                ],
            },
        ],
        enableRankingPage: false,
    }

    categoryComics = {
        load: async (category, param, options, page) => {
            return await this.loadList(param || "order=1", page, 12)
        },
    }

    search = {
        load: async (keyword, options, page) => {
            const data = await this.getData(
                "https://" + this.apiHost + "/search/keyword/?keyword=" +
                encodeURIComponent(keyword) + "&page_num=" + page + "&page_size=20"
            )
            const list = (data && data.list) || []
            const count = parseInt((data && data.count) || "0") || 0
            return {
                comics: list.map((e) => this.toComic(e)),
                maxPage: Math.max(1, Math.ceil(count / 20)),
            }
        },
    }

    comic = {
        loadInfo: async (id) => {
            const info = await this.getData(
                "https://" + this.apiHost + "/comic/info/?comic_id=" + id
            )
            const toc = await this.getData(
                "https://" + this.siteHost + "/chapter/?comic_id=" + id
            )

            const chapters = {}
            for (const e of (toc || [])) {
                const num = e.number ? "第" + e.number + "话 " : ""
                chapters[String(e.chapter_id)] = (num + (e.title || "")).trim()
            }

            const tags = {}
            const themes = this.parseThemes(info.theme_id)
            if (themes.length > 0) tags["题材"] = themes
            tags["状态"] = [info.finish === "1" ? "连载中" : "已完结"]

            return new ComicDetails({
                title: info.title || "",
                subtitle: info.chapter_title || "",
                cover: info.cover || "",
                description: info.content || "",
                tags: tags,
                chapters: chapters,
                isFavorite: null,
                updateTime: info.chapter_title || "",
                url: "https://" + this.siteHost + "/" + id + "/",
            })
        },

        loadEp: async (comicId, epId) => {
            const data = await this.getData(
                "https://" + this.apiHost + "/chapter/content/v1/?chapter_id=" + epId +
                "&comic_id=" + comicId + "&format=1&quality=1&sign=0&type=1&uid=0"
            )
            const pages = (data && data.page) || []
            if (pages.length === 0) throw new Error("该章节需要付费/登录，或已下架")
            return { images: pages.map((e) => e.image) }
        },

        onImageLoad: (url, comicId, epId) => {
            return {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                    "Referer": "https://comic.mkzhan.com/",
                },
            }
        },

        idMatch: "^(\\d+)$",

        link: {
            domains: ["comic.mkzhan.com", "m.mkzhan.com", "www.mkzhan.com"],
            linkToId: (url) => {
                const m = url.match(/(\d{3,})\/?$/)
                return m ? m[1] : null
            },
        },
    }
}
