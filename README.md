# 林屿 · 黑银个人主页

一个不用构建、打开即用的单页个人作品集：纯黑底、银箔质感、火漆封印开场。

参考站的「信封 → 火漆 → 开封 → 信件」叙事被保留下来，整体重做成黑银语言：深空黑、拉丝银、细发丝线、衬线大字，以及一套克制的动效节奏。

- 无框架、无依赖、无构建步骤（HTML + CSS + 原生 JS）
- 响应式，桌面 / 平板 / 手机分别调过版式
- 支持 `prefers-reduced-motion`，键盘可操作，有焦点环与跳转链接
- 留言板数据只存在浏览器 `localStorage`，不依赖后端

---

## 目录结构

```
silverfolio/
├─ index.html              # 全部页面结构（含区块注释 ①②③④）
├─ assets/
│  ├─ css/style.css        # 设计 tokens + 全部样式与动效
│  ├─ js/app.js            # 开封动画、星野、光标、留言板等
│  └─ img/og.jpg           # 1200×630 分享卡片图
├─ .nojekyll               # 告诉 GitHub Pages 不要跑 Jekyll
├─ .gitignore
└─ README.md
```

---

## 本地预览

**方式一：直接双击 `index.html`。**
页面本身能正常显示，只是 `file://` 下字体与剪贴板 API 有限制，留言板也不保证能写入。

**方式二（推荐）：起一个本地静态服务器。**

```bash
cd silverfolio
python -m http.server 8080
# 打开 http://localhost:8080
```

Node 环境也可以用 `npx serve .`，VSCode 用 Live Server 插件同理。

---

## 三分钟改成自己的

内容全部写在 `index.html` 里，已经用注释标了位置；样式变量在 `assets/css/style.css` 顶部。

| 想改什么 | 去哪里 |
| --- | --- |
| 浏览器标题 / 搜索描述 | `index.html` 的 `<title>` 与 `meta[name="description"]`、`og:*` |
| 姓名、身份、一句话介绍 | `<!-- ② -->` 标记的 hero 区：`hero__title`（两个单词，字母会自动拆分入场）、`hero__cn`、`hero__lead` |
| 数据（6 年 / 40+ / 12） | `hero__stats` |
| 关于我正文与信息表 | `#about` 区块 |
| 四张作品卡 | `<!-- ③ -->` 标记的 `#work`：标题、年份、描述、标签、`href` |
| 能力清单 / 履历 | `#craft`、`#journey` |
| 留言板 | `#notes`；种子留言与邮箱在 `assets/js/app.js` 顶部 `CONFIG` |
| 邮箱、GitHub、Dribbble | `<!-- ④ -->` 标记的页脚；同时改 `CONFIG.email` |
| 配色 | `style.css` 的 `:root`：`--ink` 底色、`--grad-silver` 银箔渐变、`--line` 发丝线 |
| 字号 / 字距 | `:root` 里的 `--font-serif` / `--font-mono` 与各区块 `clamp()` |

### 换成自己的名字

首页大标题是「LIN YU」两个词，各自逐字入场。改成别的英文名时：

```html
<h1 class="hero__title" id="hero-title">
  <span class="hero__line"><span class="hero__word" data-split>YOUR</span></span>
  <span class="hero__line hero__line--outline"><span class="hero__word" data-split>NAME</span></span>
</h1>
```

`data-split` 会自动拆字。中文名放在下面的 `hero__cn`；品牌缩写 `LY` 出现在导航圆圈、印章、页脚等处，搜索替换即可。

### 换头像 / 作品图

当前作品卡是纯 CSS 画出来的「银色球体」+ 大字水印，不依赖图片。想换成真实截图：

```html
<div class="card__art art--1">
  <img src="assets/img/work-01.jpg" alt="银线官网首页" style="width:100%;height:100%;object-fit:cover">
  ...
</div>
```

并在 `style.css` 里给 `.art--1` 加一层暗色渐变遮罩，保持整体黑银调性。

---

## 部署到 GitHub Pages

### 方案 A：网页上传（不需要命令行）

1. 登录 GitHub，右上角 **+ → New repository**。
2. 仓库名随意，例如 `portfolio`；可见性选 **Public**（免费账号的 Pages 需要公开仓库）。
3. 创建后点 **uploading an existing file**，把 `index.html`、`assets/`、`.nojekyll`、`README.md` 一起拖进去，**Commit changes**。
   - 注意：上传时要保持 `index.html` 在仓库**根目录**，`assets` 与它同级。
4. 进入仓库 **Settings → Pages**。
5. **Build and deployment → Source** 选 **Deploy from a branch**；**Branch** 选 `main`，目录选 **/ (root)**，点 **Save**。
6. 等 1～2 分钟，刷新该页面，顶部会出现访问地址：

```
https://<你的用户名>.github.io/<仓库名>/
```

若仓库名恰好是 `<你的用户名>.github.io`，地址就是 `https://<你的用户名>.github.io/`。

### 方案 B：命令行推送

```bash
cd silverfolio
git init -b main
git add .
git commit -m "init: black & silver portfolio"
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

推完按方案 A 的第 4～6 步打开 Pages 即可。之后每次改完：

```bash
git add .
git commit -m "update"
git push
```

Pages 会自动重新构建，通常 30～60 秒生效。

### 检查清单

- [ ] 仓库根目录能看到 `index.html`（不是 `silverfolio/index.html`）
- [ ] `assets/css/style.css`、`assets/js/app.js` 路径大小写与实际一致（Linux 构建机区分大小写）
- [ ] 根目录有 `.nojekyll`（防止以下划线开头的文件被 Jekyll 忽略）
- [ ] Pages 的 Source 已保存为 `main` + `/ (root)`
- [ ] 打开后强刷一次（Ctrl / Cmd + Shift + R），排除 CDN 10 分钟缓存

### 常见 404 原因

1. `index.html` 被上传到了子文件夹里；
2. Pages 还停留在 “None” 或分支选错；
3. 刚推送不到 1 分钟，Actions 里的 `pages build and deployment` 还在跑；
4. 访问的是 `https://<用户名>.github.io/<仓库名>` 少了结尾斜杠以外的拼写错误。

---

## 绑定自己的域名（可选）

1. 仓库 **Settings → Pages → Custom domain** 填入 `www.yourdomain.com`，保存。
2. 到域名服务商加解析：
   - `www` → CNAME → `<你的用户名>.github.io`
   - 根域名 `@` → A 记录 → `185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
     （IPv6 可选：`2606:50c0:8000::153`、`2606:50c0:8001::153`、`2606:50c0:8002::153`、`2606:50c0:8003::153`）
3. 等 DNS 生效（几分钟到几小时），回到 Pages 勾选 **Enforce HTTPS**。
4. GitHub 会自动生成 `CNAME` 文件，不要手动删掉。

---

## 交互与动效一览

如果想调整或去掉某一项，都在 `assets/js/app.js` 与 `style.css` 对应段落里：

| 动效 | 位置 | 说明 |
| --- | --- | --- |
| 火漆开封 | `#veil` + `.seal` | 点击 / 滚轮 / 回车 / 空格触发；11 秒无操作自动开封；面板上下分离 + 印章碎裂 |
| 标题逐字入场 | `splitTitle()` + `.ch` | 每个字母 `translateY(112%)` 依次升起 |
| 星野粒子 | `#stars` 画布 | 少量粒子缓慢上浮 + 鼠标视差；`prefers-reduced-motion` 下停用 |
| 银球 3D 倾斜 | `[data-tilt]` / `#orb` | 跟随鼠标的小角度透视旋转 |
| 银色光标 | `.cursor` | 仅精确指针设备启用；输入框内仍保留系统光标 |
| 滚动显现 | `[data-reveal]` | IntersectionObserver，上移 + 淡入 |
| 磁吸按钮 | `[data-magnetic]` | 悬停时按钮向指针轻微位移 |
| 信件弹窗 | `#letter` | 导航「写一封信」、关于区信封卡、页脚按钮均可打开；`Esc` 关闭；访问 `/#letter` 直接展开 |
| 留言收件箱 | `#notes` | 本地存储、可折叠、时间倒序 |
| 顶部进度条 / 导航玻璃态 | `.progress` / `.nav` | 滚动时变化 |

---

## 留言板说明（重要）

当前实现是**纯前端演示**：留言写入浏览器 `localStorage`（键名 `linyu.notes.v1`），换设备或清缓存就没了，也不会通知你。

想变成真的收件箱，最省事的是接 Formspree：

```js
// assets/js/app.js 里 noteForm 的 submit 处理中，把本地保存替换/追加为：
await fetch('https://formspree.io/f/你的表单ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ name, message })
});
```

其他方案：Valine / Waline（需要 LeanCloud 或自建服务）、Supabase、Cloudflare Workers + D1。
如果只想展示、不收集，直接把 `#notes` 区块删掉即可。

---

## 字体与网络

页面通过 Google Fonts 引入：

- 英文标题：Cormorant Garamond
- 正文：Inter
- 标签：JetBrains Mono

中文走系统衬线（Songti SC / STSong / 宋体），所以即使字体加载失败，整体气质仍在。若目标访客网络访问 Google 不稳定，建议自托管：下载 woff2 放进 `assets/fonts/`，用 `@font-face` 替换 `<head>` 里的 `<link>`，并保留现有 fallback 列表。

---

## 性能与兼容

- 站点未压缩约 110 KB（HTML + CSS + JS，不含字体），gzip 后约 26 KB；首屏只有 HTML / CSS / JS 三类请求
- 动效全部走 `transform` / `opacity`，滚动监听用 `requestAnimationFrame` 节流
- 支持：Chrome / Edge / Safari / Firefox 近两年版本
- 不支持：IE；旧版 Safari 的 `backdrop-filter` 会降级为纯色

---

## 许可

代码可自由使用、修改、商用；文案、姓名与「林屿」人设为示例内容，请替换成你自己的。分享卡片图 `assets/img/og.jpg` 由本站样式生成，可一并替换。
