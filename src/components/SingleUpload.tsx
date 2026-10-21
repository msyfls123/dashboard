import { actions } from "astro:actions";
import { cn } from "@/utils/shadcn";
import { startTransition, useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";

interface SingleUploadProps {
  file: File
  prefix?: string
  onDelete: () => void
}

enum Status {
  Idle = 'idle',
  Created = 'created',
  Uploading = 'uploading',
  Completed = 'completed',
  Aborted = 'aborted',
  Error = 'error'
}

const CHUNK_SIZE = 5 * 1024 * 1024

export const SingleUpload = ({ file, prefix, onDelete }: SingleUploadProps) => {
  const chunkLength = useMemo(() => Math.ceil(file.size / CHUNK_SIZE), [file])
  const key = useMemo(() => prefix ? prefix + file.name : file.name, [file, prefix])
  const [status, setStatus] = useState(Status.Idle)
  const [uploadedCount, setUploadedCount]= useState<number>(0)
  const uploadedPartsRef = useRef<R2UploadedPart[]>([])
  const [result, setResult] = useState<Partial<R2Object> | null>(null)

  const handleUpload = useEffectEvent(async () => {
    const uploadInit = await actions.upload.create({ key, contentType: file.type })
    if (!uploadInit.data?.uploadId) {
      setStatus(Status.Error)
      return
    }
    setStatus(Status.Created)
    const { uploadId } = uploadInit.data

    for await (const index of Array.from({ length: chunkLength }).map((v, i) => i)) {
      const slicedBlob = file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
      const formData = new FormData()
      formData.append('key', key)
      formData.append('uploadId', uploadId)
      formData.append('partNumber', String(index + 1))
      formData.append('file', slicedBlob, key)

      setStatus(Status.Uploading)
      try {
        const uploadedPart = await actions.upload.part(formData)
        if (!uploadedPart.data?.etag) {
          setStatus(Status.Error)
          return
        }
        setUploadedCount(prev => prev + 1)
        uploadedPartsRef.current = [...uploadedPartsRef.current, uploadedPart.data]
      } catch (err) {
        setStatus(Status.Error)
        return
      }
    }

    const result = await actions.upload.complete({
      uploadId,
      key,
      parts: uploadedPartsRef.current
    })
    if (result.data) {
      setResult(result.data)
      setStatus(Status.Completed)
    } else {
      setStatus(Status.Error)
    }
  })

  useEffect(() => {
    handleUpload()
  }, [file])

  return (
    <div className="p-3 rounded border bg-blue-100/50">
      <h3 className="text-lg">
        <span
          className={cn(
            'inline-block align-baseline mb-0.5 mr-2 rounded-full size-3',
            status === Status.Idle && 'bg-cyan-500',
            status === Status.Uploading && 'bg-amber-400',
            status === Status.Error && 'bg-rose-600',
            status === Status.Completed && 'bg-green-500',
          )}
        ></span>
        <span className="break-all">{key}</span>
      </h3>
      <div className="flex flex-col mt-2 pt-2 border-t border-t-sky-800 border-dashed">
        <p>Status: {status}</p>
        <p>{uploadedCount} / {chunkLength}</p>
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={[Status.Created, Status.Uploading].includes(status)}
        >Delete</Button>
      </div>
    </div>
  )
}
