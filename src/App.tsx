import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { Canvas } from "./components/Canvas";
import { Navigation } from "./components/Navigation";

export const App = () => {
	return (
		<BrowserRouter>
			<div className='App'>
				<Navigation />
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/2' element={<AdditionalPage />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
};

const HomePage = () => {
	return (
		<div>
			<Canvas />
		</div>
	);
};

const AdditionalPage = () => {
	return (
		<div className='min-h-screen p-8'>
			<h1 className='text-4xl font-bold mb-4'>New Page</h1>
			<p className='text-lg'>This is your new page content.</p>
		</div>
	);
};
