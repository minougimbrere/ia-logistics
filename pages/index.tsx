
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';

const Home = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- CONFIGURATION ---
    const USPs = [
        { title: "Premium Fleet", desc: "Our 15 trucks are maintained to the highest standards, ensuring safety and reliability on every mile." },
        { title: "Expert Drivers", desc: "Our drivers are vetted professionals who treat your cargo with the respect it deserves." },
        { title: "Trust & Credibility", desc: "Decades of experience at Schiphol have built a reputation that stands as solid as concrete." },
        { title: "Proactive Comms", desc: "We don't just deliver; we keep you informed. Real-time updates mean no surprises." },
        { title: "Passion for Logistics", desc: "This isn't just a job. We live and breathe supply chain solutions." },
        { title: "Service Excellence", desc: "From pickup to drop-off, our service layer is as smooth as our driving." }
    ];
    const USP_COUNT = USPs.length;
    const CAROUSEL_DURATION = 4000; // 4 seconds per USP

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(55, 45, 55); 
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.SoftShadowMap;
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.minDistance = 25;
    controls.maxDistance = 120;
    controls.autoRotate = false;

    // --- LIGHTING ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(50, 80, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    const d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0001;
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0xffa95c, 2);
    spotLight.position.set(-50, 40, -20);
    spotLight.lookAt(0, 0, 0);
    scene.add(spotLight);

    // --- MATERIALS ---
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x7cbd6b, roughness: 1, flatShading: true });
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 1, flatShading: true });
    const tarmacMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 });
    const paintMat = new THREE.MeshPhysicalMaterial({ color: 0xeeeeee, metalness: 0.1, roughness: 0.2 });
    const windowMat = new THREE.MeshPhysicalMaterial({ color: 0x88ccff, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 0.7 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });

    // --- FLOATING ISLAND ---
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    const radius = 35;
    const islandGeo = new THREE.CylinderGeometry(radius, radius, 3, 6);
    const islandMesh = new THREE.Mesh(islandGeo, grassMat);
    islandMesh.position.y = -1.5;
    islandMesh.receiveShadow = true;
    islandGroup.add(islandMesh);

    const soilGeo = new THREE.CylinderGeometry(radius - 0.5, radius * 0.2, 12, 6);
    const soilMesh = new THREE.Mesh(soilGeo, soilMat);
    soilMesh.position.y = -9;
    islandGroup.add(soilMesh);

    const tarmacGeo = new THREE.BoxGeometry(45, 0.1, 40);
    const tarmacMesh = new THREE.Mesh(tarmacGeo, tarmacMat);
    tarmacMesh.position.set(0, 0.1, 0);
    tarmacMesh.receiveShadow = true;
    islandGroup.add(tarmacMesh);

    const lineGeo = new THREE.PlaneGeometry(1, 4);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for(let i=0; i<4; i++) {
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI/2;
        line.position.set(15, 0.2, -10 + i * 8);
        islandGroup.add(line);
    }

    // --- ENVIRONMENT ASSETS ---
    function createTree(x: number, z: number) {
        const treeGroup = new THREE.Group();
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.8, 2, 6),
            new THREE.MeshStandardMaterial({ color: 0x5d4037 })
        );
        trunk.position.y = 1;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        const foliage = new THREE.Mesh(
            new THREE.ConeGeometry(3, 6, 8),
            new THREE.MeshStandardMaterial({ color: 0x4caf50, flatShading: true })
        );
        foliage.position.y = 4;
        foliage.castShadow = true;
        treeGroup.add(foliage);
        treeGroup.position.set(x, 0, z);
        return treeGroup;
    }
    islandGroup.add(createTree(-25, -20));
    islandGroup.add(createTree(-28, -15));
    islandGroup.add(createTree(25, 20));
    islandGroup.add(createTree(28, 15));
    islandGroup.add(createTree(-20, 25));

    // --- BUILDINGS ---
    const towerGroup = new THREE.Group();
    const tBase = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.5, 22, 8), new THREE.MeshStandardMaterial({color: 0xe0e0e0}));
    tBase.position.y = 11;
    tBase.castShadow = true;
    towerGroup.add(tBase);
    const tCab = new THREE.Mesh(new THREE.CylinderGeometry(5, 3, 4, 8), new THREE.MeshStandardMaterial({color: 0x333333}));
    tCab.position.y = 23;
    tCab.castShadow = true;
    towerGroup.add(tCab);
    const tWin = new THREE.Mesh(new THREE.CylinderGeometry(5.1, 3.1, 1.5, 8), windowMat);
    tWin.position.y = 23;
    towerGroup.add(tWin);
    towerGroup.position.set(-15, 0, -15);
    islandGroup.add(towerGroup);

    const termGeo = new THREE.BoxGeometry(22, 8, 12);
    const termMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const terminal = new THREE.Mesh(termGeo, termMat);
    terminal.position.set(8, 4, -18);
    terminal.castShadow = true;
    islandGroup.add(terminal);
    const glassFront = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 1), windowMat);
    glassFront.position.set(8, 4, -12.4);
    islandGroup.add(glassFront);

    // --- VEHICLES ---
    function createTruck(color: number, id: number) {
        const truckGroup = new THREE.Group();
        truckGroup.userData = { id: id, isInteractive: id < USP_COUNT }; 
        const carPaint = new THREE.MeshPhysicalMaterial({ 
            color: color, 
            metalness: 0.4, 
            roughness: 0.3,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2, 0.6, 4.2), darkMat);
        chassis.position.y = 0.6;
        chassis.castShadow = true;
        truckGroup.add(chassis);
        const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.5), carPaint);
        cab.position.set(0, 1.8, 1.35);
        cab.castShadow = true;
        truckGroup.add(cab);
        const wind = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), windowMat);
        wind.position.set(0, 2.1, 2.11);
        wind.rotation.x = -0.1;
        truckGroup.add(wind);
        const headLightGeo = new THREE.BoxGeometry(0.4, 0.2, 0.1);
        const headLightMat = new THREE.MeshStandardMaterial({ color: 0xffffee, emissive: 0xffffee, emissiveIntensity: 0.5 });
        const hlL = new THREE.Mesh(headLightGeo, headLightMat);
        hlL.position.set(-0.5, 1.2, 2.1);
        truckGroup.add(hlL);
        const hlR = new THREE.Mesh(headLightGeo, headLightMat);
        hlR.position.set(0.5, 1.2, 2.1);
        truckGroup.add(hlR);
        const trailerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
        const trailer = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2.3, 4.5), trailerMat);
        trailer.position.set(0, 2.0, -1.6);
        trailer.castShadow = true;
        truckGroup.add(trailer);
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 3.5), carPaint);
        stripe.position.set(0, 2.0, -1.6);
        truckGroup.add(stripe);
        const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
        const positions = [
            [-1, 0.45, 1.6], [1, 0.45, 1.6], 
            [-1, 0.45, -0.5], [1, 0.45, -0.5], 
            [-1, 0.45, -2.5], [1, 0.45, -2.5] 
        ];
        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos[0], pos[1], pos[2]);
            wheel.castShadow = true;
            truckGroup.add(wheel);
        });
        if (id < USP_COUNT) {
            const markerGroup = new THREE.Group();
            markerGroup.position.set(0, 4.5, 0);
            markerGroup.userData = { isMarker: true };
            const orb = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), glowMat);
            markerGroup.add(orb);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 8, 32), glowMat);
            ring.rotation.x = Math.PI / 2;
            markerGroup.add(ring);
            truckGroup.add(markerGroup);
        }
        return truckGroup;
    }

    // --- FLEET GENERATION ---
    const trucks: THREE.Group[] = [];
    const truckBlue = 0x1a5f7a;
    let truckCount = 0;
    const startX = -10;
    const startZ = -2;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 5; col++) {
            if (truckCount >= 15) break;
            const truck = createTruck(truckBlue, truckCount);
            truck.position.set(startX + (col * 5), 0, startZ + (row * 8));
            truck.rotation.y = -Math.PI / 4;
            islandGroup.add(truck);
            trucks.push(truck);
            truckCount++;
        }
    }
    
    // --- CAROUSEL LOGIC ---
    let currentUSPIndex = 0;
    let carouselInterval: any = null;
    const cardContainer = document.getElementById('card-container');
    const cardTitle = document.getElementById('card-title');
    const cardDesc = document.getElementById('card-desc');

    function updateUSPDisplay(index: number) {
        if (!cardContainer || !cardTitle || !cardDesc) return;
        trucks.slice(0, USP_COUNT).forEach(t => gsap.to(t.scale, { x: 1, y: 1, z: 1, duration: 0.3 }));
        const activeTruck = trucks[index];
        if (!activeTruck) return;
        gsap.to(activeTruck.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.4, ease: "back.out(1.7)" });
        const data = USPs[index];
        cardTitle.innerText = data.title;
        cardDesc.innerText = data.desc;
        cardContainer.classList.add('active');
        const vector = activeTruck.position.clone();
        vector.y += 5;
        vector.project(camera);
        const x = (vector.x * .5 + .5) * window.innerWidth;
        const y = (-(vector.y * .5) + .5) * window.innerHeight;
        cardContainer.style.left = `${x}px`;
        cardContainer.style.top = `${y}px`;
        const offset = new THREE.Vector3(12, 12, 12);
        const targetPos = activeTruck.position.clone().add(offset); 
        gsap.to(camera.position, {
            x: targetPos.x, y: targetPos.y, z: targetPos.z,
            duration: 1.5, ease: "power2.out"
        });
        gsap.to(controls.target, {
            x: activeTruck.position.x, y: activeTruck.position.y, z: activeTruck.position.z,
            duration: 1.5
        });
    }
    
    function startCarousel() {
        updateUSPDisplay(currentUSPIndex);
        carouselInterval = setInterval(() => {
            currentUSPIndex = (currentUSPIndex + 1) % USP_COUNT;
            updateUSPDisplay(currentUSPIndex);
        }, CAROUSEL_DURATION);
    }

    // --- ANIMATIONS & FLUFF ---
    const clouds: THREE.Group[] = [];
    function createCloud() {
        const cloudGroup = new THREE.Group();
        const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        const p1 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), cloudMat);
        const p2 = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), cloudMat);
        const p3 = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), cloudMat);
        p1.position.x = -1.5;
        p2.position.y = 0.5;
        p3.position.x = 1.5;
        cloudGroup.add(p1, p2, p3);
        return cloudGroup;
    }
    for(let i=0; i<6; i++) {
        const cloud = createCloud();
        const angle = Math.random() * Math.PI * 2;
        const dist = 30 + Math.random() * 20;
        cloud.position.set(Math.cos(angle) * dist, 15 + Math.random() * 10, Math.sin(angle) * dist);
        cloud.userData = { speed: 0.002 + Math.random() * 0.002, angle: angle, dist: dist };
        scene.add(cloud);
        clouds.push(cloud);
    }

    const planeGroup = new THREE.Group();
    const fuselageMat = new THREE.MeshStandardMaterial({color: 0xffffff});
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 4, 8), fuselageMat);
    fuselage.rotation.z = Math.PI / 2;
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), fuselageMat);
    nose.position.x = 2;
    const tailEnd = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), fuselageMat);
    tailEnd.position.x = -2;
    const planeWings = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 6), new THREE.MeshStandardMaterial({color: 0x1a5f7a}));
    planeWings.position.y = 0.2;
    const planeTail = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.1), new THREE.MeshStandardMaterial({color: 0x1a5f7a}));
    planeTail.position.set(-1.5, 0.8, 0);
    planeGroup.add(fuselage, nose, tailEnd, planeWings, planeTail);
    planeGroup.position.set(0, 30, 0);
    scene.add(planeGroup);

    // --- INTERACTION LOGIC ---
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
    gsap.from(camera.position, { y: 100, x: 100, z: 100, duration: 2.5, ease: "power3.out", onComplete: startCarousel });

    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (cardContainer && cardContainer.classList.contains('active')) {
            const tempIndex = currentUSPIndex;
            updateUSPDisplay(tempIndex); 
        }
    };
    window.addEventListener('resize', handleResize);

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();
    const animate = () => {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        controls.update();
        islandGroup.position.y = Math.sin(time * 0.5) * 0.5;
        trucks.forEach((truck, i) => {
            if (!truck.userData.originalY) truck.userData.originalY = truck.position.y;
            truck.position.y = truck.userData.originalY + Math.sin(time * 20 + i) * 0.005;
            truck.children.forEach(child => {
                if (child.userData.isMarker) {
                    child.position.y = 4.5 + Math.sin(time * 2 + i) * 0.3;
                    child.rotation.y += 0.02;
                }
            });
        });
        clouds.forEach(cloud => {
            cloud.userData.angle += cloud.userData.speed;
            cloud.position.x = Math.cos(cloud.userData.angle) * cloud.userData.dist;
            cloud.position.z = Math.sin(cloud.userData.angle) * cloud.userData.dist;
            cloud.lookAt(0, cloud.position.y, 0);
        });
        const planeSpeed = time * 0.5;
        planeGroup.position.x = Math.cos(planeSpeed) * 35;
        planeGroup.position.z = Math.sin(planeSpeed) * 35;
        planeGroup.rotation.y = -planeSpeed;
        planeGroup.rotation.z = -Math.PI / 6;
        renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      if(carouselInterval) {
        clearInterval(carouselInterval)
      }
    };
  }, []);

  return (
    <div ref={mountRef}>
      <div id="loader">Assembling Fleet...</div>
      <div id="ui-layer">
        <h1>Logistics Hub</h1>
        <p className="subtitle">Schiphol Headquarters</p>
      </div>
      <div id="card-container" className="info-card">
        <h3 id="card-title">Title</h3>
        <p id="card-desc">Description goes here.</p>
      </div>
      <style jsx global>{`
        body { margin: 0; overflow: hidden; font-family: 'Segoe UI', sans-serif; background: linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 100%); }
        #ui-layer { position: absolute; top: 30px; left: 30px; color: #1a5f7a; pointer-events: none; z-index: 10; }
        h1 { margin: 0; font-size: 3rem; font-weight: 800; letter-spacing: -1px; text-transform: uppercase; text-shadow: 2px 2px 0px rgba(255,255,255,0.5); }
        p.subtitle { margin: 5px 0 0 0; font-size: 1.2rem; font-weight: 600; background: white; display: inline-block; padding: 5px 15px; border-radius: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .info-card {
            position: absolute;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 25px;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.5);
            width: 300px;
            display: block; 
            opacity: 0;
            transform: translate(-50%, -100%) scale(0.8);
            pointer-events: none;
            z-index: 100;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .info-card.active { opacity: 1; transform: translate(-50%, -100%) scale(1); }
        .info-card h3 { color: #1a5f7a; margin: 0 0 10px 0; font-size: 1.4rem; font-weight: 800; }
        .info-card p { color: #4a5568; margin: 0; line-height: 1.6; font-size: 0.95rem; }
        .info-card::after {
            content: ''; position: absolute; bottom: -12px; left: 50%; 
            transform: translateX(-50%); border-width: 12px 12px 0; 
            border-style: solid; border-color: rgba(255,255,255,0.95) transparent transparent transparent;
        }
        #loader {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #1a5f7a; color: white; display: flex; 
            justify-content: center; align-items: center; z-index: 200;
            font-size: 2rem; font-weight: bold; transition: opacity 0.5s;
        }
      `}</style>
    </div>
  );
};

export default Home;
