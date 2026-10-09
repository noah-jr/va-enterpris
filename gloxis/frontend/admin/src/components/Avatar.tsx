import React, { useState } from 'react'
import { useFileUrl } from '../hooks/useFileUrl'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZE_CLASSES = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
  xl: 'w-12 h-12 text-base'
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'Cliente',
  size = 'md',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false)
  const { getFileUrl } = useFileUrl()

  const imageUrl = src ? getFileUrl(src) : null
  const initials = name?.trim() ? name.trim().charAt(0).toUpperCase() : 'C'

  if (imageUrl && !imageError) {
    return (
      <img
        src={imageUrl}
        alt={name || 'Avatar'}
        onError={() => setImageError(true)}
        className={`${SIZE_CLASSES[size]} rounded-full object-cover border border-[var(--color-border)] shrink-0 ${className}`}
      />
    )
  }

  return (
    <div className={`${SIZE_CLASSES[size]} rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/30 shrink-0 ${className}`}>
      {initials}
    </div>
  )
}
