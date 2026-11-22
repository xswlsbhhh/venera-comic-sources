class Mkzhan extends ComicSource {
    name = "漫客栈"
    key = "mkzhan"
    version = "1.0.1"
    minAppVersion = "1.0.0"
    url = "https://github.com/xswlsbhhh/venera-comic-sources"

    host = "comic.mkzcdn.com"
    site = "comic.mkzhan.com"

    headers = {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "Referer": "https://comic.mkzhan.com/",
    }

    async getJson(url) {
        const res = await Network.get(url, this.headers)
        if (res.status !== 200) throw `请求失败: ${res.status}`
        return JSON.parse(res.body)
    }

    toComic(item) {
        return new Comic({
            id: String(item.comic_id),
            title: item.title ?? "",
            subtitle: item.chapter_title ?? "",
            cover: item.cover ?? "",
            tags: [],
            description: item.feature ?? "",
        })
    }

    async loadFilter(query, page, pageSize) {
        const url = `https://${this.host}/search/filter/?${query}&page_num=${page}&page_size=${pageSize}`
        const json = await this.getJson(url)
        if (json.code !== "200") throw `加载失败: ${json.message}`
        const data = json.data ?? {}
        const list = data.list ?? []
        const count = parseInt(data.count ?? "0") || 0
        return {
            comics: list.map(e => this.toComic(e)),
            maxPage: Math.max(1, Math.ceil(count / pageSize)),
        }
    }

    explore = [
        {
            title: "热门",
            type: "multiPageComicList",
            load: async (page) => this.loadFilter("order=1", page, 12),
        },
        {
            title: "最近更新",
            type: "multiPageComicList",
            load: async (page) => this.loadFilter("order=2", page, 12),
        },
        {
            title: "连载中",
            type: "multiPageComicList",
            load: async (page) => this.loadFilter("order=2&finish=1", page, 12),
        },
        {
            title: "已完结",
            type: "multiPageComicList",
            load: async (page) => this.loadFilter("order=1&finish=2", page, 12),
        },
    ]

    search = {
        load: async (keyword, options, page) => {
            const url = `https://${this.host}/search/keyword/?keyword=${encodeURIComponent(keyword)}&page_num=${page}&page_size=20`
            const json = await this.getJson(url)
            if (json.code !== "200") return { comics: [], maxPage: 1 }
            const data = json.data ?? {}
            const list = data.list ?? []
            const count = parseInt(data.count ?? "0") || 0
            return {
                comics: list.map(e => this.toComic(e)),
                maxPage: Math.max(1, Math.ceil(count / 20)),
            }
        },
    }

    comic = {
        loadInfo: async (id) => {
            const infoUrl = `https://${this.host}/comic/info/?comic_id=${id}`
            const tocUrl = `https://${this.site}/chapter/?comic_id=${id}`
            const results = await Promise.all([this.getJson(infoUrl), this.getJson(tocUrl)])
            const info = results[0].data ?? {}
            const toc = results[1].data ?? []

            const chapters = {}
            for (const e of toc) {
                const num = e.number ? `第${e.number}话 ` : ""
                chapters[String(e.chapter_id)] = `${num}${e.title ?? ""}`.trim()
            }

            const tags = {}
            tags["状态"] = [info.finish === "1" ? "连载中" : "已完结"]
            if (info.author_title) tags["作者"] = [info.author_title]

            return new ComicDetails({
                title: info.title ?? "",
                subtitle: info.chapter_title ?? "",
                cover: info.cover ?? "",
                description: info.content ?? "",
                tags: tags,
                chapters: chapters,
                isFavorite: null,
                url: `https://${this.site}/${id}/`,
            })
        },

        loadEp: async (comicId, epId) => {
            const url = `https://${this.host}/chapter/content/v1/?chapter_id=${epId}&comic_id=${comicId}&format=1&quality=1&sign=0&type=1&uid=0`
            const json = await this.getJson(url)
            if (json.code !== "200") throw `章节加载失败: ${json.message}`
            const pages = (json.data ?? {}).page ?? []
            if (pages.length === 0) throw "该章节可能需要 VIP / 付费，或已下架"
            return { images: pages.map(e => e.image) }
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
                const m = url.match(/(\\d{3,})\/?$/)
                return m ? m[1] : null
            },
        },
    }
}
