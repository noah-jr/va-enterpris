import React from 'react'
import { useFileUrl } from '../hooks/useFileUrl'
import { Download } from 'lucide-react'

interface AttachmentLinkProps {
  path?: string | null
  fallbackPath?: string | null
  label?: string
  title?: string
  className?: string
  style?: React.CSSProperties
  icon?: React.ReactNode
  download?: boolean
}

export const AttachmentLink: React.FC<AttachmentLinkProps> = ({
  path,
  fallbackPath,
  label,
  title,
  className = '',
  style = {},
  icon = <Download size={13} />,
  download = false
}) => {
  const { getFileUrl } = useFileUrl()
  const targetPath = path || fallbackPath
  const url = getFileUrl(targetPath)

  if (!url) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      download={download}
      className={className}
      style={style}
      title={title}
    >
      {icon}
      {label && <span>{label}</span>}
    </a>
  )
}
