import { actions } from "astro:actions";
import { useCallback, useEffect, useState } from "react";

export const BucketList = () => {
  const [list, setList] = useState<Partial<R2Object>[]>([]);
  const handleRefresh = useCallback(async () => {
    const { data } = await actions.bucket.list({});
    if (data) {
      setList(data);
    }
  }, []);
  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <div className="max-w-200 space-y-5 p-8">
      <button
        onClick={handleRefresh}
        className="border-2 rounded border-amber-600 p-1 hover:bg-amber-700 hover:text-white"
      >
        Refresh List
      </button>
      <ul className="p-3 bg-amber-300 space-y-5">
        {list.map((item) => (
          <li key={item.key} className="bg-gray-100/50 p-2">
            {item.key}
          </li>
        ))}
      </ul>
    </div>
  );
};
