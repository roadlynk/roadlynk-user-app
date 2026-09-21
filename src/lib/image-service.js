import { api } from './api-client'

// POST {{apiBaseUrl}}/images/upload-multiple — multipart/form-data, one
// "files" part per file, bearer auth (added by the api client).
// -> { success: true, data: [{ url, ... }] }  (one entry per file, in the
// order sent). Only the `url` of each entry is ever used or saved.
// Resolves with the list of URLs.
export async function uploadImagesApi(files) {
  const body = new FormData()
  for (const file of files) body.append('files', file)
  const { data } = await api.post('/images/upload-multiple', body)
  return (data?.data ?? []).map((item) => item?.url).filter(Boolean)
}

/** Uploads a single file and resolves with its URL. */
export async function uploadImageApi(file) {
  const urls = await uploadImagesApi([file])
  const url = urls[0]
  if (!url) throw new Error('The upload did not return a file URL.')
  return url
}
