'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, ExternalLink, GripVertical, Image as ImageIcon, Github } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ImageUpload from '@/components/ImageUpload';
import { cn } from '@/lib/utils';

// React Icons for socials
import {
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaLinkedinIn,
  FaFacebookF,
  FaGithub,
  FaDiscord,
  FaWhatsapp,
} from 'react-icons/fa';
import { SiX, SiThreads } from 'react-icons/si';
import { MdEmail, MdWeb } from 'react-icons/md';

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: '#E4405F' },
  { id: 'twitter', name: 'X (Twitter)', icon: SiX, color: '#000000' },
  { id: 'youtube', name: 'YouTube', icon: FaYoutube, color: '#FF0000' },
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: '#000000' },
  { id: 'linkedin', name: 'LinkedIn', icon: FaLinkedinIn, color: '#0A66C2' },
  { id: 'facebook', name: 'Facebook', icon: FaFacebookF, color: '#1877F2' },
  { id: 'threads', name: 'Threads', icon: SiThreads, color: '#000000' },
  { id: 'github', name: 'GitHub', icon: FaGithub, color: '#181717' },
  { id: 'discord', name: 'Discord', icon: FaDiscord, color: '#5865F2' },
  { id: 'whatsapp', name: 'WhatsApp', icon: FaWhatsapp, color: '#25D366' },
  { id: 'email', name: 'Email', icon: MdEmail, color: '#EA4335' },
  { id: 'website', name: 'Website', icon: MdWeb, color: '#6366F1' },
];

export default function LinksPage() {
  const links = useQuery(api.links.list);
  const user = useQuery(api.users.me);

  // Mutations
  const createLink = useMutation(api.links.create);
  const updateLink = useMutation(api.links.update);
  const removeLink = useMutation(api.links.remove);
  const updateTheme = useMutation(api.users.updateTheme);

  // Links State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [imageId, setImageId] = useState<string | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);
  const [useMetadata, setUseMetadata] = useState(true);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [isAdult, setIsAdult] = useState(false);
  const [description, setDescription] = useState('');
  const [metadataImage, setMetadataImage] = useState('');
  const [isRepo, setIsRepo] = useState(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');

  const [editingLink, setEditingLink] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editImageId, setEditImageId] = useState<string | undefined>(undefined);
  const [editActive, setEditActive] = useState(true);
  const [editUseMetadata, setEditUseMetadata] = useState(true);
  const [editIsAdult, setEditIsAdult] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editMetadataImage, setEditMetadataImage] = useState('');
  const [editIsRepo, setEditIsRepo] = useState(false);
  const [editLivePreviewUrl, setEditLivePreviewUrl] = useState('');
  const [editRepoUrl, setEditRepoUrl] = useState('');

  // Socials State
  const [socials, setSocials] = useState<any[]>([]);

  // Helper to get favicon URL
  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
      return null;
    }
  };

  // Actions
  const fetchMetadataAction = useAction(api.metadata.fetchMetadata);

  // Check if URL is a GitHub repo
  const isGitHubRepo = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'github.com' && urlObj.pathname.split('/').filter(Boolean).length >= 2;
    } catch {
      return false;
    }
  };

  // Fetch metadata from URL
  const fetchMetadata = async (targetUrl: string) => {
    if (!targetUrl) return;
    setIsFetchingMetadata(true);
    try {
      const metadata = await fetchMetadataAction({ url: targetUrl });
      
      if (metadata.title && !title) setTitle(metadata.title);
      if (metadata.description) setDescription(metadata.description);
      if (metadata.image) setMetadataImage(metadata.image);

      // Check if it's a GitHub repo
      if (isGitHubRepo(targetUrl)) {
        setIsRepo(true);
        setRepoUrl(targetUrl);
        toast.info('GitHub repo detected! Add a live preview URL if available.');
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      toast.error('Failed to fetch metadata');
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  useEffect(() => {
    if (user?.socials) {
      setSocials(user.socials);
    }
  }, [user?.socials]);

  // Link Handlers
  const handleAddLink = async () => {
    if (!title || !url) return;
    let finalUrl = url;
    if (!finalUrl.startsWith('http')) finalUrl = `https://${finalUrl}`;

    await createLink({
      title,
      url: finalUrl,
      imageId: imageId as Id<'_storage'> | undefined,
      isActive,
      useMetadata,
      isAdult,
      description,
      metadataImage,
      isRepo,
      livePreviewUrl: livePreviewUrl || undefined,
      repoUrl: repoUrl || undefined,
    });
    setTitle('');
    setUrl('');
    setImageId(undefined);
    setIsActive(true);
    setUseMetadata(true);
    setIsAdult(false);
    setDescription('');
    setMetadataImage('');
    setIsRepo(false);
    setLivePreviewUrl('');
    setRepoUrl('');
    setIsCreateOpen(false);
    toast.success('Link added');
  };

  const handleEditClick = (link: any) => {
    setEditingLink(link);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditImageId(link.imageId);
    setEditActive(link.isActive !== false);
    setEditUseMetadata(link.useMetadata !== false);
    setEditIsAdult(link.isAdult || false);
    setEditDescription(link.description || '');
    setEditMetadataImage(link.metadataImage || '');
    setEditIsRepo(link.isRepo || false);
    setEditLivePreviewUrl(link.livePreviewUrl || '');
    setEditRepoUrl(link.repoUrl || '');
  };

  const handleUpdateLink = async () => {
    if (!editingLink) return;
    await updateLink({
      id: editingLink._id,
      title: editTitle,
      url: editUrl,
      imageId: editImageId as Id<'_storage'> | undefined,
      isActive: editActive,
      useMetadata: editUseMetadata,
      isAdult: editIsAdult,
      description: editDescription,
      metadataImage: editMetadataImage,
      isRepo: editIsRepo,
      livePreviewUrl: editLivePreviewUrl || undefined,
      repoUrl: editRepoUrl || undefined,
    });
    setEditingLink(null);
    toast.success('Link updated');
  };

  const handleDelete = async (id: any) => {
    if (confirm('Delete this link?')) {
      await removeLink({ id });
      toast.success('Link deleted');
    }
  };

  const toggleActive = async (link: any) => {
    await updateLink({ id: link._id, isActive: !(link.isActive !== false) });
  };

  // Socials Handlers
  const handleSaveSocials = async (newSocials: any[]) => {
    setSocials(newSocials);
    // Optimistic update done, API call:
    await updateTheme({ socials: newSocials });
    toast.success('Socials saved');
  };

  const addSocial = (platformId: string) => {
    if (socials.find((s) => s.platform === platformId)) return;
    const newSocials = [...socials, { platform: platformId, url: '', isVisible: true }];
    handleSaveSocials(newSocials);
  };

  const removeSocial = (platformId: string) => {
    const newSocials = socials.filter((s) => s.platform !== platformId);
    handleSaveSocials(newSocials);
  };

  const updateSocial = (platformId: string, url: string) => {
    // Update local state immediately for input
    const updated = socials.map((s) => (s.platform === platformId ? { ...s, url } : s));
    setSocials(updated);
  };

  const saveSocialUrl = async (platformId: string, url: string) => {
    // Trigger save on blur
    await updateTheme({ socials: socials });
    toast.success('Saved');
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Content</h2>
            <p className="text-neutral-500">Manage your links and social media icons.</p>
          </div>
        </div>

      <Tabs defaultValue="links" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="links">My Links</TabsTrigger>
          <TabsTrigger value="socials">Social Icons</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" /> Add Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>URL *</Label>
                    <Input
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onBlur={() => url && fetchMetadata(url)}
                      placeholder="https://portfolio.com"
                      disabled={isFetchingMetadata}
                    />
                    {isFetchingMetadata && <p className="text-xs text-violet-600">Fetching metadata...</p>}
                  </div>

                  {/* Metadata Preview */}
                  {(metadataImage || description) && (
                    <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                      <p className="text-xs font-medium text-violet-700 dark:text-violet-300 mb-2">Extracted Metadata</p>
                      {metadataImage && (
                        <img src={metadataImage} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                      )}
                      {description && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">{description}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="My Portfolio"
                      disabled={isFetchingMetadata}
                    />
                  </div>

                  {/* GitHub Repo Fields */}
                  {isRepo && (
                    <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Github className="w-4 h-4 text-blue-600" />
                        <Label className="text-sm font-medium text-blue-700 dark:text-blue-300">GitHub Repository</Label>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Live Preview URL (Optional)</Label>
                        <Input
                          value={livePreviewUrl}
                          onChange={(e) => setLivePreviewUrl(e.target.value)}
                          placeholder="https://your-project.vercel.app"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Custom Project Image (Optional)</Label>
                        <ImageUpload onUploadComplete={setImageId} currentImageId={imageId} label="Upload Image" />
                      </div>
                    </div>
                  )}

                  {!isRepo && (
                    <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Auto-fetch Metadata</Label>
                          <p className="text-xs text-neutral-500 mt-1">Use website's favicon and metadata</p>
                        </div>
                        <Switch checked={useMetadata} onCheckedChange={setUseMetadata} />
                      </div>
                      {!useMetadata && (
                        <div className="space-y-2 pt-2 border-t">
                          <Label className="text-xs">Custom Thumbnail</Label>
                          <ImageUpload onUploadComplete={setImageId} currentImageId={imageId} label="Upload Icon" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={isActive} onCheckedChange={setIsActive} />
                      <Label>Visible on profile</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={isAdult} onCheckedChange={setIsAdult} />
                      <Label className="text-red-600 dark:text-red-400">18+</Label>
                    </div>
                  </div>
                  <Button onClick={handleAddLink} className="w-full bg-violet-600" disabled={!title || !url || isFetchingMetadata}>
                    Create Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3">
            {links?.map((link) => (
              <Card key={link._id} className="group hover:border-violet-300 transition-all hover:shadow-md">
                <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                  <div className="hidden sm:block cursor-move text-neutral-300 hover:text-neutral-500">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 shrink-0">
                    {link.imageUrl ? (
                      <img src={link.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : link.metadataImage ? (
                      <img src={link.metadataImage} alt="" className="w-full h-full object-cover" />
                    ) : link.useMetadata !== false && link.url ? (
                      <img
                        src={getFaviconUrl(link.url) || ''}
                        alt=""
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<svg class="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>';
                          }
                        }}
                      />
                    ) : (
                      <ExternalLink className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base truncate text-neutral-900 dark:text-neutral-100">
                        {link.title}
                      </h3>
                      {link.isAdult && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                          18+
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 break-all line-clamp-1">{link.url}</p>
                    {link.description && (
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 line-clamp-2 mt-1 break-words">
                        {link.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <Switch checked={link.isActive !== false} onCheckedChange={() => toggleActive(link)} />
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditClick(link)}
                        className="h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8 sm:h-10 sm:w-10"
                        onClick={() => handleDelete(link._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {links?.length === 0 && (
              <div className="text-center py-10 text-neutral-500 border-2 border-dashed rounded-lg">
                <p>No links added.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="socials" className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Add Social Icons</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Click to add to your profile</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {SOCIAL_PLATFORMS.map((platform) => {
                const isActive = socials.find((s) => s.platform === platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => !isActive && addSocial(platform.id)}
                    disabled={!!isActive}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200',
                      isActive
                        ? 'border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/30 opacity-50 cursor-default'
                        : 'hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
                    )}
                  >
                    <platform.icon className={cn('w-6 h-6', isActive ? 'text-violet-400' : 'text-neutral-600 dark:text-neutral-300')} />
                    <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Your Socials</h3>
            {socials.length === 0 && (
              <div className="text-center py-10 text-neutral-400 dark:text-neutral-500 border-2 border-dashed rounded-xl border-neutral-200 dark:border-neutral-800">
                No social icons added yet.
              </div>
            )}
            {socials.map((social) => {
              const platform = SOCIAL_PLATFORMS.find((p) => p.id === social.platform);
              if (!platform) return null;
              return (
                <div
                  key={social.platform}
                  className="flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 shadow-sm animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 shrink-0">
                    <platform.icon className="w-5 h-5" style={{ color: platform.color }} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{platform.name} URL</Label>
                    </div>
                    <Input
                      value={social.url}
                      onChange={(e) => updateSocial(social.platform, e.target.value)}
                      onBlur={(e) => saveSocialUrl(social.platform, e.target.value)}
                      placeholder={`https://${social.platform}.com/username`}
                      className="h-9"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                    onClick={() => removeSocial(social.platform)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-fetch Icon</Label>
                  <p className="text-xs text-neutral-500 mt-1">Use website's favicon automatically</p>
                </div>
                <Switch checked={editUseMetadata} onCheckedChange={setEditUseMetadata} />
              </div>
              {!editUseMetadata && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs">Custom Thumbnail</Label>
                  <ImageUpload onUploadComplete={setEditImageId} currentImageId={editImageId} label="Change Icon" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={editActive} onCheckedChange={setEditActive} />
                <Label>Visible</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editIsAdult} onCheckedChange={setEditIsAdult} />
                <Label className="text-red-600 dark:text-red-400">18+ Content</Label>
              </div>
            </div>
            <Button onClick={handleUpdateLink} className="w-full bg-violet-600">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
