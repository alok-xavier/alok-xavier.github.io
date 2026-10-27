import React, {useMemo, useRef} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';

/**
 * A night city of 1,500 lights, one per server, laid out in 23 districts
 * (one per AWS account). The pointer acts like a torch: lights near it glow
 * hotter and rise. On first load the lights switch on in one sweep.
 *
 * Browser-only: imported lazily from Hero inside <BrowserOnly>.
 */

const SERVERS = 1500;
const ACCOUNTS = 23;
const SEED = 20210802;
const CAM_Y = 5.2;
const CAM_Z = 17;
const LOOK_Y = 4.7; // looking above the city pushes it to the bottom of the frame

const OFF = new THREE.Color('#2b3258');
const DIM = new THREE.Color('#a7742a');
const LIT = new THREE.Color('#f5b544');
const HOT = new THREE.Color('#fff1cf');

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pack 23 rectangular districts of uneven size into rows, like city blocks. */
function buildCity() {
  const rand = mulberry32(SEED);
  const weights = Array.from({length: ACCOUNTS}, () => Math.pow(rand(), 1.5) + 0.2);
  const total = weights.reduce((s, w) => s + w, 0);
  const sizes = weights.map((w) => Math.max(16, Math.round((w / total) * SERVERS)));
  let drift = SERVERS - sizes.reduce((s, n) => s + n, 0);
  for (let i = 0; drift !== 0; i = (i + 1) % ACCOUNTS) {
    const step = drift > 0 ? 1 : -1;
    if (sizes[i] + step >= 16) {
      sizes[i] += step;
      drift -= step;
    }
  }

  const pitch = 0.36; // distance between neighbouring lights
  const street = 0.9; // gap between districts
  const rowWidth = 30; // world units before wrapping to the next row
  const lights = [];
  let cursorX = 0;
  let cursorZ = 0;
  let rowDepth = 0;

  sizes.forEach((count, d) => {
    const depth = 5 + Math.floor(rand() * 5); // rows of lights in this district
    const cols = Math.ceil(count / depth);
    const w = cols * pitch;
    if (cursorX + w > rowWidth && cursorX > 0) {
      cursorX = 0;
      cursorZ += rowDepth + street;
      rowDepth = 0;
    }
    for (let i = 0; i < count; i++) {
      const c = Math.floor(i / depth);
      const r = i % depth;
      const roll = rand();
      lights.push({
        x: cursorX + c * pitch,
        z: cursorZ + r * pitch,
        h: 0.05 + Math.pow(rand(), 3) * 0.32, // a few tall "racks"
        tone: roll < 0.04 ? 2 : roll < 0.2 ? 0 : 1, // dim / lit / hot
        district: d,
      });
    }
    cursorX += w + street;
    rowDepth = Math.max(rowDepth, depth * pitch);
  });

  // Centre the whole city on the origin
  const maxX = Math.max(...lights.map((l) => l.x));
  const maxZ = Math.max(...lights.map((l) => l.z));
  lights.forEach((l) => {
    l.x -= maxX / 2;
    l.z -= maxZ / 2;
    l.delay = 0.35 + ((l.x + maxX / 2) / maxX) * 1.6 + rand() * 0.25; // left-to-right sweep
  });
  return lights;
}

function Lights({pointer, reduced}) {
  const mesh = useRef();
  const lights = useMemo(buildCity, []);
  const heat = useMemo(() => new Float32Array(lights.length), [lights]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const hit = useMemo(() => new THREE.Vector3(9999, 0, 9999), []);
  const start = useRef(null);
  const {camera} = useThree();

  useFrame((state, dt) => {
    if (!mesh.current) return;
    if (start.current === null) start.current = state.clock.elapsedTime;
    const t = reduced ? 99 : state.clock.elapsedTime - start.current;

    // Where is the pointer on the ground plane?
    if (pointer.current.active) {
      ray.setFromCamera(pointer.current, camera);
      if (!ray.ray.intersectPlane(plane, hit)) hit.set(9999, 0, 9999);
    } else {
      hit.set(9999, 0, 9999);
    }

    const k = Math.min(1, dt * 7);
    for (let i = 0; i < lights.length; i++) {
      const l = lights[i];
      const dx = l.x - hit.x;
      const dz = l.z - hit.z;
      const target = Math.exp(-(dx * dx + dz * dz) / 2.2);
      heat[i] += (target - heat[i]) * k;

      const on = t >= l.delay;
      const flash = on ? Math.max(0, 1 - (t - l.delay) * 3) : 0;
      const hh = heat[i];

      dummy.position.set(l.x, (l.h + hh * 0.9) / 2, l.z);
      dummy.scale.set(1, l.h + hh * 0.9, 1);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);

      if (!on) {
        color.copy(OFF);
      } else {
        color.copy(l.tone === 0 ? DIM : l.tone === 2 ? HOT : LIT);
        color.lerp(HOT, Math.min(1, hh * 1.2 + flash));
      }
      mesh.current.setColorAt(i, color);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;

    // Gentle parallax that follows the pointer
    const px = pointer.current.active ? pointer.current.x : 0;
    const py = pointer.current.active ? pointer.current.y : 0;
    // Phones are tall and narrow: come closer so the city still reads
    const narrow = state.size.width < 700;
    const camY = narrow ? 6.5 : CAM_Y;
    const camZ = narrow ? 12 : CAM_Z;
    const lookY = narrow ? 0.6 : LOOK_Y;
    camera.position.x += (px * 1.4 - camera.position.x) * 0.03;
    camera.position.y += (camY + py * 0.5 - camera.position.y) * 0.03;
    camera.position.z += (camZ - camera.position.z) * 0.08;
    camera.lookAt(0, lookY, 0);
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, lights.length]} frustumCulled={false}>
      <boxGeometry args={[0.22, 1, 0.22]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

export default function CityScene({pointer, reduced, running}) {
  return (
    <Canvas
      frameloop={running ? 'always' : 'never'}
      dpr={[1, 1.75]}
      gl={{antialias: true, alpha: true, powerPreference: 'high-performance'}}
      camera={{position: [0, CAM_Y, CAM_Z], fov: 40, near: 0.1, far: 80}}
      onCreated={({scene}) => {
        scene.fog = new THREE.Fog('#161b33', 14, 30);
      }}>
      <Lights pointer={pointer} reduced={reduced} />
    </Canvas>
  );
}
