import React, { useState } from 'react'
import { useFileUrl } from '../hooks/useFileUrl'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: number
  className?: string
  style?: React.CSSProperties
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'Cliente',
  size = 36,
  className = '',
  style = {}
}) => {
  const [imageError, setImageError] = useState(false)
  const { getFileUrl } = useFileUrl()

  const imageUrl = src ? getFileUrl(src) : null
  const initials = name?.trim() ? name.trim().charAt(0).toUpperCase() : 'C'

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    ...style
  }

  if (imageUrl && !imageError) {
    return (
      <img
        src={imageUrl}
        alt={name || 'Avatar'}
        onError={() => setImageError(true)}
        className={className}
        style={{
          ...containerStyle,
          objectFit: 'cover',
          border: '1px solid #e2e8f0'
        }}
      />
    )
  }

  return (
    <div
      className={className}
      style={{
        ...containerStyle,
        background: '#eff6ff',
        color: '#1d4ed8',
        fontWeight: 700,
        fontSize: Math.max(11, Math.round(size * 0.38)),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #bfdbfe'
      }}
    >
      {initials}
    </div>
  )
}
