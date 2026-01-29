// three-3d.js - Lightweight Three.js hero with 3D rotating earth and objects
// Assumes THREE is loaded globally via script tag

let scene, camera, renderer, earth, objectsGroup, animationId;

export function init3DHero(containerId = 'hero-3d') {
  const container = document.getElementById(containerId);
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
  camera.position.set(0, 0, 6);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Ambient lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // Earth sphere (simple material)
  const earthGeo = new THREE.SphereGeometry(1.6, 64, 64);
  const earthMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    metalness: 0.1,
    roughness: 0.9,
    transparent: true,
    opacity: 0.95
  });
  earth = new THREE.Mesh(earthGeo, earthMat);
  scene.add(earth);

  // Objects group
  objectsGroup = new THREE.Group();
  scene.add(objectsGroup);

  // Add some placeholder objects
  const boxGeom = new THREE.BoxGeometry(0.35, 0.2, 0.02);
  const phoneMat = new THREE.MeshStandardMaterial({ color: 0x10b981 });
  const laptopMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
  const batteryMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });

  const phone = new THREE.Mesh(boxGeom, phoneMat);
  phone.position.set(2.2, 0.25, 0);
  phone.rotation.set(0, 0, -0.7);
  objectsGroup.add(phone);

  const laptop = new THREE.Mesh(boxGeom, laptopMat);
  laptop.position.set(-2, 0.4, 0);
  laptop.rotation.set(0.1, 0.6, 0);
  objectsGroup.add(laptop);

  const battery = new THREE.Mesh(boxGeom, batteryMat);
  battery.position.set(0, -2.1, 0);
  objectsGroup.add(battery);

  // Window resize handling
  window.addEventListener('resize', onWindowResize);

  // Pointer interaction
  container.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    gsapToRotation(x, y);
  });

  animate();

  function gsapToRotation(x, y) {
    if (!earth) return;
    const rotY = x * 0.4;
    const rotX = y * 0.25;
    if (typeof gsap !== 'undefined') {
      gsap.to(earth.rotation, { x: rotX, y: rotY, duration: 0.6 });
      gsap.to(objectsGroup.rotation, { x: -rotX * 0.1, y: -rotY * 0.2, duration: 0.8 });
    } else {
      earth.rotation.x = rotX;
      earth.rotation.y = rotY;
      objectsGroup.rotation.x = -rotX * 0.1;
      objectsGroup.rotation.y = -rotY * 0.2;
    }
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    // Basic rotation
    earth.rotation.y += 0.002;
    objectsGroup.children.forEach((o, i) => {
      o.rotation.z += 0.005 + i * 0.003;
      // orbit around earth
      const t = Date.now() * 0.0003 + i;
      o.position.x = Math.cos(t) * (2 + i * 0.5);
      o.position.y = Math.sin(t * 1.2) * (1.3 + i * 0.2);
    });

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

}

// Additional scene showing 3D recycling components (interactive)
export function initRecycle3D(containerId = 'recycle-3d') {
  const container = document.getElementById(containerId);
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth;
  const height = container.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
  camera.position.set(0, 0, 8);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambient);
  const light = new THREE.DirectionalLight(0xffffff, 0.4);
  light.position.set(5, 5, 5);
  scene.add(light);

  const group = new THREE.Group();
  scene.add(group);

  // Add sample objects — stylized battery, phone, laptop
  const shapes = [];
  const geomPhone = new THREE.BoxGeometry(0.6, 1.2, 0.06);
  const geomLaptop = new THREE.BoxGeometry(1.6, 1, 0.06);
  const geomBattery = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 16);

  const matPhone = new THREE.MeshStandardMaterial({ color: 0x7c3aed });
  const matLaptop = new THREE.MeshStandardMaterial({ color: 0x06b6d4 });
  const matBattery = new THREE.MeshStandardMaterial({ color: 0xf97316 });

  const phone = new THREE.Mesh(geomPhone, matPhone);
  phone.position.set(-2.4, 0, 0);
  group.add(phone);
  shapes.push(phone);

  const laptop = new THREE.Mesh(geomLaptop, matLaptop);
  laptop.position.set(0, 0.5, 0);
  group.add(laptop);
  shapes.push(laptop);

  const battery = new THREE.Mesh(geomBattery, matBattery);
  battery.position.set(2.4, 0, 0);
  group.add(battery);
  shapes.push(battery);

  // Add subtle rotation and hover interaction
  container.addEventListener('pointermove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    group.rotation.y = x * 0.3;
    group.rotation.x = y * 0.2;
  });

  function animate() {
    requestAnimationFrame(animate);
    shapes.forEach((s, i) => { s.rotation.y += 0.01 + i * 0.005; });
    renderer.render(scene, camera);
  }
  animate();
}

// Auto-initialize on DOM load if container exists
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('hero-3d');
  if (el) init3DHero('hero-3d');
  const el2 = document.getElementById('recycle-3d');
  if (el2) initRecycle3D('recycle-3d');
});
