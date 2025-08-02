import { ExternalLink, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const resources = [
  {
    title: 'DIT Website',
    description: 'The official website of the Department of Informatics and Telecommunications.',
    href: 'https://www.di.uoa.gr/',
  },
  {
    title: 'eClass',
    description:
      'The official e-learning platform for course materials, announcements, and assignments.',
    href: 'https://eclass.uoa.gr/',
  },
  {
    title: 'My-Studies',
    description: 'The student portal for grades, course declarations, and official documents.',
    href: 'https://my-studies.uoa.gr/',
  },
  {
    title: 'DIT Lab',
    description: 'Access to notes and old exams for various courses.',
    href: 'https://ditlab.gr/',
  },
  {
    title: 'Prog Intro Lectures',
    description: 'Lecture notes and resources for the Introduction to Programming course.',
    href: 'https://progintrolectures.netlify.app/',
  },
  {
    title: 'Hack Intro Lectures',
    description:
      'Lecture notes and resources for the Protection and Security of Computer Systems course.',
    href: 'https://hackintro-lectures.netlify.app/',
  },
  {
    title: 'Uoabot',
    description: 'A website for testing your assignments on Introduction to Programming course.',
    href: 'https://cgi.di.uoa.gr/~uoabot/index.html',
  },
];

function ResourceCard({ title, description, href }) {
  return (
    <Card className="bg-gray-800 border-gray-700 text-white hover:border-blue-500 transition-all duration-300 flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl text-blue-300">{title}</CardTitle>
        <p className="text-gray-400 text-sm pt-2">{description}</p>
      </CardHeader>
      <CardContent className="flex-grow flex items-end">
        <Button asChild className="w-full bg-gray-700 hover:bg-blue-600 transition-colors">
          <a href={href} target="_blank" rel="noopener noreferrer">
            Go to Site <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function Resources() {
  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 md:p-8">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <LifeBuoy className="h-10 w-10 text-green-400" />
          <h1 className="text-4xl font-bold tracking-tight">Useful Resources</h1>
        </div>
        <p className="text-lg text-gray-400">
          A collection of essential links for students of the department.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.title}
            title={resource.title}
            description={resource.description}
            href={resource.href}
          />
        ))}
      </div>
    </div>
  );
}

export default Resources;
