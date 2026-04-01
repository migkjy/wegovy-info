import { MetadataRoute } from 'next';
import { getAllPostSlugs } from '@/lib/posts';
import { CATEGORIES, SITE_URL } from '@/lib/constants';
import { clinics } from '@/data/clinics';

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllPostSlugs();

  const postUrls: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const clinicListUrl: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/clinics`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  const clinicDetailUrls: MetadataRoute.Sitemap = clinics.map((clinic) => ({
    url: `${SITE_URL}/clinics/${clinic.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...clinicListUrl,
    ...categoryUrls,
    ...clinicDetailUrls,
    ...postUrls,
  ];
}
