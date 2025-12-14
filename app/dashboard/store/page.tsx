'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Plus,
  Tag,
  Trash2,
  Pencil,
  ShoppingBag,
  ImageIcon,
  FileText,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/ImageUpload';
import FileUpload from '@/components/FileUpload';

export default function StorePage() {
  const products = useQuery(api.products.list);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Create State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('file');
  const [contentFileId, setContentFileId] = useState<string | undefined>(undefined);
  const [contentUrl, setContentUrl] = useState('');
  const [imageId, setImageId] = useState<string | undefined>(undefined);
  const [deliveryNote, setDeliveryNote] = useState('');

  // Edit State
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDiscountPercentage, setEditDiscountPercentage] = useState('');
  // Edit Asset State
  const [editType, setEditType] = useState('file');
  const [editContentFileId, setEditContentFileId] = useState<string | undefined>(undefined);
  const [editContentUrl, setEditContentUrl] = useState('');
  const [editImageId, setEditImageId] = useState<string | undefined>(undefined);
  const [editDeliveryNote, setEditDeliveryNote] = useState('');

  // Delete State
  const [deletingProduct, setDeletingProduct] = useState<any>(null);

  const handleAddProduct = async () => {
    if (!name || !price) return;
    const priceInSmallestUnit = Math.round(parseFloat(price) * 100);

    await createProduct({
      name,
      description,
      price: priceInSmallestUnit,
      type,
      contentFileId: contentFileId as Id<'_storage'> | undefined,
      contentUrl,
      imageId: imageId as Id<'_storage'> | undefined,
      deliveryNote,
    });

    // Reset
    setName('');
    setDescription('');
    setPrice('');
    setType('file');
    setContentFileId(undefined);
    setContentUrl('');
    setImageId(undefined);
    setDeliveryNote('');
    setIsCreateOpen(false);
  };

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditDesc(product.description || '');
    setEditDiscountPercentage(product.discountPercentage ? product.discountPercentage.toString() : '');

    setEditType(product.type || 'file');
    setEditContentFileId(product.contentFileId);
    setEditContentUrl(product.contentUrl || '');
    setEditImageId(product.imageId);
    setEditDeliveryNote(product.deliveryNote || '');
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    let discountVal: number | undefined = undefined;
    let endDiscount = false;

    if (editDiscountPercentage && editDiscountPercentage.trim() !== '') {
      discountVal = parseFloat(editDiscountPercentage);
      if (isNaN(discountVal) || discountVal <= 0 || discountVal >= 100) {
        discountVal = undefined;
      }
    }

    if (discountVal === undefined) {
      endDiscount = true;
    }

    await updateProduct({
      id: editingProduct._id,
      name: editName,
      description: editDesc,
      discountPercentage: discountVal,
      endDiscount: endDiscount,
      type: editType,
      contentFileId: editContentFileId as Id<'_storage'> | undefined,
      contentUrl: editContentUrl,
      imageId: editImageId as Id<'_storage'> | undefined,
      deliveryNote: editDeliveryNote,
    });
    setEditingProduct(null);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    await deleteProduct({ id: deletingProduct._id });
    setDeletingProduct(null);
  };

  // Helper for preview
  const getDiscountedPrice = (price: number, percentage: string) => {
    const p = parseFloat(percentage);
    if (isNaN(p) || p <= 0) return price;
    return Math.round(price * (1 - p / 100));
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Store</h2>
            <p className="text-neutral-500">Manage your digital products.</p>
          </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label>Product Cover</Label>
                <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                  <ImageUpload onUploadComplete={setImageId} currentImageId={imageId} label="Upload Cover Image" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My E-book" />
                </div>
                <div className="space-y-2">
                  <Label>Price (NGN)</Label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="5000" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product..."
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <Label className="text-violet-600 font-semibold">Deliverable</Label>
                <div className="space-y-2">
                  <Label>Product Type</Label>
                  <Select value={type} onValueChange={(value) => setType(value ?? type)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file">Digital File (PDF, Video, etc.)</SelectItem>
                      <SelectItem value="link">Secure Link (URL)</SelectItem>
                      <SelectItem value="service">Service / Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {type === 'file' && (
                  <div className="space-y-2 p-4 bg-neutral-50 rounded-lg">
                    <Label>Upload File</Label>
                    <FileUpload onUploadComplete={setContentFileId} label="Select Product File" />
                    <p className="text-xs text-neutral-500 mt-1">
                      This file will be available for download after purchase.
                    </p>
                  </div>
                )}

                {type === 'link' && (
                  <div className="space-y-2 p-4 bg-neutral-50 rounded-lg">
                    <Label>Secret URL</Label>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-neutral-400" />
                      <Input
                        value={contentUrl}
                        onChange={(e) => setContentUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <p className="text-xs text-neutral-500">Redirects user here after purchase.</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Delivery Note (Email)</Label>
                  <Textarea
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="Thank you for your purchase! Here is your access key..."
                    className="h-20"
                  />
                </div>
              </div>

              <Button onClick={handleAddProduct} className="w-full bg-violet-600 hover:bg-violet-700 mt-4">
                Create Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="p-2 border rounded-md">
                <ImageUpload onUploadComplete={setEditImageId} currentImageId={editImageId} label="Change Cover" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-500">Original Price (Cannot be changed)</Label>
              <Input
                value={editingProduct ? (editingProduct.price / 100).toLocaleString() : ''}
                disabled
                className="bg-neutral-100 dark:bg-neutral-800 opacity-70"
              />
            </div>

            <div className="space-y-2 p-3 border rounded-lg bg-violet-50/50">
              <Label className="text-violet-600">Discount Percentage (%)</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditDiscountPercentage('10')}>
                  10%
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditDiscountPercentage('20')}>
                  20%
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditDiscountPercentage('50')}>
                  50%
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editDiscountPercentage}
                  onChange={(e) => setEditDiscountPercentage(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-24"
                />
                <span className="text-sm text-neutral-500">% Off</span>
              </div>

              {editingProduct && editDiscountPercentage && (
                <div className="mt-2 text-sm">
                  <span className="text-neutral-500">New Price: </span>
                  <span className="font-bold text-violet-600">
                    ₦{(getDiscountedPrice(editingProduct.price, editDiscountPercentage) / 100).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-4">
              <Label className="uppercase text-xs font-bold text-neutral-500">Deliverable Settings</Label>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={editType} onValueChange={(value) => setEditType(value ?? editType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file">Digital File</SelectItem>
                    <SelectItem value="link">Secure Link</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editType === 'file' && (
                <div className="space-y-2">
                  <Label>File</Label>
                  <FileUpload onUploadComplete={setEditContentFileId} label="Replace File" />
                  {editContentFileId && (
                    <p className="text-xs text-green-600 flex items-center">
                      <Tag className="w-3 h-3 mr-1" /> File Set
                    </p>
                  )}
                </div>
              )}

              {editType === 'link' && (
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input value={editContentUrl} onChange={(e) => setEditContentUrl(e.target.value)} />
                </div>
              )}

              <div className="space-y-2">
                <Label>Delivery Note</Label>
                <Textarea
                  value={editDeliveryNote}
                  onChange={(e) => setEditDeliveryNote(e.target.value)}
                  className="h-20"
                />
              </div>
            </div>

            <Button onClick={handleUpdateProduct} className="w-full bg-violet-600 hover:bg-violet-700">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product?</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Are you sure you want to delete <strong>{deletingProduct?.name}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeletingProduct(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProduct}>
                Delete Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products?.map((product) => (
          <Card
            key={product._id}
            className="group hover:border-violet-200 dark:hover:border-violet-900 transition-colors overflow-hidden"
          >
            <div className="h-32 bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  <ShoppingBag className="w-8 h-8 opacity-50" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1 rounded-md shadow-sm">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditClick(product)}>
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500 hover:bg-red-50"
                  onClick={() => setDeletingProduct(product)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              {product.discountPercentage && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  -{product.discountPercentage}%
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="mb-2">
                <h3 className="font-semibold truncate">{product.name}</h3>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  {product.type === 'file' && (
                    <>
                      <FileText className="w-3 h-3" /> Digital File
                    </>
                  )}
                  {product.type === 'link' && (
                    <>
                      <LinkIcon className="w-3 h-3" /> Link
                    </>
                  )}
                  {product.type === 'service' && (
                    <>
                      <Tag className="w-3 h-3" /> Service
                    </>
                  )}
                </div>
              </div>
              <p className="text-sm text-neutral-500 line-clamp-2 h-10 mb-3">{product.description}</p>

              <div className="flex items-center justify-between mt-auto">
                <div>
                  {product.discountPercentage ? (
                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-violet-600">
                        ₦{(Math.round(product.price * (1 - product.discountPercentage / 100)) / 100).toLocaleString()}
                      </span>
                      <span className="text-xs text-neutral-400 line-through">
                        ₦{(product.price / 100).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-lg">₦{(product.price / 100).toLocaleString()}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {products?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-neutral-500 border-2 border-dashed rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
            <p className="mb-4">No products yet.</p>
            <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
              Add your first product
            </Button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
