import { MotionValue, useTransform } from "framer-motion";
import { useMousePosition } from "./useMousePosition";

export const useReflectionRotation = (): MotionValue<number> => {
	const { mouseX, mouseY } = useMousePosition();

	const rotation = useTransform<number, number>([mouseX, mouseY], ([x, y]) => {
		const angle = Math.atan2(y, x) * (180 / Math.PI);
		return (angle + 180) % 360;
	});

	return rotation;
};
