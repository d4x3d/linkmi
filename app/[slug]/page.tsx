import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import PublicProductCard from "@/components/PublicProductCard";

import ViewTracker from "@/components/ViewTracker";

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const user = await fetchQuery(api.users.getBySlug, { slug });

    if (!user) {
        notFound();
    }

    // Links are removed as per request
    const products = await fetchQuery(api.products.listPublic, { userId: user._id });

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
            <ViewTracker slug={slug} />
            <div className="max-w-md mx-auto">
                {/* Profile */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg">
                        {user.title ? user.title[0].toUpperCase() : user.slug[0].toUpperCase()}
                    </div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        {user.title || `@${user.slug}`}
                    </h1>
                    {user.bio && (
                        <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-sm">
                            {user.bio}
                        </p>
                    )}
                </div>

                {/* Products */}
                <div className="space-y-6">
                    {products.length > 0 && products.map((product: any) => (
                        <PublicProductCard key={product._id} product={product} />
                    ))}

                    {products.length === 0 && (
                        <div className="text-center py-12 text-neutral-400">
                            <p>No products available yet.</p>
                        </div>
                    )}
                </div>

                {/* Branding */}
                <div className="mt-16 text-center">
                    <Link href="/" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                        Created with LinkMi
                    </Link>
                </div>
            </div>
        </div>
    );
}
