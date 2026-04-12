'use strict';

function runDemo(canvasId) {
    var canvas = document.getElementById(canvasId);
    var engine = new BABYLON.Engine(canvas, true);

    // Création de la scène
    var scene = new BABYLON.Scene(engine);
    scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    scene.collisionsEnabled = true;

    // Ajout d'une caméra et de son contrôleur
    var camera = new BABYLON.FreeCamera("MainCamera", new BABYLON.Vector3(13, 2.5, -24), scene);
    camera.rotation.y = 0;
    camera.applyGravity = true;
    camera.checkCollisions = true;

    camera.speed = 0.25;
    camera.angularSensibility = 1000;

    camera.keysUp = [38, 90]; // Flèche Haut ou Touche Z
    camera.keysDown = [40, 83]; // Flèche Bas ou Touche S
    camera.keysLeft = [37, 81]; // Flèche Gauche ou Touche Q
    camera.keysRight = [39, 68]; // Flèche Droite ou Touche D
    camera.attachControl(canvas, true);

    /* Ajout de lumières
    var light = new BABYLON.PointLight("DirLight", new BABYLON.Vector3(0, 10, 0), scene);
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    light.specular = new BABYLON.Color3(0.6, 0.6, 0.6);
    light.intensity = 1.0; */

    var hemiLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.8;
    hemiLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);

    // Skybox avec teinte cyan
    var skyMaterial = new BABYLON.SkyMaterial("skyMat", scene);
    skyMaterial.backFaceCulling = false;
    skyMaterial.rayleigh = 5;
    skyMaterial.turbidity = 2;
    skyMaterial.luminance = 0.8;
    skyMaterial.inclination = 0.3;
    skyMaterial.azimuth = 0.25;

    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000 }, scene);
    skybox.material = skyMaterial;

    // Création du sol
    var ground = BABYLON.Mesh.CreatePlane("ground", 50, scene);
    ground.rotation.x = Math.PI / 2;
    ground.material = new BABYLON.StandardMaterial("gMaterial", scene);
    ground.material.diffuseTexture = new BABYLON.Texture("images/ground.jpg", scene);
    ground.checkCollisions = true;

    // Ajout de cubes aux coins
    var positions = [
        { x: -15, z: 15, url: "https://scaphydata.com/testfondvideo/", image: "images/testFondVideo.PNG" },
        { x: -7.5, z: 7.5, url: "https://scaphydata.com/Exercice10HTMLCSS3/", image: "images/exercice10htmlcss3.png"},
        { x: -15, z: -15,  url: "https://scaphydata.com/WolfGang/", image: "images/WolfGang.PNG" },
        { x: -7.5, z: -7.5, url: "https://scaphydata.com/grandRestaurantStatique/", image: "images/grandRestaurant.PNG" },
        { x: 15, z: 15, url: "https://scaphydata.com/JohnDoePortofolio/", image: "images/JohnDoePortofolio.PNG" },
        { x: 7.5, z: 7.5, url: "https://scaphydata.com/fournituresdemusculation/", image: "images/fournituresdemusculation.PNG" },
        { x: 15, z: -15, url: "https://scaphydata.com/RealityGroup/", image: "images/RealityGroup.PNG" },
        { x: 7.5, z: -7.5, url: "https://scaphydata.com/illaYoga/", image: "images/illaYoga.PNG" }
    ];
    var cubeSize = 3.5;

    for (var i = 0; i < positions.length; i++) {
        // Utilisation de MeshBuilder pour un meilleur contrôle des faces
        var faceUV = new Array(6);
        for (var j = 0; j < 6; j++) {
            faceUV[j] = new BABYLON.Vector4(0, 0, 1, 1);
        }
        
        var box = BABYLON.MeshBuilder.CreateBox("box" + i, { size: cubeSize, faceUV: faceUV }, scene);
        box.position = new BABYLON.Vector3(positions[i].x, cubeSize / 2, positions[i].z);
        
        // Création d'un matériau unique pour chaque boîte avec sa propre texture
        var material = new BABYLON.StandardMaterial("boxMat" + i, scene);
        if (positions[i].image) {
            var texture = new BABYLON.Texture(positions[i].image, scene);
            material.diffuseTexture = texture;
            material.emissiveTexture = texture; // Assure la visibilité sur toutes les faces
        } else {
            material.diffuseColor = new BABYLON.Color3(1, 0, 0); // Fallback color
            material.emissiveColor = new BABYLON.Color3(0.5, 0, 0);
        }
        box.material = material;
        box.checkCollisions = true;

        // On associe l'URL à la boîte
        box.metadata = { url: positions[i].url };

        // Ajout d'un ActionManager pour gérer le clic
        box.actionManager = new BABYLON.ActionManager(scene);
        box.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
            var url = evt.source.metadata.url;
            if (url) {
                window.open(url, "_blank");
            }
        }));
    }

    // Changement du curseur au survol
    scene.onPointerObservable.add(function (pointerInfo) {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
            var pickResult = scene.pick(scene.pointerX, scene.pointerY);
            if (pickResult.hit && pickResult.pickedMesh && pickResult.pickedMesh.name.indexOf("box") !== -1) {
                canvas.style.cursor = "pointer";
            } else {
                canvas.style.cursor = "default";
            }
        }
    });

    // Lancement de la boucle principale
    scene.onBeforeRenderObservable.add(function () {
        var limit = 24.5; // Un peu moins que 50/2 (25) pour éviter le bord
        if (camera.position.x > limit) camera.position.x = limit;
        if (camera.position.x < -limit) camera.position.x = -limit;
        if (camera.position.z > limit) camera.position.z = limit;
        if (camera.position.z < -limit) camera.position.z = -limit;
    });

    engine.runRenderLoop(function() {
        scene.render();
    });

    // Resize event
    window.addEventListener('resize', function() {
        engine.resize();
    });
}
