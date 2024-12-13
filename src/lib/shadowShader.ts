export const SHADOW_FRAGMENT_SHADER = `#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_color_0;
uniform vec4 u_color_1;
uniform vec4 u_color_2;
uniform float u_noiseScale;
uniform float u_noiseSpeed;
uniform float u_noiseIntensity;
uniform vec3 u_noiseWeights;

void main() {
   vec2 uv = gl_FragCoord.xy / u_resolution;
   gl_FragColor = mix(u_color_0, u_color_1, uv.x);
}`;
