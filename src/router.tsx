import { Home } from "./pages/home";
import { createBrowserRouter } from "react-router-dom";
import { History } from "./pages/history";


export const route = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/:id',
        element: <History />,
    },
])