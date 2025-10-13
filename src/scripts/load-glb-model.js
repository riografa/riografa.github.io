// src/scripts/load-glb-model.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export async function initGLBScene(container, modelPath) {
  if (!container) {
    throw new Error('Container element is required');
  }

  console.log('[load-glb-model] initGLBScene called. container size:', container.clientWidth, container.clientHeight, 'modelPath:', modelPath);

  // Configuración de la escena
  const scene = new THREE.Scene();
  
  // Configuración de la cámara
  const camera = new THREE.PerspectiveCamera(
    45, // Field of view
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 5); // Ajusta según tu modelo
  
  // Configuración del renderer
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true // Fondo transparente
  });
  const width = Math.max(1, container.clientWidth);
  const height = Math.max(1, container.clientHeight);
  if (width === 1 || height === 1) {
    console.warn('[load-glb-model] container size is very small; canvas may render at 1px. width/height:', width, height);
  }
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // Transparente
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Controles (opcional)
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  // desactivar autoRotate por defecto (el usuario pidió que no rote)
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0;

  // Iluminación esencial para ver el modelo
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-5, 3, -5);
  scene.add(directionalLight2);

  // Variables para el modelo
  let model = null;
  let mixer = null;
  
  // Cargar el modelo GLB
  const loader = new GLTFLoader();
  
  try {
    const gltf = await loader.loadAsync(modelPath);
    model = gltf.scene;
    
    // Centrar el modelo
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  // Trasladamos el modelo para que su centro quede en el origen
  model.position.sub(center);
    
    // Escalar el modelo si es necesario
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim; // Ajusta el 2 según necesites
    model.scale.multiplyScalar(scale);
    
    scene.add(model);
    // --- Ajustar cámara y controles para que el modelo quede centrado en el contenedor ---
    // Recalcular caja y esfera después de centrar y escalar
    const boxAfter = new THREE.Box3().setFromObject(model);
    const sphere = boxAfter.getBoundingSphere(new THREE.Sphere());
    const radius = sphere.radius;
    // Calcular distancia de cámara adecuada según FOV para que el modelo quepa
    const fov = camera.fov * (Math.PI / 180);
    // distancia mínima para que la esfera quepa en la vista (con un margen)
    const distance = radius / Math.sin(fov / 2) * 1.2;
    // Usar el centro de la esfera para posicionar la cámara y el target
    const centerVec = sphere.center.clone();
    // Colocar la cámara en Z respecto al centro calculado
    camera.position.set(centerVec.x, centerVec.y, centerVec.z + distance);
    camera.lookAt(centerVec);
    // Asegurar que los controles tengan el target en el centro del modelo
    if (controls) {
      controls.target.copy(centerVec);
      controls.update();
    }
    
    // Si el modelo tiene animaciones
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(model);
      // Por defecto reproducir la primera animación
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
    }
    
    console.log('Modelo cargado exitosamente', gltf);
  } catch (error) {
    console.error('[load-glb-model] Error al cargar el modelo:', error);
    // Propagar el error para que el llamante pueda manejarlo y mostrar mensajes en UI
    throw error;
  }

  // Función de animación
  const clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    // Actualizar animaciones si existen
    if (mixer) {
      mixer.update(delta);
    }
    
    // Animación procedural: el zoom (scale) lo manejamos con un tween temporal, no aquí
    
    renderer.render(scene, camera);
  }
  
  // Manejar redimensionamiento
  function handleResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  
  window.addEventListener('resize', handleResize);
  
  // Iniciar la animación
  animate();

  // --- Animación de 'zoom' al cargar: aumentar escala durante 2s ---
  // Parámetros del zoom: ajustar targetScaleMultiplier para que se vea más grande
  const targetScaleMultiplier = 1.6; // cuánto multiplicar la escala actual
  const zoomDuration = 2.0; // segundos
  if (model) {
    const initialScale = model.scale.clone();
    const finalScale = initialScale.clone().multiplyScalar(targetScaleMultiplier);
    let zoomStart = performance.now();
    const zoomTick = (now) => {
      const t = Math.min(1, (now - zoomStart) / (zoomDuration * 1000));
      // interpolación suave (easeOutQuad)
      const eased = 1 - (1 - t) * (1 - t);
      model.scale.set(
        initialScale.x + (finalScale.x - initialScale.x) * eased,
        initialScale.y + (finalScale.y - initialScale.y) * eased,
        initialScale.z + (finalScale.z - initialScale.z) * eased
      );
      if (t < 1) {
        requestAnimationFrame(zoomTick);
      } else {
        console.log('[load-glb-model] Zoom animation completed');
      }
    };
    requestAnimationFrame(zoomTick);
  }
  
  // Retornar función de limpieza y referencias
  return {
    scene,
    camera,
    renderer,
    model,
    mixer,
    dispose: () => {
      window.removeEventListener('resize', handleResize);
      try {
        renderer.dispose();
      } catch (e) {
        console.warn('[load-glb-model] renderer.dispose error', e);
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      // Limpiar geometrías y materiales
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }
  };
}
