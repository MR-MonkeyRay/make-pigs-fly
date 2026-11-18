# 让猪飞 / Make Pigs Fly

一个围绕英语俗语 “when pigs fly”（等猪会飞的时候，即“绝不可能”）展开的纯前端趣味网站。

Make Pigs Fly (makepigs.fly) is a playful, pure-frontend static website built around the English idiom "when pigs fly" (meaning "never, not in a million years"). Its modes are a shareable bet, six skits to unlock, and an original canvas endless flyer. It has no backend and deploys to GitHub Pages.

## 玩法

| 模式 | 路由 | 玩法 |
|---|---|---|
| 赌约（The Dare） | `#/` | “等猪飞了，我就……”点“让它飞”随机播放一段短剧；也可写下自己的赌约（最多 60 个字符）并生成分享链接 `#/?d=<base64url>`，朋友打开后要亲手点一下，才揭晓猪飞没飞。 |
| 起飞方法（Ways to Fly） | `#/ways`、`#/ways/<id>` | 随机播放一段短剧，优先选择尚未解锁的；解锁进度保存在 localStorage `mpf.unlocked` 中。 |
| 猪不停蹄（Hog Wild） | `#/run`、`#/run?s=<分数>` | 原创单按钮无尽飞行（canvas）：点击或按空格拍翅、松开滑翔、↓ 俯冲、`P` 暂停；`s` 为挑战分数，打开后显示挑战提示；离开页面自动暂停。 |

起飞方法共六种，每种都有深链接 `#/ways/<id>`：

| 编号 | id | 一句话 |
|---|---|---|
| 01 | `hype-fan` | **风口**：站在风口上猪也能飞，估值弹幕一路飙升，风一停就摔回地面（估值纯属虚构） |
| 02 | `paperwork-wings` | **补交翅膀**：飞行许可被驳回“缺少翅膀 ×2”，补交的两张申请表直接变成翅膀 |
| 03 | `ground-falls` | **地面已离开**：猪一步没动，地面先掉了下去，最后整颗地球挂着降落伞飘过 |
| 04 | `mock-pig` | **测试全过**：测试全绿，可飞过去的是一只纸板 mock 猪；真猪只好 `--force` 起飞 |
| 05 | `impossible-idiom` | **不可能成语**：按当前语言演出当地的习语，如太阳从西边出来、母鸡长牙、牛先飞、地狱结冰…… |
| 06 | `pudding-ballast` | **减重方针**：太重飞不起来，就把手册、电脑、围巾全扔掉，唯独布丁不能扔 |

彩蛋：在开发者工具控制台执行 `makePigs.fly()`，当前模式中的猪会飞起来（猪不停蹄中变为火箭模式）。

## 特性

- **多语言**：支持 zh-CN、en、de、fr、es、ja。优先级为 `?lang=` > 手动选择（localStorage `mpf.lang`）> `navigator.languages`（先精确匹配，再匹配主语言）> en；所有 `zh-*` 统一映射为 zh-CN。
- **主题**：默认跟随系统亮色或暗色；页眉按钮循环切换 自动 → 日间（daylight）→ 夜航（night flight）。
- **减少动态效果**：遵循 reduced motion 偏好，动画直接呈现结束状态，游戏中也不做额外抖动。
- **纯静态**：无后端，不使用外部 CDN 或 Google Fonts，仅用系统字体栈。
- **技术栈**：Vite 8、TypeScript 7（strict）、原生 DOM（无 UI 框架）、Vitest 5、Playwright。

## 开发

前置条件：Node 24 与 pnpm 11。

| 命令 | 作用 |
|---|---|
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 启动本地开发服务器 |
| `pnpm build` | 构建生产版本（输出到 `dist`） |
| `pnpm preview` | 预览构建产物 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm test` | 运行 Vitest 单元测试 |
| `pnpm test:e2e` | 运行 Playwright 端到端测试 |
| `pnpm check` | 依次执行类型检查、单元测试和构建 |

端到端测试不必在本机安装浏览器，可连接 Docker 里的 Playwright 浏览器（镜像版本须与 `@playwright/test` 一致；`--network host` 让容器访问本机的预览服务，仅限 Linux）：

```bash
docker run --rm --init --network host mcr.microsoft.com/playwright:v1.65.1-noble \
  npx -y playwright@1.65.1 run-server --port 3000 --host 127.0.0.1
PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:3000/ pnpm test:e2e
```

目录结构：

```
src/
├── main.ts                       启动入口与页面外壳
├── router.ts、route.ts            路由
├── modes/
│   ├── dare/                     赌约
│   ├── ways/                     起飞方法：stage.ts、registry.ts、skits/
│   └── run/                      猪不停蹄
├── i18n/locales/                 多语言支持与各语言文案
├── pig/pig.ts                    原创 SVG 猪
└── styles/                       样式
tests/unit/ · tests/e2e/          单元测试（Vitest）、端到端测试（Playwright）
.github/workflows/deploy.yml      部署工作流
```

## 扩展

**新增起飞方法**

1. 在 `src/modes/ways/skits/` 新建 `<name>.ts`，导出 `{ id, nameKey, play(stage) }` 形式的 `Skit` 对象。
2. `play` 中使用 Stage API：`say`、`wait`、`anim`、`loop`、`tween`、`add`、`movePig`、`paddle`。
3. 在 `en.ts` 及其他所有语言文件中添加该短剧的文案 key。
4. 将其追加到 `registry.ts` 中 `SKITS` 数组的末尾。数组顺序即方法编号（#01、#02……），因此不要插入中间。

**新增语言**

1. 在 `src/i18n/detect.ts` 中把语言代码加入 `LOCALES` 和 `LOCALE_NAMES`。
2. 在 `src/i18n/index.ts` 中添加该语言的加载器（loader），并在 `src/i18n/format.ts` 的 `CURRENCY` 中指定虚构估值使用的货币。
3. 新建 `src/i18n/locales/<code>.ts`，并使用 `satisfies Messages`。
4. 为 `skit.idiom.kind` 选择一个值：`sun-west | hen-teeth | cow-fly | hell-freezes | pigs-literal`。
5. 在 `tests/unit/i18n.test.ts` 的 `all` 表里加入新语言，然后运行 `pnpm typecheck && pnpm test`。

**文案约定**：笑话按各语言重新撰写，不做逐字翻译；`src/i18n/locales/en.ts` 是文案的权威来源（source of truth），其他语言缺少任何 key 都会导致 `pnpm typecheck` 失败。

## 部署

推送到 `main` 分支或手动触发（`.github/workflows/deploy.yml`）时，依次执行 install → typecheck → 单元测试 → build，并上传 `dist` 发布到 GitHub Pages。Vite 配置了 `base: './'` 并使用哈希路由，因此站点既可通过 github.io 地址访问（https://mr-monkeyray.github.io/make-pigs-fly/，部署后），也可通过自定义域名访问。

**一次性设置**

1. 仓库 Settings → Pages → Source 选择 “GitHub Actions”。
2. 在 GitHub 账号的 Settings → Pages 中点击 “Add a domain”，验证域名 `makepigs.fly`。这会添加一条 TXT 记录 `_github-pages-challenge-<user>`，用于防止域名被他人接管（domain takeover）。
3. 在域名注册商处设置 DNS 记录：
   - apex A 记录：`185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`
   - apex AAAA 记录：`2606:50c0:8000::153`、`2606:50c0:8001::153`、`2606:50c0:8002::153`、`2606:50c0:8003::153`
   - 可选：将 `www` 设置为 CNAME，指向 `mr-monkeyray.github.io`
4. 仓库 Settings → Pages → Custom domain 填写 `makepigs.fly`。使用 Actions 部署时，仓库中的 CNAME 文件会被忽略，因此必须在 Settings 中设置域名。
5. 等待证书签发完成后，勾选 “Enforce HTTPS”。

**注意 HSTS**：`.fly` 由 Google Registry 管理，注册商（如 Gandi）反馈该域名已列入浏览器 HSTS preload 列表，浏览器只会使用 HTTPS。因此在 GitHub 签发证书前，自定义域名无法打开，请先使用 github.io 地址；可到 hstspreload.org 自行核实。

## 声明

- 请勿将“飞猪”用作品牌名，以免与阿里巴巴旅行品牌 Fliggy 混淆。
- “风口”梗以网络梗的形式呈现，不归因于任何人。
- 文中出现的所有估值均为虚构。
- 本项目以 MIT 许可证发布。仓库：https://github.com/MR-MonkeyRay/make-pigs-fly
