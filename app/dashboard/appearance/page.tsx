"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// Assuming sonner is installed or just use alert
// Actually I don't know if sonner is installed. I'll just use simple alert mock or nothing.

export default function AppearancePage() {
    const user = useQuery(api.users.me);
    const updateTheme = useMutation(api.users.updateTheme);

    const [title, setTitle] = useState("");
    const [bio, setBio] = useState("");

    // Sync state when user loads
    useEffect(() => {
        if (user) {
            setTitle(user.title || "");
            setBio(user.bio || "");
        }
    }, [user]);

    const handleSave = async () => {
        await updateTheme({
            title,
            bio,
        });
        // Show success
        alert("Saved!");
    }

    if (user === undefined) return <div>Loading...</div>;

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
                    <p className="text-neutral-500">Customize how your page looks.</p>
                </div>
                <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700">Save Changes</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your profile information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Page Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={user?.slug}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell the world about yourself..."
                            rows={4}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>Coming soon: custom colors and fonts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-neutral-500">Theme customization options will appear here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
