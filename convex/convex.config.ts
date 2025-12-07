import { defineApp } from "convex/server";
import posthog from "@samhoque/convex-posthog/convex.config";

const app = defineApp();
app.use(posthog);

export default app;
