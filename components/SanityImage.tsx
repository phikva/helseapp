import { Image, ImageProps } from 'react-native'
import { urlFor } from '@lib/sanity'

interface SanityImageProps extends Omit<ImageProps, 'source'> {
  source: string
  width?: number
  height?: number
}

export function SanityImageComponent({ source, width, height, ...props }: SanityImageProps) {
  const imageUrl = urlFor(source)
    .auto('format')
    .fit('max')

  if (width) imageUrl.width(width)
  if (height) imageUrl.height(height)

  return (
    <Image
      source={{ uri: imageUrl.url() }}
      style={{ width, height }}
      resizeMode="contain"
      {...props}
    />
  )
} 