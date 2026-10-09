import React from 'react'
import { useFileUrl } from '../hooks/useFileUrl'
import { Download } from 'lucide-react'

interface AttachmentLinkProps {
  path?: string | null
  fallbackPath?: string | null
  label?: string
  title?: string
  className?: string
  icon?: React.ReactNode
}

export const AttachmentLink: React.FC<AttachmentLinkProps> = ({
  path,
  fallbackPath,
  label,
  title = 'Ver Comprovativo Anexado',
  className = 'px-2 py-1 text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 text-xs',
  icon = <Download className="w-3.5 h-3.5" />
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
      className={className}
      title={title}
    >
      {icon}
      {label && <span>{label}</span>}
    </a>
  )
}
