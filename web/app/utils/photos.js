export const MAX_PHOTOS = 5;
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"];

/**
 * Валидирует выбранные файлы и возвращает принятые + первую ошибку.
 * @param {File[]} files
 * @param {number} currentCount — сколько фото уже добавлено
 * @returns {{ accepted: File[], error: string | null }}
 */
export function validatePhotoFiles(files, currentCount = 0) {
  const accepted = [];
  let error = null;

  for (const file of files) {
    if (currentCount + accepted.length >= MAX_PHOTOS) {
      error = `Можно добавить не больше ${MAX_PHOTOS} фото.`;
      break;
    }
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      error = "Поддерживаются только JPG и PNG.";
      continue;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      error = "Каждое фото должно быть не больше 5 МБ.";
      continue;
    }
    accepted.push(file);
  }

  return { accepted, error };
}

export function makePhotoEntry(file) {
  return { id: crypto.randomUUID(), file, url: URL.createObjectURL(file) };
}

export function revokePhoto(photo) {
  URL.revokeObjectURL(photo.url);
}