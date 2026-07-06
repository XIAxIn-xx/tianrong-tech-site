# Hyper AI Force Website

Independent MVP website for Hyper AI Force Limited / 超流智能有限公司.

## Run

```bash
corepack prepare pnpm@9.15.4 --activate
pnpm install --ignore-scripts
pnpm dev
```

Routes:

- `/` English homepage
- `/zh-hk` Traditional Chinese homepage

Content is centralized in `data/hyper.ts`.

## Mainland China Install Note

The project includes `.npmrc` configured for `https://registry.npmmirror.com/` and `ignore-scripts=true`.

If dependency installation is slow or interrupted, close unstable VPN connections and run the commands above again.

The generated hero image is saved at `public/images/generated/hyper-hero-robotics.png`.
