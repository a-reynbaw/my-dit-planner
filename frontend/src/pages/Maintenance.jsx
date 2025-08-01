import { HardDrive, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function Maintenance() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <Card className="bg-gray-800 border-gray-700 w-[450px] text-center p-8">
        <CardHeader>
          <div className="mx-auto bg-red-900/40 rounded-full p-4 w-fit">
            <HardDrive className="h-12 w-12 text-red-400" />
          </div>
          <CardTitle className="text-3xl font-bold mt-6">Services Currently Down</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 mb-8">
            We're sorry, but our backend services are temporarily unavailable. We are working hard
            to resolve the issue. Please try again in a few moments.
          </p>
          <Button
            onClick={handleReload}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Maintenance;
