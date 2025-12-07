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

import ImageUpload from '@/components/ImageUpload';
import { cn } from '@/lib/utils';
import MeshBackground from '@/components/MeshBackground';

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
    if (user) {
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

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-violet-600 text-white p-4 rounded-full shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* EDITOR PANEL */}
      <div
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-40 w-full sm:w-[400px] bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 shadow-xl lg:shadow-none transition-transform duration-300 flex flex-col',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Appearance</h2>
            <div className="flex items-center gap-2">
              {/* Preview toggle for mobile/desktop */}
              <div className="hidden lg:flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg mr-2">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={cn(
                    'p-1.5 rounded-md',
                    previewMode === 'mobile'
                      ? 'bg-white dark:bg-neutral-600 shadow-sm'
                      : 'hover:text-neutral-900 dark:hover:text-white text-neutral-500',
                  )}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={cn(
                    'p-1.5 rounded-md',
                    previewMode === 'desktop'
                      ? 'bg-white dark:bg-neutral-600 shadow-sm'
                      : 'hover:text-neutral-900 dark:hover:text-white text-neutral-500',
                  )}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </Button>
              <button onClick={() => setMobileSidebarOpen(false)} className="lg:hidden p-2">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
          {activeTab === 'profile' && (
            <>
              <section className="space-y-3">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl border">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-violet-200">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
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
                <Label>Display Name</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="@yourname" />
              </section>

              <section className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Bio</Label>
                  <span className="text-xs text-neutral-400">{bio.length}/150</span>
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
                <Label>Typography</Label>
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
                <Label>Background</Label>
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
                <Label>Text Colors</Label>
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
                <Label className="flex items-center gap-2">
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
                        effect === eff.id ? 'border-violet-500 bg-violet-50' : 'border-neutral-200',
                      )}
                    >
                      <div>
                        <span className="font-medium text-sm">{eff.name}</span>
                        <span className="block text-xs text-neutral-500">{eff.description}</span>
                      </div>
                      {effect === eff.id && <Check className="w-4 h-4 text-violet-600" />}
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'layout' && (
            <>
              <section className="space-y-3">
                <Label>Content Layout</Label>
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
                        layoutStyle === layout.id ? 'border-violet-500 bg-violet-50' : 'border-neutral-200',
                      )}
                    >
                      <layout.icon className="w-6 h-6" />
                      <span className="font-medium text-sm">{layout.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <Label>Button Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BUTTON_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setButtonStyle(style.id)}
                      className={cn(
                        'p-3 border-2 transition-all flex flex-col items-center gap-2 rounded-lg',
                        buttonStyle === style.id ? 'border-violet-500 bg-violet-50' : 'border-neutral-200',
                      )}
                    >
                      <div className="w-full h-6 bg-neutral-800" style={{ borderRadius: style.radius }} />
                      <span className="text-xs font-medium">{style.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <Label>Button Color</Label>
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
                <Label>Card Style</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CARD_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setCardStyle(style.id)}
                      className={cn(
                        'p-3 rounded-xl border-2 text-left transition-all',
                        cardStyle === style.id ? 'border-violet-500 bg-violet-50' : 'border-neutral-200',
                      )}
                    >
                      <span className="font-medium text-sm">{style.name}</span>
                      <span className="block text-xs text-neutral-500">{style.description}</span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {/* PREVIEW PANEL */}
      <div className="flex-1 bg-neutral-100 p-8 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 pattern-grid-lg text-neutral-200 opacity-50" />

        <div
          className={cn(
            'relative w-[340px] h-[700px] border-[12px] border-neutral-900 rounded-[3rem] bg-white overflow-hidden shadow-2xl ring-1 ring-black/5 z-10 transition-all',
            previewMode === 'desktop' && 'w-full h-full max-w-5xl rounded-lg border-4',
          )}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-neutral-900 rounded-b-xl z-30" />

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

            {backgroundStyle === 'image' && user.backgroundImageUrl && (
              <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${user.backgroundImageUrl})` }}
              />
            )}
            {(backgroundStyle === 'image' || backgroundStyle === 'mesh') && (
              <div className="absolute inset-0 bg-black/30 z-0" />
            )}

            {/* Content Container */}
            <div className="relative z-10 p-6 pt-20 flex flex-col items-center">
              {/* Profile Image */}
              <div className="w-24 h-24 rounded-full mb-4 overflow-hidden border-4 border-white/20 shadow-lg">
                {user.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
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
              {bio && <p className="text-sm text-center mb-6 opacity-80 max-w-[90%] whitespace-pre-wrap">{bio}</p>}

              {/* Links & Products */}
              <div className="w-full space-y-4">
                {mockLinks.map((link: { _id: string; title: string; url: string }) => (
                  <div
                    key={link._id}
                    className={cn(
                      'w-full p-4 flex items-center justify-between transition-transform active:scale-95',
                      getCardClasses(),
                    )}
                    style={{ borderRadius: previewStyles.buttonRadius }}
                  >
                    <span className="font-medium text-sm" style={{ color: getCardTextColor() }}>
                      {link.title}
                    </span>
                    <div />
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
