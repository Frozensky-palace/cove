import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind 类名（shadcn-vue 约定的 cn 工具）。
 * 供 Vue Island 与 Astro 组件共用。
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
