import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Classification from './pages/classification';
import DataImportation from './pages/importation';

const router = createBrowserRouter([
	{
		path: '/',
		element: <DataImportation />,
	},
	{
		path: '/data-classification',
		element: <Classification />,
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
