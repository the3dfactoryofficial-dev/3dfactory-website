export class StorageUploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "StorageUploadError"
  }
}

export interface StorageUploadResult {
  path: string
  publicUrl: string
}

export interface StorageUploadOptions {
  folder: string
  mediaType?: "image" | "video"
}

export interface AbortableStorageUpload {
  promise: Promise<StorageUploadResult>
  abort: () => void
}

export async function uploadToStorage(
  file: File,
  options: StorageUploadOptions
): Promise<StorageUploadResult> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", options.folder)
  if (options.mediaType) formData.append("mediaType", options.mediaType)

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new StorageUploadError(err.error ?? "Upload failed")
  }

  return res.json()
}

export function uploadToStorageWithProgress(
  file: File,
  options: StorageUploadOptions,
  onProgress?: (pct: number) => void
): AbortableStorageUpload {
  const xhr = new XMLHttpRequest()
  let rejected = false

  const promise = new Promise<StorageUploadResult>(async (resolve, reject) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", options.folder)
      if (options.mediaType) formData.append("mediaType", options.mediaType)

      onProgress?.(10)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress?.(10 + Math.round((e.loaded / e.total) * 85))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText)
            onProgress?.(100)
            resolve({ path: result.path, publicUrl: result.publicUrl })
          } catch {
            reject(new StorageUploadError("Failed to parse upload response"))
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText)
            reject(new StorageUploadError(err.error ?? "Upload failed"))
          } catch {
            reject(new StorageUploadError(`Upload failed with status ${xhr.status}`))
          }
        }
      }

      xhr.onerror = () => reject(new StorageUploadError("Network error during upload"))
      xhr.onabort = () => reject(new StorageUploadError("Upload was cancelled"))

      xhr.open("POST", "/api/upload")
      xhr.send(formData)
    } catch (err) {
      reject(err instanceof StorageUploadError ? err : new StorageUploadError("Upload preparation failed"))
    }
  })

  return {
    promise,
    abort: () => {
      rejected = true
      xhr.abort()
    },
  }
}