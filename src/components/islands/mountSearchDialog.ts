/**
 * 搜索弹窗挂载入口（IMPL-056，评审报告 4.8）：独立模块使 Vue 运行时、
 * Reka UI 与 SearchDialog 打包进一个按需 chunk，只在首次唤起搜索时由
 * SiteHeader 的启动脚本动态 import，不再随全站首屏（原 client:idle）加载。
 */
import { createApp } from 'vue';
import SearchDialog from './SearchDialog.vue';

export function mountSearchDialog(host: HTMLElement): { unmount: () => void } {
  const app = createApp(SearchDialog);
  app.mount(host);
  return app;
}
