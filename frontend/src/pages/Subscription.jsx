import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function SubscriptionPlan({
  title,
  price,
  features,
  cta,
  isFeatured = false,
  isRecommended = false,
}) {
  const { t } = useTranslation();

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
          <div className="mb-2 text-sm font-bold text-blue-400 tracking-wider">
            {t('subscription.badges.mostPopular')}
          </div>
        )}
        {isRecommended && (
          <div className="mb-2 text-sm font-bold text-yellow-400 tracking-wider">
            {t('subscription.badges.recommended')}
          </div>
        )}
        <CardTitle className="text-2xl text-white font-bold">{title}</CardTitle>
        <p className="text-4xl font-extrabold text-white mt-2">
          {price}
          <span className="text-base font-medium text-gray-400">{t('subscription.perMonth')}</span>
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
  const { t } = useTranslation();

  const plans = [
    {
      title: t('subscription.plans.basic.title'),
      price: t('subscription.plans.basic.price'),
      features: t('subscription.plans.basic.features', { returnObjects: true }),
      cta: t('subscription.plans.basic.cta'),
    },
    {
      title: t('subscription.plans.pro.title'),
      price: t('subscription.plans.pro.price'),
      isFeatured: true,
      features: t('subscription.plans.pro.features', { returnObjects: true }),
      cta: t('subscription.plans.pro.cta'),
    },
    {
      title: t('subscription.plans.ultimate.title'),
      price: t('subscription.plans.ultimate.price'),
      isRecommended: true,
      features: t('subscription.plans.ultimate.features', { returnObjects: true }),
      cta: t('subscription.plans.ultimate.cta'),
    },
  ];

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 md:p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight">{t('subscription.title')}</h1>
        <p className="text-xl text-gray-400 mt-4 max-w-2xl mx-auto">{t('subscription.subtitle')}</p>
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
          {t('subscription.goBackToDashboard')}
        </Button>
      </div>
    </div>
  );
}

export default Subscription;
