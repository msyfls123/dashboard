import { useCallback, useRef, useState } from "react";
import { SingleUpload } from "./SingleUpload";

export const MultipartUpload = () => {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [uploadItems, setUploadItems] = useState<File[]>([])

  const handleUpload = useCallback(() => {
    const files = fileRef.current?.files
    if (!files?.length) return

    setUploadItems(prev => [...prev, ...Array.from(files)])
  }, [])

  const handleDelete = useCallback((file: File) => {
    setUploadItems(prev => prev.filter(f => f !== file))
  }, [])

  return (
    <div className="flex flex-col items-start space-y-8 mb-10">
      <input type='file' ref={fileRef} className="max-w-100 h-30 rounded-xl p-5 border-2 border-dashed border-blue-500 bg-blue-100"/>
      <button onClick={handleUpload} className="flex-none border-2 rounded border-border-t-emerald-600 p-1 px-3 hover:bg-emerald-700 hover:text-white">Start</button>

      <ul className="max-w-250 grid grid-cols-4 gap-8">
        {uploadItems.map((item) => (
          <li key={item.name}>
            <SingleUpload file={item} onDelete={() => handleDelete(item)}/>
          </li>
        ))}
      </ul>
    </div>
  )
}
