
/**
 * Extension for the ImageService to add additional methods
 */
import { ImageService as BaseImageService, ImageServiceExtension } from '@/services/ImageService';

// Export the combined service
export const ImageService = {
  ...BaseImageService,
  
  // Add the new method
  searchImages: ImageServiceExtension.searchImages,
  generateImage: BaseImageService.generateImage
};
