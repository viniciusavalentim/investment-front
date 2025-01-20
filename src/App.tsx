import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { RouterProvider } from 'react-router-dom';
import { route } from './router';

// Crie uma instância do QueryClient
const queryClient = new QueryClient();

function App() {
    return (
        <>
            <Toaster richColors />
            <QueryClientProvider client={queryClient}>
                 <RouterProvider router={route} />
            </QueryClientProvider>
        </>
    );
}

export default App;
