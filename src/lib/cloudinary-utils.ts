// Legacy Cloudinary utilities — kept for backward compatibility with existing URLs.
// New uploads go to Supabase Storage; optimizeImage passes non-Cloudinary URLs through unchanged.
export {
  isCloudinaryUrl,
  optimizeCloudinaryUrl,
  optimizeImage,
  optimizeThumbnail,
  optimizeHero,
  optimizeGallery,
  optimizeCard,
  optimizeAvatar,
} from "./media/cloudinary-url"

export { getBlurUrl, getBlurBackgroundStyle, getBlurDataUrl } from "./media/placeholders"

export { FOLDERS, sanitizeFolderName } from "./media/validation"