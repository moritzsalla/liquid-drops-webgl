import type { MotionValue } from "framer-motion";
import { COLORS } from "../config";
import { memo } from "react";

type ColorControlProps = {
	label: string;
	color: MotionValue<string>;
};

export const ColorControl = ({ label, color }: ColorControlProps) => (
	<div>
		<label>{label}</label>
		{Object.entries(COLORS).map(([name, value]) => (
			<button
				key={name}
				style={{ backgroundColor: value }}
				onClick={() => {
					color.set(value);
				}}
			>
				{name}
			</button>
		))}
	</div>
);

// OpacityControl.tsx
type OpacityControlProps = {
	label: string;
	value: MotionValue<number>;
};

export const OpacityControl = ({ label, value }: OpacityControlProps) => (
	<div>
		<label>{label}</label>
		<input
			type='range'
			min='0'
			max='1'
			step='0.1'
			defaultValue={value.get()}
			onChange={(e) => value.set(parseFloat(e.target.value))}
		/>
	</div>
);

// NoiseControl.tsx
type NoiseControlProps = {
	label: string;
	value: MotionValue<number>;
	min?: number;
	max?: number;
};

export const NoiseControl = ({
	label,
	value,
	min = 0,
	max = 1,
}: NoiseControlProps) => (
	<div>
		<label>{label}</label>
		<input
			type='range'
			min={min}
			max={max}
			step='0.1'
			defaultValue={value.get()}
			onChange={(e) => value.set(parseFloat(e.target.value))}
		/>
	</div>
);

// Controls.tsx
type ControlsProps = {
	color1: MotionValue<string>;
	color2: MotionValue<string>;
	color3: MotionValue<string>;
	alpha1?: MotionValue<number>;
	alpha2?: MotionValue<number>;
	alpha3?: MotionValue<number>;
	noiseScale: MotionValue<number>;
	noiseIntensity: MotionValue<number>;
	noiseWeightX: MotionValue<number>;
	noiseWeightY: MotionValue<number>;
	noiseWeightZ: MotionValue<number>;
	showReflections?: boolean;
	blendSoftness: MotionValue<number>;
	flowSpeed: MotionValue<number>;
	setShowReflections?: (show: boolean) => void;
	showShadows?: boolean;
	setShowShadows?: (show: boolean) => void;
	showMask?: boolean;
	setShowMask?: (show: boolean) => void;
};

export const Controls = memo(
	({
		color1,
		color2,
		color3,
		alpha1,
		alpha2,
		alpha3,
		noiseScale,
		noiseIntensity,
		noiseWeightX,
		noiseWeightY,
		noiseWeightZ,
		showShadows,
		blendSoftness,
		flowSpeed,
		setShowShadows,
		showReflections,
		setShowReflections,
		showMask,
		setShowMask,
	}: ControlsProps) => {
		return (
			<div className='controls'>
				<div>
					{setShowShadows && (
						<button onClick={() => setShowShadows(!showShadows)}>
							{showShadows ? "Hide" : "Show"} Shadows
						</button>
					)}
					{setShowReflections && (
						<button onClick={() => setShowReflections(!showReflections)}>
							{showReflections ? "Hide" : "Show"} Reflections
						</button>
					)}
					{setShowMask && (
						<button onClick={() => setShowMask(!showMask)}>
							{showMask ? "Hide" : "Show"} Mask
						</button>
					)}
				</div>

				<div>
					<ColorControl label='Taste 1' color={color1} />
					<ColorControl label='Taste 2' color={color2} />
					<ColorControl label='Taste 3' color={color3} />
				</div>

				<div>
					{!!alpha1 && <OpacityControl label='Opacity 1' value={alpha1} />}
					{!!alpha2 && <OpacityControl label='Opacity 2' value={alpha2} />}
					{!!alpha3 && <OpacityControl label='Opacity 3' value={alpha3} />}
				</div>

				<div>
					<NoiseControl
						label='Noise Scale'
						value={noiseScale}
						min={0}
						max={2}
					/>
					<NoiseControl label='Noise Intensity' value={noiseIntensity} />
				</div>

				<div>
					<NoiseControl label='Noise Weight X' value={noiseWeightX} />
					<NoiseControl label='Noise Weight Y' value={noiseWeightY} />
					<NoiseControl label='Noise Weight Z' value={noiseWeightZ} />
				</div>

				<NoiseControl
					label='Blend Softness'
					value={blendSoftness}
					min={0}
					max={1}
				/>
				<NoiseControl
					label='Flow Speed'
					value={flowSpeed}
					min={0}
					max={2}
				/>
			</div>
		);
	},
);

 