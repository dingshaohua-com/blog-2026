/**
 * 心情 / 说说列表（与 blog-2022 GET /mood 一致）
 */
import { customAxiosInstance } from '../api.base';
import type { UtilsJsonResult } from '../model';

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export type MoodRecord = {
  id?: number;
  /** 后端多为 HTML */
  content?: string;
  createTime?: string;
};

export type MoodListPayload = {
  items: MoodRecord[];
  total: number;
  current: number;
  size: number;
};

export function normalizeMoodList(raw: unknown): MoodListPayload {
  if (Array.isArray(raw)) {
    const items = raw as MoodRecord[];
    return { items, total: items.length, current: 1, size: items.length || 14 };
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const fromList = Array.isArray(o.list) ? (o.list as MoodRecord[]) : null;
    const fromRecords = Array.isArray(o.records) ? (o.records as MoodRecord[]) : null;
    const items = fromList ?? fromRecords ?? [];
    const hasShape = fromList != null || fromRecords != null || 'total' in o;
    if (hasShape) {
      const total = typeof o.total === 'number' ? o.total : items.length;
      const current = typeof o.current === 'number' ? o.current : 1;
      const size = typeof o.size === 'number' ? o.size : 14;
      return { items, total, current, size };
    }
  }
  return { items: [], total: 0, current: 1, size: 14 };
}

/**
 * @summary 心情列表（分页参数 current、size）
 */
export const getMood = (options?: SecondParameter<typeof customAxiosInstance<UtilsJsonResult>>) => {
  return customAxiosInstance<UtilsJsonResult>({ url: `/mood`, method: 'GET' }, options);
};

export type GetMoodResult = NonNullable<Awaited<ReturnType<typeof getMood>>>;
