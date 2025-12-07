import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

export default authkitMiddleware({
  eagerAuth: true,
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [
      '/',
      '/sign-in',
      '/sign-up',
      '/paystack/callback',
    ],
  },
});

export const config = {
  matcher: [
    // Protect dashboard routes
    '/dashboard/:path*',
    // Protect API routes
    '/(api|trpc)(.*)',
  ],
};
