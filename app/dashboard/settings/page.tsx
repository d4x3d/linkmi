'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-neutral-500">Manage your account preferences.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;

  const themeOptions = [
    {
      id: 'light',
      name: 'Light',
      icon: Sun,
      description: 'Light mode for daytime use',
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: Moon,
      description: 'Dark mode for nighttime use',
    },
    {
      id: 'system',
      name: 'System',
      icon: Monitor,
      description: 'Follows your device settings',
    },
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`, {
      icon:
        newTheme === 'dark' ? (
          <Moon className="w-4 h-4" />
        ) : newTheme === 'light' ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Monitor className="w-4 h-4" />
        ),
    });
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Settings</h2>
          <p className="text-neutral-500 dark:text-neutral-400">Manage your account preferences.</p>
        </div>

      {/* Appearance Card */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              {currentTheme === 'dark' ? (
                <Moon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              ) : (
                <Sun className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              )}
            </div>
            Appearance
          </CardTitle>
          <CardDescription>Customize how Slobi looks on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isActive = theme === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleThemeChange(option.id)}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center',
                      isActive
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600',
                    )}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        isActive
                          ? 'bg-violet-500 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400',
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Preview</Label>
            <div
              className={cn(
                'p-6 rounded-xl border transition-colors',
                currentTheme === 'dark' ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-200',
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    currentTheme === 'dark' ? 'bg-violet-600' : 'bg-violet-500',
                  )}
                >
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <div>
                  <h4 className={cn('font-semibold', currentTheme === 'dark' ? 'text-white' : 'text-neutral-900')}>
                    Slobi Dashboard
                  </h4>
                  <p className={cn('text-sm', currentTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-500')}>
                    This is how your dashboard will look
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <div
                  className={cn('flex-1 h-8 rounded-lg', currentTheme === 'dark' ? 'bg-neutral-800' : 'bg-neutral-100')}
                />
                <div
                  className={cn('w-20 h-8 rounded-lg', currentTheme === 'dark' ? 'bg-violet-600' : 'bg-violet-500')}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* More Settings Coming Soon */}
      <Card className="border-neutral-200 dark:border-neutral-800 border-dashed">
        <CardHeader>
          <CardTitle className="text-neutral-400 dark:text-neutral-500">More Settings</CardTitle>
          <CardDescription>Additional settings will be available here soon.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Notifications', 'Privacy', 'Security', 'Connected Apps', 'Data Export'].map((item) => (
              <span
                key={item}
                className="px-3 py-1 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
