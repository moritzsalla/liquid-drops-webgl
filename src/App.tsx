import "./App.css";
import { Canvas } from "./Canvas";

export const App = () => {
	return (
		<div className='App'>
			<div
				style={{
					width: "20rem",
					height: "20rem",
					borderRadius: "50%",
					margin: "5rem",
					overflow: "hidden",
				}}
			>
				<Canvas />
			</div>
		</div>
	);
};
