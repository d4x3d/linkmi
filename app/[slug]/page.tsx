import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import ViewTracker from '@/components/ViewTracker';
import TitleWithEffect from '@/components/TitleWithEffect';
import MeshBackground from '@/components/MeshBackground';
import LinkCard from '@/components/LinkCard';
import { Inter, Roboto, Playfair_Display, Space_Mono, Poppins, Montserrat } from 'next/font/google';
import { ExternalLink } from 'lucide-react';
import ProductsSection from '@/components/ProductsSection';

// React Icons for social platforms
import {
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaLinkedinIn,
  FaFacebookF,
  FaGithub,
  FaPinterestP,
  FaSnapchatGhost,
  FaSpotify,
  FaTwitch,
  FaDiscord,
  FaTelegramPlane,
  FaWhatsapp,
  FaDribbble,
  FaBehance,
  FaMediumM,
  FaPatreon,
  FaRedditAlien,
  FaSoundcloud,
  FaVimeoV,
  FaEtsy,
  FaAmazon,
  FaApple,
} from 'react-icons/fa';
import { SiX, SiThreads, SiSubstack, SiGumroad, SiKofi } from 'react-icons/si';
import { MdEmail, MdWeb } from 'react-icons/md';
import { IconType } from 'react-icons';

// Font configurations
const inter = Inter({ subsets: ['latin'] });
const roboto = Roboto({ weight: ['400', '700'], subsets: ['latin'] });
const playfair = Playfair_Display({ subsets: ['latin'] });
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'] });
const poppins = Poppins({ weight: ['400', '500', '600', '700'], subsets: ['latin'] });
const montserrat = Montserrat({ subsets: ['latin'] });

// Social platform icons mapping
const SOCIAL_ICONS: Record<string, IconType> = {
  instagram: FaInstagram,
  twitter: SiX,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  linkedin: FaLinkedinIn,
  facebook: FaFacebookF,
  threads: SiThreads,
  github: FaGithub,
  dribbble: FaDribbble,
  behance: FaBehance,
  discord: FaDiscord,
  telegram: FaTelegramPlane,
  whatsapp: FaWhatsapp,
  snapchat: FaSnapchatGhost,
  spotify: FaSpotify,
  twitch: FaTwitch,
  soundcloud: FaSoundcloud,
  vimeo: FaVimeoV,
  medium: FaMediumM,
  substack: SiSubstack,
  patreon: FaPatreon,
  gumroad: SiGumroad,
  kofi: SiKofi,
  pinterest: FaPinterestP,
  etsy: FaEtsy,
  amazon: FaAmazon,
  reddit: FaRedditAlien,
  apple: FaApple,
  email: MdEmail,
  website: MdWeb,
};

const SOCIAL_COLORS: Record<string, string> = {
  instagram: '#E4405F',
  twitter: '#000000',
  youtube: '#FF0000',
  tiktok: '#000000',
  linkedin: '#0A66C2',
  facebook: '#1877F2',
  threads: '#000000',
  github: '#181717',
  dribbble: '#EA4C89',
  behance: '#1769FF',
  discord: '#5865F2',
  telegram: '#26A5E4',
  whatsapp: '#25D366',
  snapchat: '#FFFC00',
  spotify: '#1DB954',
  twitch: '#9146FF',
  soundcloud: '#FF5500',
  vimeo: '#1AB7EA',
  medium: '#000000',
  substack: '#FF6719',
  patreon: '#FF424D',
  gumroad: '#36A9AE',
  kofi: '#FF5E5B',
  pinterest: '#BD081C',
  etsy: '#F56400',
  amazon: '#FF9900',
  reddit: '#FF4500',
  apple: '#000000',
  email: '#EA4335',
  website: '#6366F1',
};

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const data = await fetchQuery(api.public.getPage, { slug });

  if (!data || !data.user) {
    notFound();
  }

  const { user, products, links } = data;
  const theme = user.themeConfig || {};
  const effect = theme.effect || 'none';

  // Typography
  const fontMap: Record<string, string> = {
    'Inter': inter.className,
    'Roboto': roboto.className,
    'Playfair Display': playfair.className,
    'Space Mono': spaceMono.className,
    'Poppins': poppins.className,
    'Montserrat': montserrat.className,
  };
  const fontClass = fontMap[user.fontFamily || 'Inter'] || inter.className;

  // Background
  const bgColor = user.backgroundColor || '#ffffff';
  const gradientEnd = user.gradientEndColor || '#6366f1';
  const gradientDir = user.gradientDirection || 'to-br';

  let bgStyle: React.CSSProperties = {};
  if (user.backgroundStyle === 'solid') {
    bgStyle = { backgroundColor: bgColor };
  } else if (user.backgroundStyle === 'gradient') {
    const directionMap: Record<string, string> = {
      'to-b': 'to bottom',
      'to-br': 'to bottom right',
      'to-r': 'to right',
      'to-tr': 'to top right',
      'to-t': 'to top',
      'to-tl': 'to top left',
      'to-l': 'to left',
      'to-bl': 'to bottom left',
    };
    bgStyle = {
      background: `linear-gradient(${directionMap[gradientDir] || 'to bottom right'}, ${bgColor}, ${gradientEnd})`,
    };
  }

  // Text Colors (use saved or calculate based on background)
  const isDarkBg = user.backgroundStyle === 'image' || user.backgroundStyle === 'mesh' || isDark(bgColor);
  const textColor = user.textColor || (isDarkBg ? '#ffffff' : '#1a1a1a');
  const mutedColor = user.mutedTextColor || (isDarkBg ? '#d4d4d4' : '#737373');

  // Button & Card styling
  const buttonStyle = user.buttonStyle || 'rounded';
  const buttonColor = user.buttonColor || '#7c3aed';
  const cardStyle = user.cardStyle || 'solid';
  const layoutStyle = user.layoutStyle || 'list';

  const buttonRadiusMap: Record<string, string> = {
    rounded: '0.5rem',
    pill: '9999px',
    square: '0',
    soft: '0.75rem',
  };
  const buttonRadius = buttonRadiusMap[buttonStyle] || '0.5rem';

  // Card class generation
  const getCardClasses = () => {
    switch (cardStyle) {
      case 'glass':
        return 'bg-white/10 backdrop-blur-md border border-white/20';
      case 'outline':
        return `border-2 ${isDarkBg ? 'border-white/30' : 'border-neutral-200'}`;
      case 'shadow':
        return 'bg-white shadow-lg';
      case 'solid':
      default:
        return `${isDarkBg ? 'bg-white/90' : 'bg-white'} border ${isDarkBg ? 'border-white/20' : 'border-neutral-200'}`;
    }
  };

  const getCardTextColor = () => {
    if (cardStyle === 'glass') return '#ffffff';
    if (cardStyle === 'outline' && isDarkBg) return '#ffffff';
    if (cardStyle === 'shadow' || cardStyle === 'solid') return isDarkBg ? '#1a1a1a' : textColor;
    return textColor;
  };

  const displayTitle = user.title || `@${user.slug}`;

  return (
    <div
      className={cn('min-h-screen relative overflow-hidden transition-colors duration-500', fontClass)}
      style={bgStyle}
    >
      <ViewTracker slug={slug} />

      {/* Mesh Gradient Background */}
      {user.backgroundStyle === 'mesh' && (
        <div className="absolute inset-0 z-0">
          <MeshBackground
            colors={user.meshColors && user.meshColors.length > 0 ? user.meshColors : [bgColor, gradientEnd]}
            speed={user.meshSpeed !== undefined ? user.meshSpeed : 0.01}
          />
        </div>
      )}

      {/* Background Image Layer */}
      {user.backgroundStyle === 'image' && user.backgroundImageUrl && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: `url(${user.backgroundImageUrl})` }}
        />
      )}

      {/* Overlay for Image/Mesh Backgrounds */}
      {(user.backgroundStyle === 'image' || user.backgroundStyle === 'mesh') && (
        <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[2px]" />
      )}

      {/* Content Container */}
      <div className="relative z-10 max-w-lg mx-auto py-16 px-4 sm:px-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div
            className={cn(
              'w-28 h-28 rounded-full mb-4 shadow-xl overflow-hidden border-4',
              isDarkBg ? 'border-white/20' : 'border-white',
            )}
          >
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt={user.title || user.slug} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-4xl font-bold text-white">
                {user.title ? user.title[0].toUpperCase() : user.slug[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Title with Effect - Client Component */}
          <TitleWithEffect title={displayTitle} effect={effect} textColor={textColor} />

          {user.bio && (
            <p
              className="text-lg max-w-sm font-medium leading-relaxed opacity-90 whitespace-pre-wrap"
              style={{ color: mutedColor }}
            >
              {user.bio}
            </p>
          )}

          {/* Socials */}
          {user.socials && user.socials.length > 0 && (
            <div className="flex gap-4 mt-6 flex-wrap justify-center">
              {user.socials
                .filter((s: any) => (s.isVisible || s.active) && s.url)
                .map((social: { platform: string; url: string }, idx: number) => {
                  const Icon = SOCIAL_ICONS[social.platform] || MdWeb;
                  const iconColor = SOCIAL_COLORS[social.platform] || '#6366f1';
                  return (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'p-3 rounded-full transition-all duration-300 hover:scale-110',
                        isDarkBg ? 'bg-white/20 hover:bg-white/30' : 'bg-neutral-100 hover:bg-neutral-200',
                      )}
                    >
                      <Icon className="w-5 h-5" style={{ color: iconColor }} />
                    </a>
                  );
                })}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="space-y-8">
          {/* Links Section */}
          {links.length > 0 && (
            <div className="space-y-3">
              {links.map((link: { _id: string; title: string; url: string; imageUrl?: string | null; description?: string; metadataImage?: string; isAdult?: boolean; useMetadata?: boolean }) => (
                <LinkCard
                  key={link._id}
                  link={link}
                  cardClasses={getCardClasses()}
                  buttonRadius={buttonRadius}
                  textColor={getCardTextColor()}
                />
              ))}
            </div>
          )}

          {/* Products Section */}
          {products.length > 0 && (
            <ProductsSection
              products={products}
              userId={user._id}
              layoutStyle={layoutStyle}
              cardStyle={cardStyle}
              buttonColor={buttonColor}
              isDarkBg={isDarkBg}
              textColor={textColor}
              buttonRadius={buttonRadius}
            />
          )}

          {products.length === 0 && links.length === 0 && (
            <div
              className={cn('text-center py-12 rounded-xl border border-dashed border-opacity-30')}
              style={{ borderColor: isDarkBg ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)', color: mutedColor }}
            >
              <p>This page is currently empty.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-20 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: mutedColor }}
          >
            <Image src="/favicon.png" alt="Slobi" width={16} height={16} className="rounded-sm" />
            Slobi
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper to determine if color is dark
function isDark(color: string): boolean {
  if (!color || !color.startsWith('#')) return false;
  const hex = color.substring(1);
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}
