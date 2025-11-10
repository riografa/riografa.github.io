import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Inicializa una escena 3D con modelo GLB
 * Basado en Three.js best practices y documentación oficial
 * @param {HTMLElement} container - Contenedor DOM
 * @param {string} modelUrl - URL del modelo GLB
 * @returns {Promise<Object>} Objetos de la escena
 */
export async function initGLBScene(container, modelUrl) {
  console.log('[GLB] Inicializando escena Three.js');
  console.log('[GLB] Modelo URL:', modelUrl);
  
  // ============================================
  // 1. CREAR ESCENA
  // ============================================
  const scene = new THREE.Scene();
  scene.background = null; // Transparente
  
  // ============================================
  // 2. CREAR RENDERER CON CONFIGURACIÓN ÓPTIMA
  // ============================================
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance' // Mejor rendimiento GPU
  });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Límite para mejor performance
  renderer.setClearColor(0x000000, 0); // Transparente
  renderer.shadowMap.enabled = true; // Activar sombras
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Sombras suaves
  
  container.appendChild(renderer.domElement);
  console.log('[GLB] ✅ Renderer creado');
  
  // ============================================
  // 3. CREAR CÁMARA
  // ============================================
  const camera = new THREE.PerspectiveCamera(
    75, // FOV
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near plane
    1000 // Far plane
  );
  camera.position.set(0, 2, 5);
  
  // ============================================
  // 4. CONTROLES ORBIT
  // ============================================
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // Suavizar movimientos
  controls.dampingFactor = 0.05;
  controls.minDistance = 1;
  controls.maxDistance = 100;
  controls.maxPolarAngle = Math.PI / 2; // No pasar por debajo del suelo
  
  console.log('[GLB] ✅ Controles configurados');
  
  // ============================================
  // 5. ILUMINACIÓN PROFESIONAL (Three.js Best Practice)
  // ============================================
  
  // Luz ambiental suave
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  // Luz direccional principal (sol)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  
  // Configuración de sombras (optimizada)
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.bias = -0.0001;
  
  scene.add(directionalLight);
  
  // Luz de relleno (fill light)
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-5, 0, -5);
  scene.add(fillLight);
  
  console.log('[GLB] ✅ Iluminación configurada');
  
  // ============================================
  // 6. CARGAR MODELO GLB
  // ============================================
  const loader = new GLTFLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      modelUrl,
      
      // onLoad - Callback cuando el modelo se carga exitosamente
      (gltf) => {
        console.log('[GLB] ✅ Modelo cargado exitosamente');
        
        const model = gltf.scene;
        
        // Habilitar sombras en todos los meshes
        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            
            // Asegurar que el material sea MeshStandardMaterial para mejores resultados
            if (!node.material) {
              node.material = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                metalness: 0.3,
                roughness: 0.7
              });
            }
          }
        });
        
        scene.add(model);
        console.log('[GLB] Modelo añadido a la escena');
        
        // ============================================
        // 7. CENTRAR Y ESCALAR MODELO
        // ============================================
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Centrar el modelo en el origen
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
        
        // Calcular escala para que el modelo sea visible
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim; // Escalar a tamaño razonable
        model.scale.setScalar(scale);
        
        // Posicionar cámara basándose en el tamaño del modelo
        const distance = maxDim * scale * 2;
        camera.position.set(distance * 0.5, distance * 0.5, distance);
        camera.lookAt(0, 0, 0);
        
        // Actualizar controles
        controls.target.set(0, 0, 0);
        controls.update();
        
        console.log('[GLB] 📏 Dimensiones:', {
          width: size.x.toFixed(2),
          height: size.y.toFixed(2),
          depth: size.z.toFixed(2),
          scale: scale.toFixed(2)
        });
        
        // ============================================
        // 8. CONFIGURAR ANIMACIONES (si existen)
        // ============================================
        let mixer = null;
        
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
          });
          
          console.log('[GLB] 🎬 Animaciones iniciadas:', gltf.animations.length);
        } else {
          console.log('[GLB] ℹ️ No hay animaciones en este modelo');
        }
        
        // ============================================
        // 9. LOOP DE ANIMACIÓN
        // ============================================
        const clock = new THREE.Clock();
        
        function animate() {
          requestAnimationFrame(animate);
          
          const delta = clock.getDelta();
          
          // Actualizar mixer de animaciones
          if (mixer) {
            mixer.update(delta);
          }
          
          // Actualizar controles
          controls.update();
          
          // Renderizar escena
          renderer.render(scene, camera);
        }
        
        // Iniciar loop
        animate();
        console.log('[GLB] ✅ Loop de animación iniciado');
        
        // ============================================
        // 10. MANEJO DE RESIZE
        // ============================================
        function onWindowResize() {
          const width = window.innerWidth;
          const height = window.innerHeight;
          
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          
          renderer.setSize(width, height);
        }
        
        window.addEventListener('resize', onWindowResize, false);
        
        // ============================================
        // 11. RESOLVER PROMESA
        // ============================================
        resolve({
          scene,
          camera,
          renderer,
          controls,
          mixer,
          model,
          animations: gltf.animations,
          dispose: () => {
            console.log('[GLB] Limpiando recursos...');
            
            // Limpiar geometrías y materiales
            model.traverse((node) => {
              if (node.isMesh) {
                if (node.geometry) node.geometry.dispose();
                if (node.material) {
                  if (Array.isArray(node.material)) {
                    node.material.forEach(material => material.dispose());
                  } else {
                    node.material.dispose();
                  }
                }
              }
            });
            
            // Limpiar renderer
            renderer.dispose();
            
            // Limpiar controles
            controls.dispose();
            
            // Detener animaciones
            if (mixer) {
              mixer.stopAllAction();
            }
            
            // Remover event listeners
            window.removeEventListener('resize', onWindowResize);
            
            console.log('[GLB] ✅ Recursos liberados');
          }
        });
      },
      
      // onProgress - Callback de progreso
      (xhr) => {
        if (xhr.lengthComputable) {
          const percentComplete = (xhr.loaded / xhr.total * 100).toFixed(1);
          console.log(`[GLB] 📥 Cargando: ${percentComplete}%`);
        }
      },
      
      // onError - Callback de error
      (error) => {
        console.error('[GLB] ❌ Error al cargar modelo');
        console.error('[GLB] URL intentada:', modelUrl);
        console.error('[GLB] Error:', error);
        
        reject(new Error(`Error al cargar modelo 3D: ${error.message || 'Desconocido'}`));
      }
    );
  });
}
