"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Tag, Trash2, Pencil, ShoppingBag } from "lucide-react";

export default function StorePage() {
    const products = useQuery(api.products.list);
    const createProduct = useMutation(api.products.create);
    const updateProduct = useMutation(api.products.update);
    const deleteProduct = useMutation(api.products.remove);

    // Create State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Edit State
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editDiscountPercentage, setEditDiscountPercentage] = useState("");

    // Delete State
    const [deletingProduct, setDeletingProduct] = useState<any>(null);

    const handleAddProduct = async () => {
        if (!name || !price) return;
        const priceInSmallestUnit = Math.round(parseFloat(price) * 100);
        await createProduct({
            name,
            description,
            price: priceInSmallestUnit,
        });
        setName("");
        setDescription("");
        setPrice("");
        setIsCreateOpen(false);
    };

    const handleEditClick = (product: any) => {
        setEditingProduct(product);
        setEditName(product.name);
        setEditDesc(product.description || "");
        setEditDiscountPercentage(product.discountPercentage ? product.discountPercentage.toString() : "");
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;

        let discountVal: number | undefined = undefined;
        let endDiscount = false;

        if (editDiscountPercentage && editDiscountPercentage.trim() !== "") {
            discountVal = parseFloat(editDiscountPercentage);
            if (isNaN(discountVal) || discountVal <= 0 || discountVal >= 100) {
                // If invalid, treat as no discount? Or validation error?
                // For now, if 0 or invalid, we end discount.
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
            endDiscount: endDiscount
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
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Product</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My E-book" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your product..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price (NGN)</label>
                                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1000" />
                            </div>
                            <Button onClick={handleAddProduct} className="w-full bg-violet-600 hover:bg-violet-700">Create Product</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-500">Original Price (Cannot be changed)</label>
                            <Input
                                value={editingProduct ? (editingProduct.price / 100).toLocaleString() : ""}
                                disabled
                                className="bg-neutral-100 dark:bg-neutral-800 opacity-70"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-violet-600">Discount Percentage (%)</label>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setEditDiscountPercentage("10")}>10%</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditDiscountPercentage("20")}>20%</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditDiscountPercentage("50")}>50%</Button>
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
                                <div className="mt-2 p-3 bg-violet-50 dark:bg-violet-900/20 rounded-md text-sm">
                                    <span className="text-neutral-500">New Price: </span>
                                    <span className="font-bold text-violet-600">
                                        ₦{(getDiscountedPrice(editingProduct.price, editDiscountPercentage) / 100).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            <p className="text-xs text-neutral-500">Leave empty or set to 0 to remove discount.</p>
                        </div>
                        <Button onClick={handleUpdateProduct} className="w-full bg-violet-600 hover:bg-violet-700">Save Changes</Button>
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
                            Are you sure you want to delete <strong>{deletingProduct?.name}</strong>? This will remove it from your public store, but existing transactions will be preserved for disputes.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setDeletingProduct(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteProduct}>Delete Product</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products?.map((product) => (
                    <Card key={product._id} className="group hover:border-violet-200 dark:hover:border-violet-900 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                                <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                                    <ShoppingBag className="w-6 h-6 text-neutral-500" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(product)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => setDeletingProduct(product)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="font-semibold truncate">{product.name}</h3>
                                <p className="text-sm text-neutral-500 line-clamp-2 h-10">{product.description}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div>
                                    {product.discountPercentage ? (
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg text-violet-600">
                                                    ₦{(Math.round(product.price * (1 - product.discountPercentage / 100)) / 100).toLocaleString()}
                                                </span>
                                                <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">-{product.discountPercentage}%</span>
                                            </div>
                                            <span className="text-xs text-neutral-400 line-through">₦{(product.price / 100).toLocaleString()}</span>
                                        </div>
                                    ) : (
                                        <span className="font-bold text-lg">₦{(product.price / 100).toLocaleString()}</span>
                                    )}
                                </div>
                                <div className="text-xs text-neutral-400">Digital</div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {products?.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-neutral-500 border-2 border-dashed rounded-lg bg-neutral-50 dark:bg-neutral-900/50">
                        <p className="mb-4">No products yet.</p>
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Add your first product</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
