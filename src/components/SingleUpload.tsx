import { actions } from "astro:actions";
import { startTransition, useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

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
    const uploadInit = await actions.upload.create({ key })
    if (!uploadInit.data?.uploadId) {
      setStatus(Status.Error)
      return
    }
    setStatus(Status.Created)
    const { uploadId } = uploadInit.data

    for await (const index of Array.from({ length: chunkLength }).map((v, i) => i)) {
      const slicedBlob = file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
      const arrayBuffer = await slicedBlob.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const blob = new Blob([uint8Array], { type: file.type });
      // const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
      const formData = new FormData()
      formData.append('key', key)
      formData.append('uploadId', uploadId)
      formData.append('partNumber', String(index + 1))
      formData.append('file', blob)

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
    <div className="p-3 rounded border border-t-blue-600">
      <h3>{key}</h3>
      <div className="flex flex-col">
        <p>Status: {status}</p>
        <p>{uploadedCount} / {chunkLength}</p>
        <p>{status === Status.Completed && result?.httpEtag}</p>
        <button
          className="mt-4 border-2 rounded border-border-t-rose-600 p-1 px-3 hover:bg-rose-700 hover:text-white"
          onClick={onDelete}
          disabled={[Status.Created, Status.Uploading].includes(status)}
        >Delete</button>
      </div>
    </div>
  )
}
