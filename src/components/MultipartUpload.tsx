import { useCallback, useRef, useState } from "react";
import { SingleUpload } from "./SingleUpload";
import { Button } from "./ui/button";

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
    <div className="flex flex-col items-start space-y-8 mb-10 pb-10 border-b border-b-blue-600">
      <input type='file' ref={fileRef} className="w-full md:w-auto max-w-100 h-30 rounded-xl p-5 border-2 border-dashed border-blue-500 bg-blue-100"/>
      <Button variant="outline" size="lg" onClick={handleUpload} >Start</Button>

      <ul className="max-w-250 grid grid-cols-2 md:grid-cols-4 gap-8">
        {uploadItems.map((item) => (
          <li key={item.name}>
            <SingleUpload file={item} onDelete={() => handleDelete(item)}/>
          </li>
        ))}
      </ul>
    </div>
  )
}
