import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { SphereCanvas } from "./components/SphereCanvas";
import { Navigation } from "./components/Navigation";
import { LiquidCanvas } from "./components/LiquidCanvas";
import { ShadowCanvas } from "./components/ShadowCanvas";
import { Vignette } from "./components/Vignette";

export const App = () => {
	return (
		<BrowserRouter>
			<div className='App'>
				<Navigation />
				<Routes>
					<Route path='/' element={<SphereCanvas />} />
					<Route path='/liquid' element={<LiquidCanvas />} />
					<Route path='/shadow' element={<ShadowCanvas />} />
					<Route path='/vignette' element={<Vignette />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
};
