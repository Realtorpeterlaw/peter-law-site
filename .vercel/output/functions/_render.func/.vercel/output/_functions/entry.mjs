import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_CmsvSfAp.mjs';
import { manifest } from './manifest_BzRIhBwE.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/api/contact.astro.mjs');
const _page3 = () => import('./pages/contact/thanks.astro.mjs');
const _page4 = () => import('./pages/contact.astro.mjs');
const _page5 = () => import('./pages/for-landlords.astro.mjs');
const _page6 = () => import('./pages/for-renters.astro.mjs');
const _page7 = () => import('./pages/zh.astro.mjs');
const _page8 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/api/contact.ts", _page2],
    ["src/pages/contact/thanks.astro", _page3],
    ["src/pages/contact.astro", _page4],
    ["src/pages/for-landlords.astro", _page5],
    ["src/pages/for-renters.astro", _page6],
    ["src/pages/zh.astro", _page7],
    ["src/pages/index.astro", _page8]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "83b90511-8b37-40d7-9596-8f48cf642bec",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
