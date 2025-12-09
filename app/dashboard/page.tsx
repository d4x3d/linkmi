'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  const user = useQuery(api.users.me);
  const metrics = useQuery(api.analytics.getDashboardMetrics);
  const links = useQuery(api.links.list);

  // Helper to format currency
  const formatNaira = (amountInKobo: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amountInKobo / 100);
  };

  if (user === undefined || metrics === undefined || links === undefined) {
    return <DashboardSkeleton />;
  }

  const hasNoLinks = links.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Welcome back{user?.title ? `, ${user.title}` : ''}
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          Here&apos;s what&apos;s happening with your page today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Views" value={metrics?.totalViews?.toString() || '0'} icon={Eye} />
        <StatsCard title="Total Sales" value={metrics?.totalSales?.toString() || '0'} icon={ShoppingCart} />
        <StatsCard title="Total Revenue" value={formatNaira(metrics?.totalRevenue || 0)} icon={Wallet} />
        <StatsCard title="Active Products" value={metrics?.activeProducts?.toString() || '0'} icon={ShoppingBag} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasNoLinks && (
              <Link href="/dashboard/links" className="block">
                <Button variant="outline" className="w-full justify-start h-auto py-4 text-base">
                  <Plus className="mr-3 h-5 w-5" /> Add your first link
                </Button>
              </Link>
            )}
            <Link href="/dashboard/store" className="block">
              <Button variant="outline" className="w-full justify-start h-auto py-4 text-base">
                <Plus className="mr-3 h-5 w-5" /> Add a new product
              </Button>
            </Link>
            <Link href="/dashboard/appearance" className="block">
              <Button variant="outline" className="w-full justify-start h-auto py-4 text-base">
                <Palette className="mr-3 h-5 w-5" /> Customize Page
              </Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg break-all flex justify-between items-center gap-2">
              <code className="text-sm text-violet-600 dark:text-violet-400">
                {user?.slug ? `https://linkmi.app/${user.slug}` : 'No slug set'}
              </code>
            </div>
            <Button className="w-full mt-4 bg-violet-600 hover:bg-violet-700" asChild>
              <Link href={`/${user?.slug}`} target="_blank">
                Visit Page
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Eye, ShoppingCart, ShoppingBag, Wallet, Palette } from 'lucide-react';

function StatsCard({ title, value, icon: Icon }: { title: string; value: string; icon: any }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</CardTitle>
        <Icon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}
