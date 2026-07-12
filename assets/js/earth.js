// 3D Earth with scroll-based rotation
(function() {
  var canvas = document.getElementById('earthCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var scene, camera, renderer, earth, cloud;
  var mouseX = 0, mouseY = 0;

  function getSize() {
    var s = Math.min(window.innerWidth, window.innerHeight) * 0.32;
    return Math.max(120, Math.min(s, 380));
  }

  function init() {
    var size = getSize();
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(25, 1, 0.1, 1000);
    camera.position.z = 4.5;

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);

    // Earth
    var texLoader = new THREE.TextureLoader();
    var earthTex = texLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');

    var geo = new THREE.SphereGeometry(1.2, 48, 48);
    var mat = new THREE.MeshPhongMaterial({
      map: earthTex,
      color: 0x4488ff,
      specular: new THREE.Color(0x333333),
      shininess: 5
    });
    earth = new THREE.Mesh(geo, mat);
    scene.add(earth);

    // Cloud layer (slightly larger, transparent, slower rotation)
    var cloudTex = texLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');

    var cloudGeo = new THREE.SphereGeometry(1.22, 48, 48);
    var cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    cloud = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloud);

    // Lighting
    var ambient = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambient);

    var sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 3, 5);
    scene.add(sun);

    var fill = new THREE.DirectionalLight(0x4488ff, 0.3);
    fill.position.set(-3, -1, -3);
    scene.add(fill);

    animate();
  }

  function animate() {
    requestAnimationFrame(animate);

    // Auto-rotation (spin)
    var now = Date.now() * 0.0001;
    if (earth) earth.rotation.y += 0.001;
    if (cloud) cloud.rotation.y += 0.0006;

    renderer.render(scene, camera);
  }

  function updateTilt() {
    if (!earth || !cloud) return;

    var scrollY = window.scrollY || window.pageYOffset;
    var maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    var progress = scrollY / maxScroll; // 0 at top, 1 at bottom

    // Map scroll to X rotation: 0→0, 1→~30 degrees
    var tilt = progress * 0.5;
    earth.rotation.x = tilt;
    cloud.rotation.x = tilt;
  }

  function onResize() {
    if (!renderer) return;
    var size = getSize();
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    renderer.setSize(size, size);
  }

  init();
  updateTilt();

  window.addEventListener('scroll', updateTilt, { passive: true });
  window.addEventListener('resize', onResize);
})();
