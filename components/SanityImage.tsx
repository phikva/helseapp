import { Image, ImageProps, View } from 'react-native'
import { urlFor } from '../lib/sanity'
import { SvgUri } from 'react-native-svg'
import { useState, useEffect } from 'react'
import { useSvgColor, ColorMapping } from '../hooks/useSvgColor'

interface SanityImageProps extends Omit<ImageProps, 'source'> {
  source: any // Changed to 'any' to handle both string and object formats
  width?: number
  height?: number
  onColorExtracted?: (colors: ColorMapping) => void
}

export function SanityImageComponent({ 
  source, 
  width, 
  height, 
  onColorExtracted,
  ...props 
}: SanityImageProps) {
  const [isSvg, setIsSvg] = useState<boolean | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const colorMapping = useSvgColor(source)

  useEffect(() => {
    // Check if the source is an SVG based on Sanity metadata
    const checkIfSvg = () => {
      // If source is an object with extension property
      if (source && typeof source === 'object' && source.asset && source.asset.extension) {
        setIsSvg(source.asset.extension.toLowerCase() === 'svg')
        return
      }
      
      // If source is an object with mimeType property
      if (source && typeof source === 'object' && source.asset && source.asset.mimeType) {
        setIsSvg(source.asset.mimeType.toLowerCase().includes('svg'))
        return
      }
      
      // Fallback to URL check
      const imageUrl = urlFor(source).url()
      setIsSvg(imageUrl.toLowerCase().endsWith('.svg'))
    }
    
    checkIfSvg()
  }, [source])

  // Call the onColorExtracted callback when colors are extracted
  useEffect(() => {
    if (onColorExtracted) {
      onColorExtracted(colorMapping)
    }
  }, [colorMapping, onColorExtracted])

  // Generate the image URL using Sanity's URL builder
  const imageUrl = urlFor(source)
    .auto('format')
    .fit('max')

  if (width) imageUrl.width(width)
  if (height) imageUrl.height(height)

  const finalUrl = imageUrl.url()

  // If we haven't determined if it's an SVG yet, show a placeholder
  if (isSvg === null) {
    return <View style={{ width, height }} />
  }

  // If it's an SVG, use SvgUri
  if (isSvg) {
    return (
      <View style={{ width, height }}>
        <SvgUri
          width={width}
          height={height}
          uri={finalUrl}
          onError={(e) => {
            console.error('SVG loading error:', e)
            setError(e)
            setIsSvg(false) // Fallback to regular image on error
          }}
        />
      </View>
    )
  }

  // For non-SVG images or fallback
  return (
    <Image
      source={{ uri: finalUrl }}
      style={{ width, height }}
      resizeMode="contain"
      {...props}
    />
  )
} 