import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { SphereProgram } from "./components/SphereProgram";
import { Navigation } from "./components/Navigation";
import { BackgroundCompositionProgram } from "./components/BackgroundCompositionProgram";

export const App = () => {
	return (
		<BrowserRouter>
			<div className='App'>
				<Navigation />
				<Routes>
					<Route path='/' element={<SphereProgram />} />
					<Route path='/2' element={<BackgroundCompositionProgram />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
};
