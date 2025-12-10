'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import Typewriter from 'typewriter-effect';
import colors from 'nice-color-palettes';

// Lucide icons
import {
  Loader2,
  Save,
  X,
  Menu,
  Palette,
  Type,
  LayoutGrid,
  List,
  Sparkles,
  Check,
  Image as ImageIcon,
  RefreshCw,
  Smartphone,
  Monitor,
} from 'lucide-react';

// React Icons
import { FaInstagram, FaYoutube, FaTiktok, FaLinkedin, FaGithub, FaFacebook } from 'react-icons/fa';
import { SiX } from 'react-icons/si';
import { MdEmail, MdWeb } from 'react-icons/md';
import type { IconType } from 'react-icons';

import ImageUpload from '@/components/ImageUpload';
import { cn } from '@/lib/utils';
import MeshBackground from '@/components/MeshBackground';

// Social platform icons mapping
const SOCIAL_ICONS: Record<string, IconType> = {
  instagram: FaInstagram,
  twitter: SiX,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  linkedin: FaLinkedin,
  github: FaGithub,
  facebook: FaFacebook,
  email: MdEmail,
  website: MdWeb,
};

const SOCIAL_COLORS: Record<string, string> = {
  instagram: '#E4405F',
  twitter: '#000000',
  youtube: '#FF0000',
  tiktok: '#000000',
  linkedin: '#0A66C2',
  github: '#181717',
  facebook: '#1877F2',
  email: '#6366f1',
  website: '#6366f1',
};

// ============================================
// CONSTANTS
// ============================================

const FONTS = [
  { id: 'Inter', name: 'Inter', style: 'Clean & Modern', preview: 'font-sans' },
  { id: 'Roboto', name: 'Roboto', style: 'Classic', preview: 'font-sans' },
];

const EFFECTS = [
  { id: 'none', name: 'None', description: 'Clean and simple' },
  { id: 'typewriter', name: 'Typewriter', description: 'Typing animation' },
];

const BUTTON_STYLES = [
  { id: 'rounded', name: 'Rounded', radius: '0.5rem' },
  { id: 'square', name: 'Square', radius: '0' },
  { id: 'soft', name: 'Soft', radius: '0.75rem' },
];

const CARD_STYLES = [
  { id: 'solid', name: 'Solid', description: 'Classic solid background' },
  { id: 'glass', name: 'Glass', description: 'Frosted glass effect' },
  { id: 'outline', name: 'Outline', description: 'Border only' },
  { id: 'shadow', name: 'Shadow', description: 'Elevated with shadow' },
];

// Helper to check if color is dark
function isDark(color: string): boolean {
  if (!color || !color.startsWith('#')) return false;
  const hex = color.substring(1);
  const fullHex =
    hex.length === 3
      ? hex
          .split('')
          .map((x) => x + x)
          .join('')
      : hex;
  if (fullHex.length !== 6) return false;
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

type TabType = 'profile' | 'design' | 'layout';

export default function AppearancePage() {
  const user = useQuery(api.users.me);
  const links = useQuery(api.links.list);
  const products = useQuery(api.products.list);
  const updateTheme = useMutation(api.users.updateTheme);

  // Type guard: only proceed if user has a slug (full user record)
  const hasFullUserRecord = user && 'slug' in user && user.slug !== undefined;

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Form State - Profile
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');

  // Form State - Design
  const [fontFamily, setFontFamily] = useState('Inter');
  const [backgroundStyle, setBackgroundStyle] = useState('solid');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [gradientEndColor, setGradientEndColor] = useState('#6366f1');
  const [gradientDirection, setGradientDirection] = useState('to-br');
  const [textColor, setTextColor] = useState('#1a1a1a');
  const [mutedTextColor, setMutedTextColor] = useState('#737373');
  const [effect, setEffect] = useState('none');

  // Mesh State
  const [meshColors, setMeshColors] = useState<string[]>(colors[0]);
  const [meshSpeed, setMeshSpeed] = useState(0.01);

  // Form State - Layout & Cards
  const [layoutStyle, setLayoutStyle] = useState('list');
  const [buttonStyle, setButtonStyle] = useState('rounded');
  const [buttonColor, setButtonColor] = useState('#7c3aed');
  const [cardStyle, setCardStyle] = useState('solid');

  // Load user data
  useEffect(() => {
    if (user && user.slug) {
      setTitle(user.title || '');
      setBio(user.bio || '');
      setFontFamily(user.fontFamily || 'Inter');
      setBackgroundStyle(user.backgroundStyle || 'solid');
      setBackgroundColor(user.backgroundColor || '#ffffff');
      setGradientEndColor(user.gradientEndColor || '#6366f1');
      setGradientDirection(user.gradientDirection || 'to-br');
      setTextColor(user.textColor || '#1a1a1a');
      setMutedTextColor(user.mutedTextColor || '#737373');
      setLayoutStyle(user.layoutStyle || 'list');
      setButtonStyle(user.buttonStyle || 'rounded');
      setButtonColor(user.buttonColor || '#7c3aed');
      setCardStyle(user.cardStyle || 'solid');

      if (user.meshColors && user.meshColors.length > 0) {
        setMeshColors(user.meshColors);
      }
      if (user.meshSpeed !== undefined) {
        setMeshSpeed(user.meshSpeed);
      }

      const config = user.themeConfig || {};
      setEffect(config.effect || 'none');
    }
  }, [user]);

  // Calculate preview styles
  const previewStyles = useMemo(() => {
    let bgStyle: React.CSSProperties = {};

    if (backgroundStyle === 'solid') {
      bgStyle = { backgroundColor };
    } else if (backgroundStyle === 'gradient') {
      const directionMap: Record<string, string> = {
        'to-b': 'to bottom',
        'to-br': 'to bottom right',
        'to-r': 'to right',
        'to-tr': 'to top right',
      };
      bgStyle = {
        background: `linear-gradient(${directionMap[gradientDirection] || 'to bottom right'}, ${backgroundColor}, ${gradientEndColor})`,
      };
    }

    const buttonRadiusMap: Record<string, string> = {
      rounded: '0.5rem',
      pill: '9999px',
      square: '0',
      soft: '0.75rem',
    };

    return {
      background: bgStyle,
      textColor,
      mutedTextColor,
      buttonRadius: buttonRadiusMap[buttonStyle] || '0.5rem',
      buttonColor,
    };
  }, [
    backgroundStyle,
    backgroundColor,
    gradientEndColor,
    gradientDirection,
    textColor,
    mutedTextColor,
    buttonStyle,
    buttonColor,
  ]);

  const isDarkBg = useMemo(() => {
    return backgroundStyle === 'image' || backgroundStyle === 'mesh' || isDark(backgroundColor);
  }, [backgroundStyle, backgroundColor]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateTheme({
        title,
        bio,
        fontFamily,
        backgroundStyle,
        backgroundColor,
        gradientEndColor,
        gradientDirection,
        textColor,
        mutedTextColor,
        meshColors,
        meshSpeed,
        buttonStyle,
        buttonColor,
        cardStyle,
        layoutStyle,
        themeConfig: { effect },
      });
      toast.success('Changes saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (type: 'profile' | 'background', storageId: string) => {
    try {
      if (type === 'profile') {
        await updateTheme({ profileImageId: storageId as Id<'_storage'> });
        toast.success('Profile picture updated!');
      } else {
        await updateTheme({ backgroundImageId: storageId as Id<'_storage'> });
        toast.success('Background image updated!');
      }
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const randomizeMeshColors = () => {
    const randomPalette = colors[Math.floor(Math.random() * colors.length)];
    setMeshColors(randomPalette);
    toast.info('Randomized mesh colors');
  };

  // Card styling helper
  const getCardClasses = () => {
    switch (cardStyle) {
      case 'glass':
        return 'bg-white/10 backdrop-blur-md border border-white/20';
      case 'outline':
        return `border-2 ${isDarkBg ? 'border-white/30' : 'border-neutral-200'}`;
      case 'shadow':
        return 'bg-white shadow-lg border-0';
      default:
        return isDarkBg ? 'bg-white/90 border border-white/20' : 'bg-white border border-neutral-200';
    }
  };

  const getCardTextColor = () => {
    if (cardStyle === 'glass') return '#ffffff';
    if (cardStyle === 'shadow' || cardStyle === 'solid') return isDarkBg ? '#1a1a1a' : textColor;
    return isDarkBg ? '#ffffff' : textColor;
  };

  // Sample data
  const mockLinks = links?.slice(0, 3) || [
    { _id: '1', title: 'My Portfolio', url: '#' },
    { _id: '2', title: 'Latest Project', url: '#' },
  ];

  const mockProducts = products?.filter((p) => !p.isDeleted).slice(0, 4) || [
    { _id: '1', name: 'Digital Product', price: 1999 },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  // Tab Button Component
  const TabButton = ({ tab, icon: Icon, label }: { tab: TabType; icon: any; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={cn(
        'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap',
        activeTab === tab
          ? 'border-violet-600 text-violet-600 bg-violet-50/50'
          : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50',
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  // Show loading if user data isn't ready or doesn't have full record
  if (!hasFullUserRecord) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 md:left-64 flex overflow-hidden bg-neutral-100 dark:bg-neutral-900 pt-16 md:pt-0">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 bg-violet-600 text-white p-4 rounded-full shadow-lg transition-transform active:scale-95"
      >
        {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* EDITOR PANEL */}
      <div
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-40 w-full sm:w-[380px] md:w-[320px] lg:w-[380px] bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 shadow-xl md:shadow-none transition-transform duration-300 flex flex-col',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Appearance</h2>
            <div className="flex items-center gap-2">
              {/* Preview toggle for mobile/desktop */}
              <div className="hidden md:flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg mr-2">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    previewMode === 'mobile'
                      ? 'bg-white dark:bg-neutral-600 shadow-sm text-neutral-900 dark:text-white'
                      : 'hover:text-neutral-900 dark:hover:text-white text-neutral-500',
                  )}
                  title="Mobile Preview"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    previewMode === 'desktop'
                      ? 'bg-white dark:bg-neutral-600 shadow-sm text-neutral-900 dark:text-white'
                      : 'hover:text-neutral-900 dark:hover:text-white text-neutral-500',
                  )}
                  title="Desktop Preview"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="hidden md:flex bg-violet-600 hover:bg-violet-700 text-white gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </Button>
              <button onClick={() => setMobileSidebarOpen(false)} className="md:hidden p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs - No Scrollbar */}
          <div className="flex overflow-x-auto no-scrollbar scrollbar-hide select-none">
            <TabButton tab="profile" icon={Type} label="Profile" />
            <TabButton tab="design" icon={Palette} label="Design" />
            <TabButton tab="layout" icon={LayoutGrid} label="Layout" />
          </div>
        </div>

        {/* Content - No Scrollbar */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {activeTab === 'profile' && (
            <>
              <section className="space-y-3">
                <Label className="text-neutral-700 dark:text-neutral-300">Profile Picture</Label>
                <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-violet-200">
                    {user?.profileImageUrl ? (
                      <img src={user?.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <ImageUpload onUploadComplete={(id) => handleImageUpload('profile', id)} label="" />
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <Label className="text-neutral-700 dark:text-neutral-300">Display Name</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="@yourname" />
              </section>

              <section className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-neutral-700 dark:text-neutral-300">Bio</Label>
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">{bio.length}/150</span>
                </div>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your audience about yourself..."
                  className="min-h-[100px] resize-none"
                />
              </section>
            </>
          )}

          {activeTab === 'design' && (
            <>
              <section className="space-y-3">
                <Label className="text-neutral-700 dark:text-neutral-300">Typography</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FONTS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setFontFamily(font.id)}
                      className={cn(
                        'p-3 rounded-xl border-2 text-left transition-all',
                        fontFamily === font.id
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                          : 'border-neutral-200',
                      )}
                    >
                      <span className={cn('font-semibold text-sm', font.preview)}>{font.name}</span>
                      <span className="text-xs text-neutral-500 block">{font.style}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <Label className="text-neutral-700 dark:text-neutral-300">Background</Label>
                <Select value={backgroundStyle} onValueChange={setBackgroundStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="mesh">Animated Mesh</SelectItem>
                    <SelectItem value="image">Custom Image</SelectItem>
                  </SelectContent>
                </Select>

                {backgroundStyle === 'solid' && (
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 p-1 rounded-lg cursor-pointer"
                    />
                    <span className="font-mono text-sm">{backgroundColor}</span>
                  </div>
                )}

                {backgroundStyle === 'mesh' && (
                  <div className="space-y-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase text-neutral-500">Speed: {meshSpeed}</Label>
                    </div>
                    <Slider
                      value={[meshSpeed]}
                      min={0}
                      max={0.1}
                      step={0.001}
                      onValueChange={(vals) => setMeshSpeed(vals[0])}
                      className="w-full"
                    />

                    <Button onClick={randomizeMeshColors} variant="outline" className="w-full gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Randomize Colors
                    </Button>
                    <div className="flex gap-1 h-4 rounded-full overflow-hidden">
                      {meshColors.map((c, i) => (
                        <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                )}

                {backgroundStyle === 'image' && (
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-dashed text-center">
                    <ImageUpload onUploadComplete={(id) => handleImageUpload('background', id)} label="" />
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <Label className="text-neutral-700 dark:text-neutral-300">Text Colors</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-neutral-500">Primary</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-8 h-8 p-1 rounded cursor-pointer"
                      />
                      <Input
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="font-mono text-xs h-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-neutral-500">Muted</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={mutedTextColor}
                        onChange={(e) => setMutedTextColor(e.target.value)}
                        className="w-8 h-8 p-1 rounded cursor-pointer"
                      />
                      <Input
                        value={mutedTextColor}
                        onChange={(e) => setMutedTextColor(e.target.value)}
                        className="font-mono text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <Label className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Text Effects
                </Label>
                <div className="space-y-2">
                  {EFFECTS.map((eff) => (
                    <button
                      key={eff.id}
                      onClick={() => setEffect(eff.id)}
                      className={cn(
                        'w-full p-3 rounded-xl border-2 text-left transition-all flex justify-between items-center',
                        effect === eff.id
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                          : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800',
                      )}
                    >
                      <div>
                        <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{eff.name}</span>
                        <span className="block text-xs text-neutral-500 dark:text-neutral-400">{eff.description}</span>
                      </div>
                      {effect === eff.id && <Check className="w-4 h-4 text-violet-600 dark:text-violet-400" />}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'layout' && (
            <>
              <section className="space-y-3">
                <Label className="text-neutral-700 dark:text-neutral-300">Content Layout</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'list', name: 'List View', icon: List },
                    { id: 'grid', name: 'Grid View', icon: LayoutGrid },
                  ].map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => setLayoutStyle(layout.id)}
                      className={cn(
                        'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                        layoutStyle === layout.id
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                          : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800',
                      )}
                    >
                      <layout.icon className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />
                      <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{layout.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <Label className="text-neutral-700 dark:text-neutral-300">Button Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BUTTON_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setButtonStyle(style.id)}
                      className={cn(
                        'p-3 border-2 transition-all flex flex-col items-center gap-2 rounded-lg',
                        buttonStyle === style.id
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                          : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800',
                      )}
                    >
                      <div className="w-full h-6 bg-neutral-800 dark:bg-neutral-300" style={{ borderRadius: style.radius }} />
                      <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{style.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <Label className="text-neutral-700 dark:text-neutral-300">Button Color</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="w-full h-12 p-1 cursor-pointer rounded-lg"
                  />
                  <Input
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="font-mono text-sm w-32"
                  />
                </div>
              </section>

              <section className="space-y-3">
                <Label className="text-neutral-700 dark:text-neutral-300">Card Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CARD_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setCardStyle(style.id)}
                      className={cn(
                        'p-3 rounded-xl border-2 text-left transition-all',
                        cardStyle === style.id
                          ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                          : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800',
                      )}
                    >
                      <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{style.name}</span>
                      <span className="block text-xs text-neutral-500 dark:text-neutral-400">{style.description}</span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Mobile Save Button at Bottom */}
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 p-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* PREVIEW PANEL */}
      <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 p-2 md:p-6 lg:p-8 flex items-center justify-center overflow-hidden relative pt-20 md:pt-4">
        <div className="absolute inset-0 pattern-grid-lg text-neutral-200 dark:text-neutral-700 opacity-50" />
        
        {/* Mobile Save Button - Fixed at top */}
        <div className="md:hidden fixed top-20 right-4 z-50">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-lg"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
        </div>

        <div
          className={cn(
            'relative transition-all',
            previewMode === 'mobile'
              ? 'w-[320px] h-[600px] md:w-[340px] md:h-[700px] border-[8px] md:border-[14px] border-black rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-neutral-800 overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/5 z-10'
              : 'w-full h-full max-w-6xl border-4 border-black rounded-lg bg-white dark:bg-neutral-800 overflow-hidden shadow-2xl ring-1 ring-black/5 dark:ring-white/5 z-10',
          )}
        >
          {/* Notch - only show in mobile preview */}
          {previewMode === 'mobile' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-xl z-30" />
          )}

          {/* Screen Content */}
          <div
            className="h-full overflow-y-auto overflow-x-hidden no-scrollbar"
            style={{
              ...previewStyles.background,
              fontFamily,
              color: previewStyles.textColor,
            }}
          >
            {backgroundStyle === 'mesh' && (
              <div className="absolute inset-0 z-0">
                <MeshBackground colors={meshColors} speed={meshSpeed} />
              </div>
            )}

            {backgroundStyle === 'image' && user?.backgroundImageUrl && (
              <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${user?.backgroundImageUrl})` }}
              />
            )}
            {(backgroundStyle === 'image' || backgroundStyle === 'mesh') && (
              <div className="absolute inset-0 bg-black/30 z-0" />
            )}

            {/* Content Container */}
            <div className={cn('relative z-10 flex flex-col items-center', previewMode === 'mobile' ? 'p-6 pt-20' : 'p-8 pt-12')}>
              {/* Profile Image */}
              <div className="w-24 h-24 rounded-full mb-4 overflow-hidden border-4 border-white/20 shadow-lg">
                {user?.profileImageUrl ? (
                  <img src={user?.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-3xl font-bold">
                    {title?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              {/* Title with Effect */}
              <div className="mb-2 text-center">
                {effect === 'typewriter' ? (
                  <div className="text-xl font-bold">
                    <Typewriter
                      options={{
                        strings: [title || `@${user.slug}`],
                        autoStart: true,
                        loop: true,
                      }}
                    />
                  </div>
                ) : (
                  <h1 className="text-xl font-bold">{title || `@${user.slug}`}</h1>
                )}
              </div>

              {/* Bio */}
              {bio && <p className="text-sm text-center mb-4 opacity-80 max-w-[90%] whitespace-pre-wrap">{bio}</p>}

              {/* Social Media Links */}
              {user?.socials && user?.socials.length > 0 && (
                <div className="flex gap-3 mb-6 flex-wrap justify-center">
                  {user?.socials
                    .filter((s: any) => (s.isVisible || s.active) && s.url)
                    .map((social: { platform: string; url: string }, idx: number) => {
                      const Icon = SOCIAL_ICONS[social.platform] || MdWeb;
                      const iconColor = SOCIAL_COLORS[social.platform] || '#6366f1';

                      return (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                          style={{
                            backgroundColor: isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            border: `2px solid ${isDarkBg ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: iconColor }} />
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Links & Products */}
              <div className="w-full space-y-3 max-w-sm">
                {mockLinks.map((link: { _id: string; title: string; url: string }) => (
                  <div
                    key={link._id}
                    className={cn(
                      'w-full p-4 flex items-center gap-3 transition-transform active:scale-95 hover:scale-[1.02]',
                      getCardClasses(),
                    )}
                    style={{ borderRadius: previewStyles.buttonRadius }}
                  >
                    {/* Mock favicon */}
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0">
                      <div className="w-3 h-3 bg-white rounded-sm opacity-80" />
                    </div>
                    
                    {/* Link content */}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm block truncate" style={{ color: getCardTextColor() }}>
                        {link.title}
                      </span>
                      <span className="text-xs opacity-60 block truncate" style={{ color: getCardTextColor() }}>
                        {link.url}
                      </span>
                    </div>
                    
                    {/* Arrow icon */}
                    <div className="w-4 h-4 opacity-40" style={{ color: getCardTextColor() }}>
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8.22 2.97a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.44 8.5H2.75a.75.75 0 0 1 0-1.5h8.69L8.22 4.03a.75.75 0 0 1 0-1.06Z"/>
                      </svg>
                    </div>
                  </div>
                ))}

                {mockProducts.length > 0 && (
                  <div className={cn('gap-3 mt-6', layoutStyle === 'grid' ? 'grid grid-cols-2' : 'space-y-3')}>
                    {mockProducts.map((product: any) => (
                      <div
                        key={product._id}
                        className={cn('overflow-hidden', getCardClasses())}
                        style={{ borderRadius: previewStyles.buttonRadius }}
                      >
                        <div className="aspect-square bg-neutral-100 flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-8 h-8 opacity-20" />
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-xs truncate" style={{ color: getCardTextColor() }}>
                            {product.name}
                          </h3>
                          <p className="text-[10px] opacity-70" style={{ color: getCardTextColor() }}>
                            ₦{(product.price / 100).toLocaleString()}
                          </p>
                          <button
                            className="w-full mt-2 py-1.5 text-[10px] font-bold text-white"
                            style={{ backgroundColor: buttonColor, borderRadius: previewStyles.buttonRadius }}
                          >
                            BUY
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
