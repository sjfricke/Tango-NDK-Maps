var camera, scene, renderer;
var clock = new THREE.Clock();
var tick = 0;
var controls, container, points, container, stats;

init();
animate();

function init() {
    
    // creates canavs and scene
    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera( 27, window.innerWidth / window.innerHeight, 5, 3500 );
    camera.position.z = 1000;
    
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
    
    
    addParticles(
        {
            particles : 500000,
            color : { r : 1, g : 0, b : 0 },
            size : 1
        }
    );
        
    // Render Setup
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    // stats for FPS
    stats = new Stats();
    container.appendChild( stats.dom );    
        
    // Mouse movement setup
    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 5.0;
    controls.zoomSpeed = 2.2;
    controls.panSpeed = 1;
    controls.dynamicDampingFactor = 0.3;
    
    // resize window
    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    
    requestAnimationFrame( animate );
    
    // updates mouse movements
    controls.update();
    
    render();
    stats.update();
}

function render() {
    renderer.render( scene, camera );
}

function addParticles(data) {
    var particles = data.particles;
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array( particles * 3 );
    var colors = new Float32Array( particles * 3 );
    var color = new THREE.Color();
    
    var n = 400, n2 = n / 2; // particles spread in the cube
    for ( var i = 0; i < positions.length; i += 3 ) {
        // positions
        var x = Math.random() * n - n2;
        var y = Math.random() * n - n2;
        var z = Math.random() * n - n2;
        positions[ i ]     = x;
        positions[ i + 1 ] = y;
        positions[ i + 2 ] = z;
        // colors        
        colors[ i ]     = data.color.r;
        colors[ i + 1 ] = data.color.g;
        colors[ i + 2 ] = data.color.b;
    }    
    
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
    geometry.computeBoundingSphere();
    
    
    var material = new THREE.PointsMaterial( { size: data.size, vertexColors: THREE.VertexColors } );
    points = new THREE.Points( geometry, material );
    scene.add( points );
}