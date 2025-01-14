import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Home } from './pages/home';

// Crie uma instância do QueryClient
const queryClient = new QueryClient();

function App() {
    return (
        <>
            <Toaster richColors />
            <QueryClientProvider client={queryClient}>
                <Home />
            </QueryClientProvider>
        </>
    );
}

export default App;
