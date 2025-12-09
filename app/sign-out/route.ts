import { signOut } from '@workos-inc/authkit-nextjs';

export async function GET() {
  // Sign out and redirect to home page
  // The returnTo URL should match your "Sign-out redirect" configured in WorkOS Dashboard
  await signOut();
}
