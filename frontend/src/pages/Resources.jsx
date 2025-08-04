import { ExternalLink, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

function ResourceCard({ title, description, href, buttonText }) {
  return (
    <Card className="bg-gray-800 border-gray-700 text-white hover:border-blue-500 transition-all duration-300 flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl text-blue-300">{title}</CardTitle>
        <p className="text-gray-400 text-sm pt-2">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow flex items-end">
        <Button asChild className="w-full bg-gray-700 hover:bg-blue-600 transition-colors">
          <a href={href} target="_blank" rel="noopener noreferrer">
            {buttonText} <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function Resources() {
  const { t } = useTranslation();

  const resources = [
    {
      title: t('resources.items.ditWebsite.title'),
      description: t('resources.items.ditWebsite.description'),
      href: 'https://www.di.uoa.gr/',
    },
    {
      title: t('resources.items.eclass.title'),
      description: t('resources.items.eclass.description'),
      href: 'https://eclass.uoa.gr/',
    },
    {
      title: t('resources.items.myStudies.title'),
      description: t('resources.items.myStudies.description'),
      href: 'https://my-studies.uoa.gr/',
    },
    {
      title: t('resources.items.ditLab.title'),
      description: t('resources.items.ditLab.description'),
      href: 'https://ditlab.gr/',
    },
    {
      title: t('resources.items.progIntroLectures.title'),
      description: t('resources.items.progIntroLectures.description'),
      href: 'https://progintrolectures.netlify.app/',
    },
    {
      title: t('resources.items.hackIntroLectures.title'),
      description: t('resources.items.hackIntroLectures.description'),
      href: 'https://hackintro-lectures.netlify.app/',
    },
    {
      title: t('resources.items.uoabot.title'),
      description: t('resources.items.uoabot.description'),
      href: 'https://cgi.di.uoa.gr/~uoabot/index.html',
    },
  ];

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 md:p-8">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <LifeBuoy className="h-10 w-10 text-green-400" />
          <h1 className="text-4xl font-bold tracking-tight">{t('resources.title')}</h1>
        </div>
        <p className="text-lg text-gray-400">{t('resources.subtitle')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.href}
            title={resource.title}
            description={resource.description}
            href={resource.href}
            buttonText={t('resources.goToSite')}
          />
        ))}
      </div>
    </div>
  );
}

export default Resources;
