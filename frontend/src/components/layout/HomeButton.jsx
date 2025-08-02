import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * A reusable, globally-positioned button that navigates the user to the dashboard.
 * It remains fixed at the top right of the viewport.
 */
function HomeButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => navigate('/')}
      // Use 'fixed' for viewport positioning and adjust top/right values
      className="fixed top-6 right-6 z-50 bg-gray-700/80 backdrop-blur-sm border-gray-600 hover:bg-gray-600 text-white hover:text-white transition-all duration-200 flex-shrink-0"
      aria-label="Go to Dashboard"
    >
      <Home className="h-5 w-5" />
    </Button>
  );
}

export default HomeButton;
