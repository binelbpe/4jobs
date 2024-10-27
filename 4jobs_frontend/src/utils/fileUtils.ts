export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; 
export const MAX_VIDEO_SIZE = 40 * 1024 * 1024; 
export const TARGET_VIDEO_SIZE = 40 * 1024 * 1024; 
export const MAX_CONTENT_LENGTH = 2000; 
