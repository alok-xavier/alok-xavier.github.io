import React, {useEffect, useMemo, useRef} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * An original F1-style car in an "AX" livery: Italian racing red, night
 * indigo and white, with carbon aero. No team branding.
 *
 * Car space: front points along +X, up is +Y, the car's width is Z.
 * Each part sits in its own group so it can slide out for the exploded view.
 */

export const PARTS = [
  {id: 'frontWing', explode: [1.15, 0, 0], anchor: [2.85, 0.35, 0.95]},
  {id: 'nose', explode: [0.6, 0.2, 0], anchor: [2.1, 0.62, 0]},
  {id: 'halo', explode: [0, 0.95, 0], anchor: [0.25, 1.12, 0]},
  {id: 'sidepods', explode: [0, 0, 0.8], anchor: [-0.3, 0.7, 0.75]},
  {id: 'engine', explode: [0, 0.75, 0], anchor: [-1.0, 1.25, 0]},
  {id: 'rearWing', explode: [-0.95, 0.6, 0], anchor: [-2.45, 1.55, 0]},
  {id: 'floor', explode: [0, -0.7, 0], anchor: [-0.3, 0.05, 0.85]},
  {id: 'wheels', explode: [0, 0, 1.05], anchor: [1.6, 0.75, 1.0]},
];

const SYMMETRIC = new Set(['sidepods', 'wheels']);

/* ---------------------------------------------------------------- */
/* Materials                                                         */
/* ---------------------------------------------------------------- */

function useMaterials() {
  return useMemo(
    () => ({
      paint: new THREE.MeshPhysicalMaterial({color: '#c8101c', roughness: 0.28, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.08}),
      night: new THREE.MeshStandardMaterial({color: '#1d2350', roughness: 0.25, metalness: 0.35}),
      white: new THREE.MeshStandardMaterial({color: '#f3f3f5', roughness: 0.25, metalness: 0.05}),
      carbon: new THREE.MeshStandardMaterial({color: '#15161c', roughness: 0.4, metalness: 0.35}),
      tyre: new THREE.MeshStandardMaterial({color: '#141416', roughness: 0.92}),
      cover: new THREE.MeshStandardMaterial({color: '#1d2350', roughness: 0.2, metalness: 0.7}),
      titanium: new THREE.MeshStandardMaterial({color: '#8b91a8', roughness: 0.3, metalness: 0.95}),
      visor: new THREE.MeshStandardMaterial({color: '#0a0c16', roughness: 0.05, metalness: 0.9}),
      helmet: new THREE.MeshStandardMaterial({color: '#f5b544', roughness: 0.2, metalness: 0.25}),
      rain: new THREE.MeshStandardMaterial({color: '#330000', emissive: '#ff1a1a', emissiveIntensity: 0}),
      exhaust: new THREE.MeshStandardMaterial({color: '#2a2a2e', emissive: '#ff8a1f', emissiveIntensity: 0, roughness: 0.4, metalness: 0.8}),
    }),
    [],
  );
}

/** Text decal painted onto a transparent canvas texture. */
function useDecal(text, {w = 512, h = 256, color = '#ffffff', font = '800 italic 190px Archivo, sans-serif', bg = null, stroke = null} = {}) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (bg) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (stroke) {
      ctx.lineWidth = 10;
      ctx.strokeStyle = stroke;
      ctx.strokeText(text, w / 2, h / 2 + 8);
    }
    ctx.fillStyle = color;
    ctx.fillText(text, w / 2, h / 2 + 8);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return new THREE.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, toneMapped: false});
  }, [text, w, h, color, font, bg, stroke]);
}

/* ---------------------------------------------------------------- */
/* Geometry helpers                                                  */
/* ---------------------------------------------------------------- */

/** Extrude a side-profile shape (drawn in X/Y) across the car's width (Z), centred. */
function extrude(draw, depth, bevel = 0.04) {
  const s = new THREE.Shape();
  draw(s);
  const g = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 5,
    curveSegments: 24,
  });
  g.translate(0, 0, -depth / 2);
  g.computeVertexNormals();
  return g;
}

/** A thin cambered wing section, chord along X (leading edge at x=0, trailing edge at -chord). */
function airfoil(chord, thick, span) {
  return extrude(
    (s) => {
      s.moveTo(0, 0);
      s.bezierCurveTo(0, thick * 1.2, -chord * 0.35, thick * 1.4, -chord, thick * 0.5);
      s.bezierCurveTo(-chord * 0.6, thick * 0.1, -chord * 0.2, -thick * 0.4, 0, 0);
    },
    span,
    0.006,
  );
}

function Strut({from, to, mat, r = 0.016}) {
  const {pos, quat, len} = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return {pos: a.add(b).multiplyScalar(0.5), quat: q, len: dir.length()};
  }, [from, to]);
  return (
    <mesh position={pos} quaternion={quat} material={mat}>
      <cylinderGeometry args={[r, r, len, 8]} />
    </mesh>
  );
}

/* ---------------------------------------------------------------- */
/* Parts                                                             */
/* ---------------------------------------------------------------- */

function FrontWing({M}) {
  const main = useMemo(() => airfoil(0.46, 0.05, 1.86), []);
  const flap1 = useMemo(() => airfoil(0.32, 0.04, 1.72), []);
  const flap2 = useMemo(() => airfoil(0.24, 0.035, 1.6), []);
  const endplate = useMemo(
    () =>
      extrude(
        (s) => {
          s.moveTo(0.06, 0.05);
          s.lineTo(-0.5, 0.05);
          s.quadraticCurveTo(-0.56, 0.16, -0.5, 0.27);
          s.quadraticCurveTo(-0.2, 0.22, 0.06, 0.13);
          s.lineTo(0.06, 0.05);
        },
        0.02,
        0.008,
      ),
    [],
  );
  return (
    <group position={[3.0, 0, 0]}>
      <mesh geometry={main} position={[0, 0.1, 0]} material={M.carbon} />
      <mesh geometry={flap1} position={[-0.3, 0.17, 0]} rotation={[0, 0, -0.32]} material={M.paint} />
      <mesh geometry={flap2} position={[-0.46, 0.26, 0]} rotation={[0, 0, -0.55]} material={M.white} />
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={endplate} position={[0, 0, s * 0.94]} material={M.paint} />
      ))}
      {/* pillars up to the nose */}
      {[-1, 1].map((s) => (
        <Strut key={s} from={[-0.25, 0.12, s * 0.09]} to={[-0.35, 0.34, s * 0.07]} mat={M.carbon} r={0.02} />
      ))}
    </group>
  );
}

function Nose({M}) {
  const number = useDecal('AX', {color: '#ffffff', font: '900 italic 200px Archivo, sans-serif'});
  return (
    <group>
      {/* tapered nose: wide where it meets the tub, narrow at the tip, flattened vertically */}
      <mesh position={[1.95, 0.45, 0]} rotation={[0, 0, -Math.PI / 2 - 0.1]} scale={[0.78, 1, 1]} material={M.paint}>
        <cylinderGeometry args={[0.06, 0.15, 1.7, 32, 1]} />
      </mesh>
      <mesh position={[2.8, 0.365, 0]} scale={[1.4, 0.7, 0.95]} material={M.paint}>
        <sphereGeometry args={[0.06, 20, 12]} />
      </mesh>
      {/* white tip and number on top */}
      <mesh position={[2.72, 0.372, 0]} rotation={[0, 0, -Math.PI / 2 - 0.1]} scale={[0.78, 1, 1]} material={M.white}>
        <cylinderGeometry args={[0.045, 0.065, 0.2, 24, 1]} />
      </mesh>
      <group position={[2.1, 0.49, 0]} rotation={[0, 0, -0.1]}>
        <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 2]} material={number}>
          <planeGeometry args={[0.22, 0.11]} />
        </mesh>
      </group>
    </group>
  );
}

function Halo({M}) {
  const tube = useMemo(() => {
    const pts = [
      [-0.02, 0.66, 0.27],
      [0.08, 0.86, 0.29],
      [0.3, 0.94, 0.22],
      [0.46, 0.93, 0],
      [0.3, 0.94, -0.22],
      [0.08, 0.86, -0.29],
      [-0.02, 0.66, -0.27],
    ].map((p) => new THREE.Vector3(...p));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.032, 12, false);
  }, []);
  return (
    <group>
      <mesh geometry={tube} material={M.night} />
      <Strut from={[0.46, 0.93, 0]} to={[0.66, 0.68, 0]} mat={M.night} r={0.03} />
    </group>
  );
}

function Sidepods({M, sides}) {
  const pod = useMemo(
    () =>
      extrude(
        (s) => {
          s.moveTo(0.5, 0.2);
          s.lineTo(0.5, 0.55);
          s.quadraticCurveTo(0.1, 0.62, -0.5, 0.5);
          s.quadraticCurveTo(-1.0, 0.38, -1.3, 0.3);
          s.lineTo(-1.3, 0.2);
          s.quadraticCurveTo(-0.4, 0.14, 0.5, 0.2);
        },
        0.3,
        0.05,
      ),
    [],
  );
  const name = useDecal('XAVIER', {w: 1024, h: 200, color: '#ffffff', font: '800 italic 150px Archivo, sans-serif'});
  return (
    <group>
      {sides.map((s) => (
        <group key={s} position={[0, 0, s * 0.5]}>
          <mesh geometry={pod} material={M.paint} />
          {/* inlet mouth */}
          <mesh position={[0.53, 0.38, 0]} material={M.carbon}>
            <boxGeometry args={[0.04, 0.26, 0.28]} />
          </mesh>
          {/* night-indigo lower stripe */}
          <mesh position={[-0.35, 0.27, s * 0.2]} rotation={[0, 0, 0.04]} material={M.night}>
            <boxGeometry args={[1.5, 0.07, 0.01]} />
          </mesh>
          <mesh position={[-0.25, 0.42, s * 0.205]} rotation={[0, s > 0 ? 0 : Math.PI, 0.05]} material={name}>
            <planeGeometry args={[0.95, 0.18]} />
          </mesh>
          {/* mirror */}
          <Strut from={[0.25, 0.58, s * -0.08]} to={[0.32, 0.75, s * 0.02]} mat={M.carbon} />
          <mesh position={[0.33, 0.77, s * 0.04]} material={M.paint}>
            <boxGeometry args={[0.06, 0.06, 0.16]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Engine({M, firing}) {
  const cover = useMemo(
    () =>
      extrude(
        (s) => {
          s.moveTo(-0.2, 0.25);
          s.lineTo(-0.2, 0.72);
          s.quadraticCurveTo(-0.16, 0.96, -0.32, 0.99);
          s.lineTo(-0.5, 0.99);
          s.quadraticCurveTo(-1.1, 0.78, -2.1, 0.5);
          s.lineTo(-2.1, 0.25);
          s.lineTo(-0.2, 0.25);
        },
        0.34,
        0.06,
      ),
    [],
  );
  const fin = useMemo(
    () =>
      extrude(
        (s) => {
          s.moveTo(-0.55, 0.96);
          s.quadraticCurveTo(-1.3, 0.94, -1.95, 0.92);
          s.lineTo(-1.95, 0.55);
          s.quadraticCurveTo(-1.1, 0.72, -0.55, 0.96);
        },
        0.012,
        0,
      ),
    [],
  );
  const finDecal = useDecal('AX', {w: 512, h: 256, color: '#ffffff', font: '900 italic 210px Archivo, sans-serif'});
  useFrame(({clock}) => {
    M.exhaust.emissiveIntensity = firing.current ? 1.6 + Math.sin(clock.elapsedTime * 60) * 0.9 : 0;
  });
  return (
    <group>
      <mesh geometry={cover} material={M.paint} />
      {/* airbox intake */}
      <mesh position={[-0.205, 0.88, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1.3, 1]} material={M.carbon}>
        <circleGeometry args={[0.09, 24]} />
      </mesh>
      <mesh geometry={fin} material={M.night} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-1.4, 0.82, s * 0.012]} rotation={[0, s > 0 ? 0 : Math.PI, -0.04]} material={finDecal}>
          <planeGeometry args={[0.6, 0.3]} />
        </mesh>
      ))}
      {/* white flash down the spine */}
      <mesh position={[-1.25, 0.82, 0]} rotation={[0, 0, 0.3]} material={M.white}>
        <boxGeometry args={[1.0, 0.012, 0.1]} />
      </mesh>
      {/* exhaust */}
      <mesh position={[-2.2, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} material={M.exhaust}>
        <cylinderGeometry args={[0.05, 0.06, 0.18, 16]} />
      </mesh>
    </group>
  );
}

function RearWing({M, firing}) {
  const main = useMemo(() => airfoil(0.36, 0.045, 1.08), []);
  const flapGeo = useMemo(() => airfoil(0.26, 0.04, 1.06), []);
  const beam = useMemo(() => airfoil(0.26, 0.035, 0.9), []);
  const plate = useMemo(
    () =>
      extrude(
        (s) => {
          s.moveTo(0.12, 0.45);
          s.lineTo(0.12, 1.2);
          s.quadraticCurveTo(-0.15, 1.42, -0.5, 1.3);
          s.lineTo(-0.5, 0.5);
          s.quadraticCurveTo(-0.2, 0.38, 0.12, 0.45);
        },
        0.02,
        0.008,
      ),
    [],
  );
  const plateDecal = useDecal('AX', {w: 512, h: 512, color: '#ffffff', font: '900 italic 300px Archivo, sans-serif'});
  const flap = useRef();
  useFrame((_, dt) => {
    if (!flap.current) return;
    // flap swings open on the "straight" while firing (low-drag mode)
    const target = firing.current ? -0.08 : -0.55;
    flap.current.rotation.z += (target - flap.current.rotation.z) * Math.min(1, dt * 6);
  });
  return (
    <group position={[-2.2, 0, 0]}>
      <mesh geometry={main} position={[0, 1.13, 0]} rotation={[0, 0, -0.12]} material={M.carbon} />
      <mesh ref={flap} geometry={flapGeo} position={[-0.3, 1.2, 0]} rotation={[0, 0, -0.55]} material={M.paint} />
      <mesh geometry={beam} position={[-0.05, 0.55, 0]} rotation={[0, 0, -0.2]} material={M.carbon} />
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, s * 0.55]}>
          <mesh geometry={plate} material={M.night} />
          <mesh position={[-0.18, 0.88, s * 0.012]} rotation={[0, s > 0 ? 0 : Math.PI, 0]} material={plateDecal}>
            <planeGeometry args={[0.42, 0.42]} />
          </mesh>
        </group>
      ))}
      {/* swan-neck pylon */}
      <Strut from={[0.05, 0.5, 0]} to={[-0.12, 1.14, 0]} mat={M.carbon} r={0.025} />
    </group>
  );
}

function Floor({M, firing}) {
  const plate = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(1.15, -0.3);
    s.lineTo(0.6, -0.72);
    s.lineTo(-1.6, -0.7);
    s.lineTo(-2.15, -0.5);
    s.lineTo(-2.15, 0.5);
    s.lineTo(-1.6, 0.7);
    s.lineTo(0.6, 0.72);
    s.lineTo(1.15, 0.3);
    s.lineTo(1.15, -0.3);
    const g = new THREE.ExtrudeGeometry(s, {depth: 0.03, bevelEnabled: false});
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  useFrame(({clock}) => {
    const on = firing.current && Math.floor(clock.elapsedTime * 6) % 2 === 0;
    M.rain.emissiveIntensity = on ? 4 : 0.15;
  });
  return (
    <group>
      <mesh geometry={plate} position={[0, 0.14, 0]} material={M.carbon} />
      {/* edge stripes */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-0.5, 0.125, s * 0.71]} material={M.white}>
          <boxGeometry args={[2.2, 0.02, 0.015]} />
        </mesh>
      ))}
      {/* diffuser */}
      {[-1, 0, 1].map((s) => (
        <mesh key={s} position={[-2.25, 0.2, s * 0.3]} rotation={[0, 0, -0.35]} material={M.carbon}>
          <boxGeometry args={[0.32, 0.02, 0.28]} />
        </mesh>
      ))}
      {/* rain light */}
      <mesh position={[-2.42, 0.36, 0]} material={M.rain}>
        <boxGeometry args={[0.03, 0.07, 0.14]} />
      </mesh>
    </group>
  );
}

function Wheel({M, front, side, spin, steer}) {
  const r = front ? 0.34 : 0.36;
  const w = front ? 0.3 : 0.38;
  const tyre = useMemo(() => {
    const rIn = r * 0.66;
    const pts = [
      [rIn, -w / 2],
      [r - 0.05, -w / 2],
      [r - 0.01, -w / 2 + 0.03],
      [r, -w / 4],
      [r, w / 4],
      [r - 0.01, w / 2 - 0.03],
      [r - 0.05, w / 2],
      [rIn, w / 2],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.LatheGeometry(pts, 48);
  }, [r, w]);
  const roll = useRef();
  const steerRef = useRef();
  useFrame((_, dt) => {
    if (roll.current) roll.current.rotation.y -= spin.current * dt;
    if (steerRef.current && front) steerRef.current.rotation.y = steer.current;
  });
  const x = front ? 1.6 : -1.75;
  return (
    <group position={[x, r, side * (front ? 0.88 : 0.86)]} ref={steerRef}>
      {/* lathe axis is Y; lay it along Z so the wheel rolls about the axle */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <group ref={roll}>
          <mesh geometry={tyre} material={M.tyre} />
          {/* compound stripe on both sidewalls */}
          {[-1, 1].map((k) => (
            <mesh key={k} position={[0, (k * w) / 2 - k * 0.002, 0]} rotation={[Math.PI / 2, 0, 0]} material={M.white}>
              <torusGeometry args={[r * 0.8, 0.008, 6, 48]} />
            </mesh>
          ))}
          {/* wheel cover with a contrasting spoke so the spin reads */}
          <mesh material={M.cover}>
            <cylinderGeometry args={[r * 0.66, r * 0.66, w * 0.92, 32]} />
          </mesh>
          <mesh position={[0, (side * w) / 2 - side * 0.03, 0]} material={M.paint}>
            <boxGeometry args={[r * 1.2, 0.012, 0.05]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function Wheels({M, sides, spin, steer}) {
  return (
    <group>
      {sides.map((s) => (
        <group key={s}>
          <Wheel M={M} front side={s} spin={spin} steer={steer} />
          <Wheel M={M} side={s} spin={spin} steer={steer} />
          {/* wishbones */}
          <Strut from={[1.45, 0.42, s * 0.28]} to={[1.6, 0.36, s * 0.72]} mat={M.carbon} />
          <Strut from={[1.8, 0.4, s * 0.26]} to={[1.62, 0.4, s * 0.72]} mat={M.carbon} />
          <Strut from={[1.5, 0.6, s * 0.26]} to={[1.6, 0.5, s * 0.72]} mat={M.carbon} />
          <Strut from={[-1.55, 0.42, s * 0.2]} to={[-1.75, 0.38, s * 0.66]} mat={M.carbon} />
          <Strut from={[-1.9, 0.45, s * 0.2]} to={[-1.76, 0.42, s * 0.66]} mat={M.carbon} />
        </group>
      ))}
    </group>
  );
}

/** Tub and driver: the reference everything explodes from. */
function Core({M}) {
  const tub = useMemo(
    () =>
      extrude(
        (s) => {
          s.moveTo(-0.3, 0.2);
          s.lineTo(1.15, 0.28);
          s.lineTo(1.15, 0.54);
          s.quadraticCurveTo(0.85, 0.64, 0.6, 0.66);
          s.lineTo(-0.3, 0.68);
          s.lineTo(-0.3, 0.2);
        },
        0.56,
        0.05,
      ),
    [],
  );
  const helmetStripe = useMemo(() => new THREE.TorusGeometry(0.145, 0.018, 8, 32), []);
  return (
    <group>
      <mesh geometry={tub} material={M.paint} />
      <mesh position={[0.25, 0.69, 0]} material={M.carbon}>
        <boxGeometry args={[0.55, 0.03, 0.4]} />
      </mesh>
      {/* night-indigo cockpit surround */}
      <mesh position={[0.6, 0.665, 0]} rotation={[0, 0, -0.06]} material={M.night}>
        <boxGeometry args={[0.3, 0.02, 0.5]} />
      </mesh>
      <group position={[0.15, 0.82, 0]}>
        <mesh material={M.helmet}>
          <sphereGeometry args={[0.15, 32, 20]} />
        </mesh>
        <mesh geometry={helmetStripe} rotation={[0, 0, Math.PI / 2]} material={M.night} />
        <mesh position={[0.1, 0.02, 0]} rotation={[0, 0, -0.25]} material={M.visor}>
          <boxGeometry args={[0.07, 0.06, 0.2]} />
        </mesh>
      </group>
    </group>
  );
}

/* ---------------------------------------------------------------- */
/* Scene                                                             */
/* ---------------------------------------------------------------- */

function makeGlow(base) {
  const m = base.clone();
  if ('emissive' in m) {
    m.emissive = new THREE.Color('#f5b544');
    m.emissiveIntensity = 0.5;
  }
  return m;
}

function Part({part, exploded, hovered, setHovered, children}) {
  const ref = useRef();
  const sideRefs = useRef({});
  const glow = hovered === part.id;
  const symmetric = SYMMETRIC.has(part.id);
  const lastGlow = useRef(null);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = Math.min(1, dt * 5);
    const [ex, ey, ez] = exploded ? part.explode : [0, 0, 0];
    g.position.x += (ex - g.position.x) * k;
    g.position.y += (ey - g.position.y) * k;
    if (symmetric) {
      [-1, 1].forEach((side) => {
        const sg = sideRefs.current[side];
        if (sg) sg.position.z += (side * ez - sg.position.z) * k;
      });
    } else {
      g.position.z += (ez - g.position.z) * k;
    }
    if (lastGlow.current !== glow) {
      lastGlow.current = glow;
      g.traverse((o) => {
        if (!o.isMesh || o.material.isMeshBasicMaterial) return;
        if (!o.userData.base) o.userData.base = o.material;
        o.material = glow ? o.userData.glow || (o.userData.glow = makeGlow(o.userData.base)) : o.userData.base;
      });
    }
  });

  const handlers = {
    onPointerOver: (e) => {
      e.stopPropagation();
      setHovered(part.id);
    },
    onPointerOut: () => setHovered((h) => (h === part.id ? null : h)),
    onClick: (e) => {
      e.stopPropagation();
      setHovered(part.id);
    },
  };

  return (
    <group ref={ref} {...handlers}>
      {symmetric
        ? [-1, 1].map((side) => (
            <group key={side} ref={(el) => (sideRefs.current[side] = el)}>
              {children([side])}
            </group>
          ))
        : children([-1, 1])}
    </group>
  );
}

function Controls({autoRotate}) {
  const {camera, gl} = useThree();
  const ctrl = useMemo(() => new OrbitControls(camera, gl.domElement), [camera, gl]);
  useEffect(() => {
    ctrl.enableZoom = false;
    ctrl.enablePan = false;
    ctrl.enableDamping = true;
    ctrl.minPolarAngle = 0.35;
    ctrl.maxPolarAngle = 1.48;
    ctrl.target.set(0, 0.45, 0);
    return () => ctrl.dispose();
  }, [ctrl]);
  useFrame(() => {
    ctrl.autoRotate = autoRotate;
    ctrl.autoRotateSpeed = 1.4;
    ctrl.update();
  });
  return null;
}

/** Back the camera off on narrow canvases so the whole car fits. */
function CameraFit() {
  const {camera, size} = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const dist = aspect < 1.2 ? 9.6 : aspect < 1.5 ? 7.8 : 6.7;
    camera.position.setLength(dist);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

function Environment() {
  const {gl, scene} = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** A blurred dark ellipse under the car: much cheaper than real-time shadows. */
function SoftShadow() {
  const mat = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 64, 4, 128, 64, 124);
    g.addColorStop(0, 'rgba(0,0,0,0.7)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.35)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 128);
    return new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false});
  }, []);
  return (
    <mesh position={[-0.1, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mat}>
      <planeGeometry args={[6.2, 2.6]} />
    </mesh>
  );
}

/** White streaks rushing past while the car is "on the straight". */
function SpeedStreaks({firing}) {
  const group = useRef();
  const streaks = useMemo(
    () =>
      Array.from({length: 46}, () => ({
        x: (Math.random() - 0.5) * 7.2,
        y: 0.15 + Math.random() * 1.5,
        z: (Math.random() < 0.5 ? -1 : 1) * (1.1 + Math.random() * 1.6),
        len: 0.4 + Math.random() * 1.1,
        v: 9 + Math.random() * 8,
      })),
    [],
  );
  const mat = useMemo(() => new THREE.MeshBasicMaterial({color: '#ffffff', transparent: true, opacity: 0, toneMapped: false}), []);
  useFrame((_, dt) => {
    const target = firing.current ? 0.75 : 0;
    mat.opacity += (target - mat.opacity) * Math.min(1, dt * 6);
    if (!group.current || mat.opacity < 0.01) return;
    group.current.children.forEach((m, i) => {
      const s = streaks[i];
      s.x = ((((s.x - s.v * dt + 3.6) % 7.2) + 7.2) % 7.2) - 3.6; // wrap within ±3.6
      m.position.set(s.x, s.y, s.z);
    });
  });
  return (
    <group ref={group}>
      {streaks.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} material={mat}>
          <boxGeometry args={[s.len, 0.018, 0.018]} />
        </mesh>
      ))}
    </group>
  );
}

/** Idle life + the "fire it up" sequence: shake, wheel spin, steering sweep. */
function Car({exploded, hovered, setHovered, fireAt}) {
  const M = useMaterials();
  const body = useRef();
  const firing = useRef(false);
  const spin = useRef(0);
  const steer = useRef(0);

  const glow = useRef();

  useFrame(({clock}, dt) => {
    const t = clock.elapsedTime;
    const since = (performance.now() - fireAt.current) / 1000;
    if (glow.current) glow.current.intensity = since >= 0 && since < 3.2 ? 5 + Math.random() * 6 : 0;
    firing.current = since >= 0 && since < 3.2;
    const targetSpin = firing.current ? 38 : 0;
    spin.current += (targetSpin - spin.current) * Math.min(1, dt * (firing.current ? 2.5 : 1.2));
    steer.current = firing.current ? 0 : Math.sin(t * 0.6) * 0.22;
    if (body.current) {
      const shake = firing.current ? 0.012 : 0;
      body.current.position.y = Math.sin(t * 2.2) * 0.008 + (Math.random() - 0.5) * shake;
      body.current.position.z = (Math.random() - 0.5) * shake;
      body.current.rotation.z = firing.current ? -0.012 : 0; // squat on launch
    }
  });

  const P = Object.fromEntries(PARTS.map((p) => [p.id, p]));
  const common = {exploded, hovered, setHovered};

  return (
    <group>
      <group ref={body}>
        <Core M={M} />
        <Part part={P.frontWing} {...common}>{() => <FrontWing M={M} />}</Part>
        <Part part={P.nose} {...common}>{() => <Nose M={M} />}</Part>
        <Part part={P.halo} {...common}>{() => <Halo M={M} />}</Part>
        <Part part={P.sidepods} {...common}>{(sides) => <Sidepods M={M} sides={sides} />}</Part>
        <Part part={P.engine} {...common}>{() => <Engine M={M} firing={firing} />}</Part>
        <Part part={P.rearWing} {...common}>{() => <RearWing M={M} firing={firing} />}</Part>
        <Part part={P.floor} {...common}>{() => <Floor M={M} firing={firing} />}</Part>
      </group>
      <Part part={P.wheels} {...common}>{(sides) => <Wheels M={M} sides={sides} spin={spin} steer={steer} />}</Part>
      <SpeedStreaks firing={firing} />
      <pointLight ref={glow} position={[-2.5, 0.45, 0]} color="#ff7a1a" intensity={0} distance={3.5} />
    </group>
  );
}

/** Writes label positions straight to DOM refs each frame (no React re-render). */
function LabelProjector({labelRefs, exploded}) {
  const {camera, size} = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    PARTS.forEach((p) => {
      const el = labelRefs.current[p.id];
      if (!el) return;
      const [ax, ay, az] = p.anchor;
      const [ex, ey, ez] = exploded ? p.explode : [0, 0, 0];
      v.set(ax + ex, ay + ey - 0.2, az + ez);
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
      el.style.opacity = exploded && v.z < 1 ? '1' : '0';
    });
  });
  return null;
}

export default function F1Scene({exploded, autoRotate, hovered, setHovered, labelRefs, running, fireAt}) {
  return (
    <Canvas
      frameloop={running ? 'always' : 'never'}
      dpr={[1, 1.5]}
      camera={{position: [4.4, 2.1, 4.6], fov: 36}}
      gl={{antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05}}
      onPointerMissed={() => setHovered(null)}>
      <Environment />
      <CameraFit />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[3, 6, 4]}
        intensity={2.2}
       
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <pointLight position={[-4, 2.2, -3]} intensity={22} color="#f5b544" distance={14} />
      <pointLight position={[3, 1.2, -4]} intensity={14} color="#6c7cff" distance={12} />
      <group position={[0, -0.2, 0]}>
        <Car exploded={exploded} hovered={hovered} setHovered={setHovered} fireAt={fireAt} />
        <SoftShadow />
        {/* turntable */}
        <mesh position={[0, -0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3.2, 96]} />
          <meshStandardMaterial color="#1b2040" roughness={0.35} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.12, 3.2, 128]} />
          <meshBasicMaterial color="#f5b544" toneMapped={false} />
        </mesh>
      </group>
      <Controls autoRotate={autoRotate} />
      <LabelProjector labelRefs={labelRefs} exploded={exploded} />
    </Canvas>
  );
}
