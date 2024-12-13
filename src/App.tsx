import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { SphereCanvas } from "./components/SphereCanvas";
import { Navigation } from "./components/Navigation";
import { LiquidCanvas } from "./components/LiquidCanvas";
import { Vignette } from "./components/Vignette";
import { ConeCanvas } from "./components/ConeCanvas";

export const App = () => {
	return (
		<BrowserRouter>
			<div className='App'>
				<Navigation />
				<Routes>
					<Route path='/' element={<SphereCanvas />} />
					<Route path='/liquid' element={<LiquidCanvas />} />
					<Route path='/vignette' element={<Vignette />} />
					<Route path='/cone' element={<ConeCanvas />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
};
