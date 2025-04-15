
/**
 * Extension for the ImageService to add additional methods
 */
import { ImageService as BaseImageService, ImageServiceExtension } from '@/services/ImageService';

// Export the combined service
export const ImageService = {
  ...BaseImageService,
  
  // Add all methods explicitly to ensure TypeScript picks them up correctly
  searchImages: ImageServiceExtension.searchImages,
  generateImage: BaseImageService.generateImage
};
