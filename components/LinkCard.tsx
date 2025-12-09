'use client';

import { ExternalLink, Github, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkCardProps {
  link: {
    _id: string;
    title: string;
    url: string;
    imageUrl?: string | null;
    description?: string;
    metadataImage?: string;
    isAdult?: boolean;
    useMetadata?: boolean;
    isRepo?: boolean;
    livePreviewUrl?: string;
    repoUrl?: string;
  };
  cardClasses: string;
  buttonRadius: string;
  textColor: string;
}

export default function LinkCard({ link, cardClasses, buttonRadius, textColor }: LinkCardProps) {
  // Get favicon URL if useMetadata is enabled
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
      return null;
    }
  };

  const displayImage =
    link.imageUrl || (link.useMetadata !== false ? link.metadataImage || getFaviconUrl(link.url) : null);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (link.isAdult) {
      e.preventDefault();
      if (confirm('⚠️ This link contains adult content (18+). Do you want to continue?')) {
        window.open(link.url, '_blank');
      }
    }
  };

  // Check if link has description or metadata image - show as rich card
  const hasRichContent = link.description || displayImage;

  // Rich card layout for all links with metadata
  if (hasRichContent) {
    return (
      <div
        className={cn('w-full transition-all duration-300 hover:shadow-lg', cardClasses, 'overflow-hidden')}
        style={{ borderRadius: buttonRadius }}
      >
        {/* Image */}
        {displayImage && (
          <div className="w-full aspect-video overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <img
              src={displayImage}
              className="w-full h-full object-cover"
              alt={link.title}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg truncate" style={{ color: textColor }}>
                  {link.title}
                </h3>
                {link.isAdult && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded shrink-0">
                    18+
                  </span>
                )}
              </div>
              {link.description && (
                <p className="text-sm opacity-70 line-clamp-3 break-words" style={{ color: textColor }}>
                  {link.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            {/* GitHub Repo Buttons */}
            {link.isRepo && link.livePreviewUrl && (
              <a
                href={link.livePreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="w-4 h-4" />
                Live Preview
              </a>
            )}
            {link.isRepo && link.repoUrl && (
              <a
                href={link.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neutral-800 dark:bg-neutral-700 hover:bg-neutral-900 dark:hover:bg-neutral-600 text-white rounded-lg transition-colors font-medium text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4" />
                Repository
              </a>
            )}

            {/* Regular Link Button */}
            {!link.isRepo && (
              <a
                href={link.isAdult ? '#' : link.url}
                target={link.isAdult ? '_self' : '_blank'}
                rel="noopener noreferrer"
                onClick={handleClick}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Visit Link
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Simple card for links without metadata
  return (
    <a
      href={link.isAdult ? '#' : link.url}
      target={link.isAdult ? '_self' : '_blank'}
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        'block w-full transition-all duration-300 hover:scale-[1.02] hover:shadow-md',
        cardClasses,
        'group overflow-hidden',
      )}
      style={{ borderRadius: buttonRadius }}
    >
      <div className="p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold truncate" style={{ color: textColor }}>
              {link.title}
            </span>
            {link.isAdult && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded shrink-0">18+</span>
            )}
          </div>
        </div>
        <ExternalLink
          className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity shrink-0"
          style={{ color: textColor }}
        />
      </div>
    </a>
  );
}
