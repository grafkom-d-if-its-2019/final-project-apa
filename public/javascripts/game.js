import * as THREE from '/javascripts/three.module.js';
import {GLTFLoader} from '/javascripts/GLTFLoader.js';
// import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/controls/OrbitControls.js';
window.onload=function(){
    
    var sceneWidth;
    var sceneHeight;
    var camera;
    var scene;
    var renderer;
    var dom;
    var sun;
    var ground;
    //var orbitControl;
    var rollingGroundSphere;
    var rollingSpeed=0.008;
    var heroRollingSpeed;
    var worldRadius=26;
    var heroRadius=0.2;
    var sphericalHelper;
    var pathAngleValues;
    var heroBaseY=2.3;
    var gravity=0.005;
    var leftLane=-1;
    var rightLane=1;
    var middleLane=0;
    var clock;
    var treeReleaseInterval=0.5;
    var lastTreeReleaseTime=0;
    var treesInPath;
    var treesPool;
    var particleGeometry;
    var particleCount=20;
    var explosionPower =1.06;
    var particles;
    //var stats;
    var scoreText;
    var score;
    var hasCollided;
    var hasCollided2;
    var heroSphere;
    var heroSphere2;
    var currentLane;
    var currentLane2;
    var bounceValue=0.1;
    var bounceValue2=0.1;
    var jumping;
    var sliding;
    var jumping2;
    var sliding2;
    var mixer;
    var mixer2;
    var speed = 0.03;
    var speed2 = 0.03;
    
    init();
    
    function init() {
        // set up the scene
        createScene();
        
        //call game loop
        update();
    }
    
    function createScene(){
        hasCollided=false;
        hasCollided2=false;
        score=0;
        treesInPath=[];
        treesPool=[];
        clock=new THREE.Clock();
        clock.start();
        heroRollingSpeed=(rollingSpeed*worldRadius/heroRadius)/5;
        sphericalHelper = new THREE.Spherical();
        pathAngleValues=[1.52,1.57,1.62];
        sceneWidth=window.innerWidth-(window.innerWidth*1.5/100);
        sceneHeight=window.innerHeight-(window.innerHeight*3/100);
        scene = new THREE.Scene();//the 3d scene
        camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
        renderer = new THREE.WebGLRenderer({alpha:true}); //renderer with transparent backdrop
        renderer.setClearColor(0xfffafa, 1); 
        renderer.shadowMap.enabled = true;//enable shadow
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize( sceneWidth, sceneHeight );
        dom = document.getElementById('TutContainer');
        dom.appendChild(renderer.domElement);
        
        const loader = new THREE.TextureLoader();
        const bgTexture = loader.load('/images/forest.jpg');
        scene.background = bgTexture;
        //stats = new Stats();
        //dom.appendChild(stats.dom);
        createTreesPool();
        addWorld();
        addHero();
        addLight();
        addExplosion();
        
        camera.position.z = 7.5;
        camera.position.y = 3.0;
        
        window.addEventListener('resize', onWindowResize, false); //resize callback
        
        scoreText = document.createElement('div');
        scoreText.style.position = 'absolute';
        //text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
        scoreText.style.width = 100;
        scoreText.style.height = 100;
        //scoreText.style.backgroundColor = "blue";
        scoreText.innerHTML = "0";
        scoreText.style.top = 50 + 'px';
        scoreText.style.left = 10 + 'px';
        document.body.appendChild(scoreText);
        
        var infoText = document.createElement('div');
        infoText.style.position = 'absolute';
        infoText.style.width = 100;
        infoText.style.height = 100;
        infoText.style.backgroundColor = "yellow";
        infoText.innerHTML = "UP - Jump, Left/Right - Move";
        infoText.style.top = 10 + 'px';
        infoText.style.left = 10 + 'px';
        document.body.appendChild(infoText);
    }
    function addExplosion(){
        particleGeometry = new THREE.Geometry();
        for (var i = 0; i < particleCount; i ++ ) {
            var vertex = new THREE.Vector3();
            particleGeometry.vertices.push( vertex );
        }
        var pMaterial = new THREE.ParticleBasicMaterial({
            color: 0xfffafa,
            size: 0.2
        });
        particles = new THREE.Points( particleGeometry, pMaterial );
        scene.add( particles );
        particles.visible=false;
    }
    function createTreesPool(){
        var maxTreesInPool=10;
        var newTree;
        for(var i=0; i<maxTreesInPool;i++){
            newTree=boxObstacle();
            treesPool.push(newTree);
        }
    }
    var socket = io();
    socket.on('action', function(data){
        hasCollided = false;
        hasCollided2 = false;
        score = -1;
        currentLane=middleLane;
        jumping = true
    });
    socket.on('gamemovement', function(data){
        if(data.player == 1){
            if(jumping)return;
            var validMove=true;
            if ( data.movement === 37) {//left
                if(currentLane==middleLane){
                    currentLane=leftLane;
                }else if(currentLane==rightLane){
                    currentLane=middleLane;
                }else{
                    validMove=false;	
                }
            } else if ( data.movement === 39) {//right
                if(currentLane==middleLane){
                    currentLane=rightLane;
                }else if(currentLane==leftLane){
                    currentLane=middleLane;
                }else{
                    validMove=false;	
                }
            }else{
                if ( data.movement === 38){//up, jump
                    bounceValue=0.1;
                    jumping=true;
                    speed=0.01;
                }
                validMove=false;
            }
            if(validMove){
                jumping=true;
                bounceValue=0.06;
            }
        }else if(data.player == 2){
            if(jumping2)return;
            var validMove2=true;
            if ( data.movement === 37) {//left
                if(currentLane2==middleLane){
                    currentLane2=leftLane;
                }else if(currentLane2==rightLane){
                    currentLane2=middleLane;
                }else{
                    validMove2=false;	
                }
            } else if ( data.movement === 39) {//right
                if(currentLane2==middleLane){
                    currentLane2=rightLane;
                }else if(currentLane2==leftLane){
                    currentLane2=middleLane;
                }else{
                    validMove2=false;	
                }
            }else{
                if ( data.movement === 38){//up, jump
                    bounceValue2=0.1;
                    jumping2=true;
                    speed2=0.01;
                }
                validMove2=false;
            }
            if(validMove2){
                jumping2=true;
                bounceValue2=0.06;
            }
        }
    });
    function addHero(){
        const gltfLoader = new GLTFLoader();
        gltfLoader.load('/models/StickMan_0.glb', (gltf) => {
            heroSphere2 = gltf.scene;
            scene.add(heroSphere2);
            heroSphere2.position.y=heroBaseY;
            heroSphere2.position.z=4.8;
            currentLane2=middleLane;
            heroSphere2.rotation.y = Math.PI;
            heroSphere2.position.x=currentLane2;
            heroSphere2.scale.set(0.25,0.25,0.25);
            mixer2 = new THREE.AnimationMixer(heroSphere2);
            mixer2.clipAction(gltf.animations[0]).play();
            
        });
        gltfLoader.load('./models/StickMan_0.glb', (gltf) => {
            heroSphere = gltf.scene;
            scene.add(heroSphere);
            heroSphere.position.y=heroBaseY;
            heroSphere.position.z=4.8;
            currentLane=middleLane;
            heroSphere.rotation.y = Math.PI;
            heroSphere.position.x=currentLane;
            heroSphere.scale.set(0.25,0.25,0.25);
            mixer = new THREE.AnimationMixer(heroSphere);
            mixer.clipAction(gltf.animations[0]).play();
            
        });
        var sphereGeometry = new THREE.DodecahedronGeometry( heroRadius, 1);
        var sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xe5f2f2 ,shading:THREE.FlatShading} )
        heroSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
        heroSphere2 = new THREE.Mesh( sphereGeometry, sphereMaterial );
        mixer = new THREE.AnimationMixer(heroSphere);
        mixer2 = new THREE.AnimationMixer(heroSphere2);
        jumping=false;
        heroSphere.receiveShadow = true;
        heroSphere.castShadow=true;
        heroSphere2.receiveShadow = true;
        heroSphere2.castShadow=true;
    }
    function addWorld(){
        var sides=40;
        var tiers=40;
        const loader = new THREE.TextureLoader();
        var sphereGeometry = new THREE.SphereGeometry( worldRadius, sides,tiers);
        var sphereMaterial = new THREE.MeshStandardMaterial( { map: loader.load('/images/GroundGrass.jpg'), shading:THREE.FlatShading} )
        
        rollingGroundSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
        rollingGroundSphere.receiveShadow = true;
        rollingGroundSphere.castShadow=false;
        rollingGroundSphere.rotation.z=-Math.PI/2;
        scene.add( rollingGroundSphere );
        rollingGroundSphere.position.y=-24;
        rollingGroundSphere.position.z=2;
        addWorldTrees();
    }
    function addLight(){
        var hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, .9)
        scene.add(hemisphereLight);
        sun = new THREE.DirectionalLight( 0xcdc1c5, 0.9);
        sun.position.set( 12,6,-7 );
        sun.castShadow = true;
        scene.add(sun);
        //Set up shadow properties for the sun light
        sun.shadow.mapSize.width = 256;
        sun.shadow.mapSize.height = 256;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 50 ;
    }
    function addPathTree(){
        var options=[0,1,2];
        var lane= Math.floor(Math.random()*3);
        addTree(true,lane);
        options.splice(lane,1);
        if(Math.random()>0.5){
            lane= Math.floor(Math.random()*2);
            addTree(true,options[lane]);
        }
    }
    function addWorldTrees(){
        var numTrees=36;
        var gap=6.28/36;
        for(var i=0;i<numTrees;i++){
            addTree(false,i*gap, true);
            addTree(false,i*gap, false);
        }
    }
    function addTree(inPath, row, isLeft){
        var newTree;
        if(inPath){
            if(treesPool.length==0)return;
            newTree=treesPool.pop();
            newTree.visible=true;
            treesInPath.push(newTree);
            sphericalHelper.set( worldRadius+0.15, pathAngleValues[row], -rollingGroundSphere.rotation.x+4 );
            
        }else{
            newTree=createTree();
            var forestAreaAngle=0;//[1.52,1.57,1.62];
            if(isLeft){
                forestAreaAngle=1.68+Math.random()*0.1;
                //forestAreaAngle=1.52;
            }else{
                forestAreaAngle=1.46-Math.random()*0.1;
                //forestAreaAngle=1.52;
            }
            sphericalHelper.set( worldRadius-0.3, forestAreaAngle, row );
        }
        newTree.position.setFromSpherical( sphericalHelper );
        var rollingGroundVector=rollingGroundSphere.position.clone().normalize();
        var treeVector=newTree.position.clone().normalize();
        
        newTree.quaternion.setFromUnitVectors(treeVector,rollingGroundVector);
        newTree.rotation.x += (Math.random()*(2*Math.PI/10))+-Math.PI/10;
        newTree.rotation.x += 0;
        rollingGroundSphere.add(newTree);
    }
    function boxObstacle() {
        const boxWidth = 0.5;
        const boxHeight = 0.5;
        const boxDepth = 0.5;
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const loader = new THREE.TextureLoader();
        
        const material = new THREE.MeshBasicMaterial({
            map: loader.load('/images/crate_1.jpg'),
        });
        const cube = new THREE.Mesh(geometry, material);
        var boxObstacle = new THREE.Object3D();
        
        boxObstacle.add(cube);
        return boxObstacle;
    }
    
    function duckObstacle() {
        const boxWidth = 0.7;
        const boxHeight = 0.8;
        const boxDepth = 0.15;
        const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
        const loader = new THREE.TextureLoader();
        
        const material = new THREE.MeshBasicMaterial({
            map: loader.load('/images/DuckObstacle.png'),
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.y = 1;
        
        const PillarWidth = 0.1;
        const PillarHeight = 0.5;
        const PillarDepth = 0.1;
        const pillargeometry = new THREE.BoxGeometry(PillarWidth, PillarHeight, PillarDepth);
        const pillarloader = new THREE.TextureLoader();
        
        const pillarmaterial = new THREE.MeshBasicMaterial({
            map: loader.load('/images/woodStick.jpg'),
        });
        const leftpillar = new THREE.Mesh(pillargeometry, pillarmaterial);
        leftpillar.position.x = -0.27;
        leftpillar.position.y = 0.35;
        
        const rightpillar = new THREE.Mesh(pillargeometry, pillarmaterial);
        rightpillar.position.x = +0.27;
        rightpillar.position.y = 0.35;
        
        var duckobstacle = new THREE.Object3D();
        duckobstacle.add(cube);
        duckobstacle.add(leftpillar);
        duckobstacle.add(rightpillar);
        duckobstacle.castShadow=true;
        duckobstacle.receiveShadow=false;
        return duckobstacle;
    }
    
    function createTree(){
        var sides=8;
        var tiers=6;
        var scalarMultiplier=(Math.random()*(0.25-0.1))+0.05;
        var midPointVector= new THREE.Vector3();
        var vertexVector= new THREE.Vector3();
        var treeGeometry = new THREE.ConeGeometry( 0.5, 1, sides, tiers);
        var greenColor = 120 + Math.floor(Math.random() * 135);
        var treeMaterial = new THREE.MeshStandardMaterial( { color: "#"+(51).toString(16)+(greenColor).toString(16)+(51).toString(16),shading:THREE.FlatShading  } );
        var offset;
        midPointVector=treeGeometry.vertices[0].clone();
        var currentTier=0;
        var vertexIndex;
        blowUpTree(treeGeometry.vertices,sides,0,scalarMultiplier);
        tightenTree(treeGeometry.vertices,sides,1);
        blowUpTree(treeGeometry.vertices,sides,2,scalarMultiplier*1.1,true);
        tightenTree(treeGeometry.vertices,sides,3);
        blowUpTree(treeGeometry.vertices,sides,4,scalarMultiplier*1.2);
        tightenTree(treeGeometry.vertices,sides,5);
        var treeTop = new THREE.Mesh( treeGeometry, treeMaterial );
        treeTop.castShadow=true;
        treeTop.receiveShadow=false;
        treeTop.position.y=0.9;
        treeTop.rotation.y=(Math.random()*(Math.PI));
        var treeTrunkGeometry = new THREE.CylinderGeometry( 0.1, 0.1,0.5);
        var trunkMaterial = new THREE.MeshStandardMaterial( { color: 0x886633,shading:THREE.FlatShading  } );
        var treeTrunk = new THREE.Mesh( treeTrunkGeometry, trunkMaterial );
        treeTrunk.position.y=0.25;
        var tree =new THREE.Object3D();
        tree.add(treeTrunk);
        tree.add(treeTop);
        return tree;
    }
    function blowUpTree(vertices,sides,currentTier,scalarMultiplier,odd){
        var vertexIndex;
        var vertexVector= new THREE.Vector3();
        var midPointVector=vertices[0].clone();
        var offset;
        for(var i=0;i<sides;i++){
            vertexIndex=(currentTier*sides)+1;
            vertexVector=vertices[i+vertexIndex].clone();
            midPointVector.y=vertexVector.y;
            offset=vertexVector.sub(midPointVector);
            if(odd){
                if(i%2===0){
                    offset.normalize().multiplyScalar(scalarMultiplier/6);
                    vertices[i+vertexIndex].add(offset);
                }else{
                    offset.normalize().multiplyScalar(scalarMultiplier);
                    vertices[i+vertexIndex].add(offset);
                    vertices[i+vertexIndex].y=vertices[i+vertexIndex+sides].y+0.05;
                }
            }else{
                if(i%2!==0){
                    offset.normalize().multiplyScalar(scalarMultiplier/6);
                    vertices[i+vertexIndex].add(offset);
                }else{
                    offset.normalize().multiplyScalar(scalarMultiplier);
                    vertices[i+vertexIndex].add(offset);
                    vertices[i+vertexIndex].y=vertices[i+vertexIndex+sides].y+0.05;
                }
            }
        }
    }
    function tightenTree(vertices,sides,currentTier){
        var vertexIndex;
        var vertexVector= new THREE.Vector3();
        var midPointVector=vertices[0].clone();
        var offset;
        for(var i=0;i<sides;i++){
            vertexIndex=(currentTier*sides)+1;
            vertexVector=vertices[i+vertexIndex].clone();
            midPointVector.y=vertexVector.y;
            offset=vertexVector.sub(midPointVector);
            offset.normalize().multiplyScalar(0.06);
            vertices[i+vertexIndex].sub(offset);
        }
    }
    
    function update(){
        
        mixer.update(speed);
        mixer2.update(speed2);
        //stats.update();
        //animate
        
        var delta = 2*clock.getDelta();
        
        if(heroSphere.position.y<=heroBaseY){
            jumping=false;
            speed = 0.03;
            bounceValue=+0.005;
        }
        if(!hasCollided){
            rollingGroundSphere.rotation.x += rollingSpeed;
            heroSphere.position.y+=bounceValue;
            heroSphere.position.x=THREE.Math.lerp(heroSphere.position.x,currentLane, delta);//clock.getElapsedTime());
            bounceValue-=gravity;
            
            if(clock.getElapsedTime()>treeReleaseInterval){
                clock.start();
                addPathTree();
                
                score+=2*treeReleaseInterval;
                scoreText.innerHTML=score.toString();
            }
        }
        if(heroSphere2.position.y<=heroBaseY){
            jumping2=false;
            speed2 = 0.03;
            bounceValue2=+0.005;
        }
        if(!hasCollided2){
            // rollingGroundSphere.rotation.x += rollingSpeed;
            heroSphere2.position.y+=bounceValue2;
            heroSphere2.position.x=THREE.Math.lerp(heroSphere2.position.x,currentLane2, delta);//clock.getElapsedTime());
            bounceValue2-=gravity;
        }
        doTreeLogic();
        doExplosionLogic();
        render();
        requestAnimationFrame(update);//request next update
    }
    function doTreeLogic(){
        var oneTree;
        var treePos = new THREE.Vector3();
        var treesToRemove=[];
        treesInPath.forEach( function ( element, index ) {
            oneTree=treesInPath[ index ];
            treePos.setFromMatrixPosition( oneTree.matrixWorld );
            if(treePos.z>6 &&oneTree.visible){//gone out of our view zone
                treesToRemove.push(oneTree);
            }else if(hasCollided || hasCollided2){
                treesToRemove.push(oneTree);
            }else{//check collision
                if(treePos.distanceTo(heroSphere.position)<=0.6){
                    hasCollided=true;
                    //currentLane = leftLane;
                    heroSphere.position.y =7;
                    heroSphere2.position.y =7;
                    scoreText.innerHTML = "player 2 win";
                    
                    explode();
                }
                if(treePos.distanceTo(heroSphere2.position)<=0.6){
                    hasCollided2=true;
                    hasCollided=true;
                    //currentLane = leftLane;
                    heroSphere.position.y =7;
                    heroSphere2.position.y =7;
                    scoreText.innerHTML = "player 1 win";
                    
                    explode();
                }
            }
        });
        var fromWhere;
        treesToRemove.forEach( function ( element, index ) {
            oneTree=treesToRemove[ index ];
            fromWhere=treesInPath.indexOf(oneTree);
            treesInPath.splice(fromWhere,1);
            treesPool.push(oneTree);
            oneTree.visible=false;
        });
    }
    function doExplosionLogic(){
        if(!particles.visible)return;
        for (var i = 0; i < particleCount; i ++ ) {
            particleGeometry.vertices[i].multiplyScalar(explosionPower);
        }
        if(explosionPower>1.005){
            explosionPower-=0.001;
        }else{
            particles.visible=false;
        }
        particleGeometry.verticesNeedUpdate = true;
    }
    function explode(){
        particles.position.y=2;
        particles.position.z=4.8;
        particles.position.x=heroSphere.position.x;
        for (var i = 0; i < particleCount; i ++ ) {
            var vertex = new THREE.Vector3();
            vertex.x = -0.2+Math.random() * 0.4;
            vertex.y = -0.2+Math.random() * 0.4 ;
            vertex.z = -0.2+Math.random() * 0.4;
            particleGeometry.vertices[i]=vertex;
        }
        explosionPower=1.07;
        particles.visible=true;
    }
    function render(){
        renderer.render(scene, camera);//draw
    }
    function gameOver () {
        //cancelAnimationFrame( globalRenderID );
        //window.clearInterval( powerupSpawnIntervalID );
    }
    function onWindowResize() {
        //resize & align
        sceneHeight = window.innerHeight;
        sceneWidth = window.innerWidth;
        renderer.setSize(sceneWidth, sceneHeight);
        camera.aspect = sceneWidth/sceneHeight;
        camera.updateProjectionMatrix();
    }
    
}