export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export function compressImage(
  file: File, 
  options: CompressOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const { 
      maxWidth = 800, 
      maxHeight = 800, 
      quality = 0.8 
    } = options

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }

    img.onload = () => {
      let { width, height } = img

      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
      resolve(compressedDataUrl)
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

export function getImageSizeInfo(dataUrl: string) {
  const sizeInBytes = Math.round((dataUrl.length * 3) / 4)
  const sizeInKB = Math.round(sizeInBytes / 1024)
  const sizeInMB = Math.round(sizeInKB / 1024 * 100) / 100
  
  return {
    bytes: sizeInBytes,
    kb: sizeInKB,
    mb: sizeInMB,
    formatted: sizeInMB > 1 ? `${sizeInMB}MB` : `${sizeInKB}KB`
  }
}