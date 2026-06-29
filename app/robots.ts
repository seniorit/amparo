import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const baseUrl = host.startsWith('http') ? host : `https://${host}`;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/psicologo/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
