import { actions } from "astro:actions";
import { useCallback, useEffect, useState } from "react";
import { displaySize } from "../utils/file";
import { LIST_LIMIT } from "../consts";

export const BucketList = () => {
  const [cursor, setCursor] = useState<string | undefined>()
  const [list, setList] = useState<Partial<R2Object>[]>([]);

  const handleLoadMore = useCallback(async () => {
    const { data } = await actions.bucket.list({
      cursor,
      limit: LIST_LIMIT,
    });
    if (data) {
      setList(prev => [...prev, ...data.objects]);
      setCursor(data.cursor)
    }
  }, [cursor])

  const handleRefresh = useCallback(async () => {
    const { data } = await actions.bucket.list({ limit: LIST_LIMIT });
    if (data) {
      setList(data.objects);
      setCursor(data.cursor)
    }
  }, []);

  const handleDownload = useCallback(async (item: Partial<R2Object>) => {
    if (!item.key) return
    const search = `key=${encodeURIComponent(item.key)}&bucket=common`
    fetch(`https://r2.ebichu.cc?${search}`).then(res => res.json()).then((res: any) => {
      window.open(res.url, '_blank')
    })
  }, []);

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <div className="max-w-250 space-y-5">
      <button
        onClick={handleRefresh}
        className="border-2 rounded border-amber-600 p-1 hover:bg-amber-700 hover:text-white"
      >
        Refresh List
      </button>
      <ul className="p-3 bg-amber-300 space-y-5">
        {list.map((item) => (
          <li key={item.key} className="bg-gray-100/50 p-3 space-x-3 space-y-3 grid grid-cols-2 md:grid-cols-4">
            <span>{item.key}</span>
            <span>{Number.isSafeInteger(item.size) ? displaySize(item.size ?? 0) : 'N/A'}</span>
            <span className="text-ellipsis">{item.uploaded?.toLocaleString()}</span>
            <span className="flex justify-end">
              <button className="button" onClick={() => handleDownload(item)}>↓ Download</button>
            </span>
          </li>
        ))}
      </ul>
      {cursor && (
        <button
          onClick={handleLoadMore}
          className="button border-amber-600 p-1 hover:bg-amber-700"
        >
          Load More
        </button>
      )}
    </div>
  );
};
