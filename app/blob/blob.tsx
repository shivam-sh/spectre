import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';
import { randomizeAccentColor } from '../colors';

export default function Blob({ window }) {
  const mesh = useRef<THREE.Mesh>();
  const hover = useRef(false);
  const click = useRef(false);
  const uniforms = useMemo(
    () => ({
      u_intensity: { value: 0.01 },
      u_time: { value: 0 },
    }),
    []
  );

  let timeStep = 0.005;

  function pointerDown() {
    click.current = true;
    timeStep = 0.08;

    randomizeAccentColor();

    setTimeout(() => {
      click.current = false;
      timeStep = 0.005;
    }, 80);
  }

  useFrame(({ camera }) => {
    camera.setViewOffset(
      window.width,
      window.height,
      -window.width * 0.45,
      -window.height * 0.45,
      window.width,
      window.height
    );

    if (mesh.current) {
      uniforms.u_time.value += timeStep;

      uniforms.u_intensity.value = MathUtils.lerp(
        uniforms.u_intensity.value,
        hover.current ? 1.2 : 0.01,
        0.05
      );

      uniforms.u_intensity.value = MathUtils.lerp(
        uniforms.u_intensity.value,
        click.current ? 3 : 1.2,
        0.3
      );
    }
  });

  return (
    <mesh
      ref={mesh}
      scale={1.5}
      position={[0, 0, 0]}
      onPointerOver={() => (hover.current = true)}
      onPointerOut={() => (hover.current = false)}
      onPointerDown={() => pointerDown()}
    >
      <icosahedronGeometry args={[2, 20]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

const vertexShader = `
uniform float u_intensity;
uniform float u_time;

varying vec2 vUv;
varying float vDisplacement;

float hash(float n) {
    return fract(sin(n) * 43758.5453123);
}

float mix(float x, float y, float a) {
    float k = 1.0 - cos(a * 3.1415927);
    float f = k * 0.5;
    return x * (1.0 - f) + y * f;
}

float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n = i.x + i.y * 57.0 + 113.0 * i.z;
    return mix(
        mix(
            mix(
                hash(n + 0.0),
                hash(n + 1.0),
                f.x
            ),
            mix(
                hash(n + 57.0),
                hash(n + 58.0),
                f.x
            ),
            f.y
        ),
        mix(
            mix(
                hash(n + 113.0),
                hash(n + 114.0),
                f.x
            ),
            mix(
                hash(n + 170.0),
                hash(n + 171.0),
                f.x
            ),
            f.y
        ),
        f.z
    );
}

void main() {
    vUv = uv;

    vDisplacement = noise(position + vec3(2.0 * u_time));

    vec3 newPosition = position + normal * vDisplacement * u_intensity;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}
`;

const fragmentShader = `
uniform float u_intensity;
uniform float u_time;

varying vec2 vUv;
varying float vDisplacement;

void main() {
    vec3 color = vec3(abs(vUv - 0.5) * 2.0, 0.9);
    gl_FragColor = vec4(color, 1.0);
}
`;