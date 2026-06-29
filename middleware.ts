import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token as any;
    const path = req.nextUrl?.pathname ?? '';

    // Admin routes
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Psicologo routes
    if (path.startsWith('/psicologo') && token?.role !== 'psicologo' && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl?.pathname ?? '';
        if (path.startsWith('/admin') || path.startsWith('/psicologo')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/psicologo/:path*'],
};
