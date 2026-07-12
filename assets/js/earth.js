// 3D Earth with scroll-based tilt
(function() {
  var canvas = document.getElementById('earthCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var scene, camera, renderer, earth, cloud;

  function getSize() {
    var s = Math.min(window.innerWidth, window.innerHeight) * 0.42;
    return Math.max(160, Math.min(s, 420));
  }

  function init() {
    var size = getSize();
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
    camera.position.z = 4.5;

    var texLoader = new THREE.TextureLoader();

    // Earth
    var earthTex = texLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    var earthMat = new THREE.MeshPhongMaterial({
      map: earthTex,
      color: 0x4488ff,
      specular: new THREE.Color(0x222244),
      shininess: 8
    });
    earth = new THREE.Mesh(new THREE.SphereGeometry(1.3, 64, 64), earthMat);
    scene.add(earth);

    // Cloud layer
    var cloudTex = texLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
    var cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    cloud = new THREE.Mesh(new THREE.SphereGeometry(1.32, 64, 64), cloudMat);
    scene.add(cloud);

    // Lighting
    scene.add(new THREE.AmbientLight(0x404080, 0.35));
    var sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    var fill = new THREE.DirectionalLight(0x4488ff, 0.25);
    fill.position.set(-3, -1, -3);
    scene.add(fill);

    updateTilt();
    animate();
  }

  function animate() {
    requestAnimationFrame(animate);
    if (earth) earth.rotation.y += 0.0015;
    if (cloud) cloud.rotation.y += 0.0008;
    renderer.render(scene, camera);
  }

  function updateTilt() {
    if (!earth || !cloud) return;
    var scrollY = window.scrollY || window.pageYOffset;
    var maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    var progress = scrollY / maxScroll;
    var tilt = progress * 0.55;
    earth.rotation.x = tilt;
    cloud.rotation.x = tilt;
  }

  function onResize() {
    if (!renderer) return;
    var size = getSize();
    renderer.setSize(size, size);
  }

  init();
  window.addEventListener('scroll', updateTilt, { passive: true });
  window.addEventListener('resize', onResize);
})();
