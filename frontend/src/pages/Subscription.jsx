import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

function SubscriptionPlan({
  title,
  price,
  features,
  cta,
  isFeatured = false,
  isRecommended = false,
}) {
  return (
    <Card
      className={`
        flex flex-col transition-all duration-300
        ${
          isRecommended
            ? 'bg-gray-800 border-yellow-500/80 ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/40'
            : isFeatured
              ? 'bg-blue-900/50 border-blue-500/80 ring-2 ring-blue-500'
              : 'bg-gray-800 border-gray-700'
        }
      `}
    >
      <CardHeader className="text-center">
        {isFeatured && (
          <div className="mb-2 text-sm font-bold text-blue-400 tracking-wider">MOST POPULAR</div>
        )}
        {isRecommended && (
          <div className="mb-2 text-sm font-bold text-yellow-400 tracking-wider">RECOMMENDED</div>
        )}
        <CardTitle className="text-2xl text-white font-bold">{title}</CardTitle>
        <p className="text-4xl font-extrabold text-white mt-2">
          {price}
          <span className="text-base font-medium text-gray-400">/ month</span>
        </p>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <ul className="space-y-3 mb-8 text-gray-300">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className={`w-full text-lg py-6 ${
            isRecommended
              ? 'bg-yellow-600 hover:bg-yellow-700 text-gray-900 font-bold'
              : isFeatured
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {cta}
        </Button>
      </CardContent>
    </Card>
  );
}

function Subscription() {
  const navigate = useNavigate();

  const plans = [
    {
      title: 'Basic',
      price: '€0',
      features: [
        'Track all your courses',
        'Calculate ECTS and GPA',
        'View degree requirements',
        'Basic timetable view',
      ],
      cta: 'Current Plan',
    },
    {
      title: 'Pro',
      price: '€5',
      isFeatured: true,
      features: [
        'All features from Basic',
        'Advanced course planning',
        'Timetable conflict detection',
        'What-if scenario analysis',
        'Priority support',
      ],
      cta: 'Upgrade to Pro',
    },
    {
      title: 'Ultimate',
      price: '€15',
      isRecommended: true,
      features: [
        'All features from Pro',
        'AI-powered semester suggestions',
        'Automated degree audit',
        'Integration with calendar apps',
        'Early access to new features',
      ],
      cta: 'Go Ultimate',
    },
  ];

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight">Unlock Your Potential</h1>
        <p className="text-xl text-gray-400 mt-4 max-w-2xl mx-auto">
          Choose a plan that fits your academic journey and take control of your studies like never
          before.
        </p>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <SubscriptionPlan key={plan.title} {...plan} />
        ))}
      </div>
      <div className="text-center mt-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white"
        >
          Go back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default Subscription;
