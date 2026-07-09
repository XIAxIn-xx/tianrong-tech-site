# Tianrong Tech Site

天戎科技中文官网。

## Run

```bash
corepack prepare pnpm@9.15.4 --activate
pnpm install --ignore-scripts
pnpm dev
```

Routes:

- `/` 中文官网首页
- `/zh-cn` 中文官网首页别名
- `/classic` 旧版中文页面对比

Content is centralized in `data/tianrong.ts`.

## Mainland China Install Note

The project includes `.npmrc` configured for `https://registry.npmmirror.com/` and `ignore-scripts=true`.

If dependency installation is slow or interrupted, close unstable VPN connections and run the commands above again.

Static images live under `public/images/`.
