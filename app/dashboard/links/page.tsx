'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Pencil, ExternalLink, GripVertical, Image as ImageIcon } from 'lucide-react';
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

  const [editingLink, setEditingLink] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editImageId, setEditImageId] = useState<string | undefined>(undefined);
  const [editActive, setEditActive] = useState(true);

  // Socials State
  const [socials, setSocials] = useState<any[]>([]);

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
    });
    setTitle('');
    setUrl('');
    setImageId(undefined);
    setIsActive(true);
    setIsCreateOpen(false);
    toast.success('Link added');
  };

  const handleEditClick = (link: any) => {
    setEditingLink(link);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditImageId(link.imageId);
    setEditActive(link.isActive !== false);
  };

  const handleUpdateLink = async () => {
    if (!editingLink) return;
    await updateLink({
      id: editingLink._id,
      title: editTitle,
      url: editUrl,
      imageId: editImageId as Id<'_storage'> | undefined,
      isActive: editActive,
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
    <div className="max-w-4xl mx-auto space-y-6">
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
                    <Label>Thumbnail (Optional)</Label>
                    <div className="border border-dashed p-2 rounded-lg bg-neutral-50">
                      <ImageUpload onUploadComplete={setImageId} currentImageId={imageId} label="Upload Icon" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Portfolio" />
                  </div>
                  <div className="space-y-2">
                    <Label>URL *</Label>
                    <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://portfolio.com" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                    <Label>Visible</Label>
                  </div>
                  <Button onClick={handleAddLink} className="w-full bg-violet-600" disabled={!title || !url}>
                    Create Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {links?.map((link) => (
              <Card key={link._id} className="group hover:border-violet-300 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="cursor-move text-neutral-300 hover:text-neutral-500">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="h-10 w-10 rounded-md bg-neutral-100 flex items-center justify-center overflow-hidden border">
                    {link.imageId ? (
                      <div className="w-full h-full bg-violet-100 flex items-center justify-center text-xs text-violet-600">
                        Img
                      </div>
                    ) : (
                      <ExternalLink className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{link.title}</h3>
                    <p className="text-xs text-neutral-500 truncate">{link.url}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch checked={link.isActive !== false} onCheckedChange={() => toggleActive(link)} />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="ghost" onClick={() => handleEditClick(link)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
          <div className="bg-white p-6 rounded-xl border space-y-6">
            <div>
              <h3 className="text-lg font-medium">Add Social Icons</h3>
              <p className="text-sm text-neutral-500">Click to add to your profile</p>
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
                        ? 'border-violet-200 bg-violet-50 opacity-50 cursor-default'
                        : 'hover:border-violet-300 hover:shadow-sm bg-white',
                    )}
                  >
                    <platform.icon className={cn('w-6 h-6', isActive ? 'text-violet-400' : 'text-neutral-600')} />
                    <span className="text-xs font-medium">{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Socials</h3>
            {socials.length === 0 && (
              <div className="text-center py-10 text-neutral-400 border-2 border-dashed rounded-xl">
                No social icons added yet.
              </div>
            )}
            {socials.map((social) => {
              const platform = SOCIAL_PLATFORMS.find((p) => p.id === social.platform);
              if (!platform) return null;
              return (
                <div
                  key={social.platform}
                  className="flex items-center gap-4 p-4 border rounded-xl bg-white shadow-sm animate-in fade-in slide-in-from-bottom-2"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-neutral-100 shrink-0">
                    <platform.icon className="w-5 h-5" style={{ color: platform.color }} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-neutral-500 uppercase tracking-wider">{platform.name} URL</Label>
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
                    className="text-neutral-400 hover:text-red-500 hover:bg-red-50 shrink-0"
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
              <Label>Thumbnail</Label>
              <div className="border border-dashed p-2 rounded-lg">
                <ImageUpload onUploadComplete={setEditImageId} currentImageId={editImageId} label="Change Icon" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
            </div>
            <Button onClick={handleUpdateLink} className="w-full bg-violet-600">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
