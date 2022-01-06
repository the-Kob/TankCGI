import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../Tank_CGI/libs/utils.js";
import { ortho, lookAt, flatten, translate, rotateY, vec3, mult, rotateZ, transpose, inverse, normalMatrix, vec4, add, scale, normalize } from "../Tank_CGI/libs/MV.js";
import {modelView, loadMatrix, multMatrix, multRotationY, multScale, multTranslation, pushMatrix, popMatrix, multRotationX, multRotationZ} from "../Tank_CGI/libs/stack.js";

import * as CUBE from '../Tank_CGI/libs/cube.js';
import * as TORUS from '../Tank_CGI/libs/torus.js';
import * as PRISM from '../Tank_CGI/libs/prism.js';
import * as CYLINDER from '../Tank_CGI/libs/cylinder.js';
import * as SPHERE from '../Tank_CGI/libs/sphere.js';

/** @type WebGLRenderingContext */
let gl;
     
let mode;
let deltaTime;

let velocity = 0.0;
const VELOCITY_LIM = 10.0;   
const ACCELARATION = 0.05;

const GRAVITY = vec3([0.0, -9.8, 0.0, 0.0]);        

let keysPressed = []; // Pressed keys catcher

let currentX = 0.0;
let wheelRot = 0.0;
let jointRot = 0.0;

let pipeBallVertRot = 0.0;
const PIPE_BALL_LIM = 10.0;

let mProjectile;
let projectiles = [];

const RGB = 255.0;

const GROUND_CUBE_Y = 0.5;

const BASE_SCALE_X = 9.25;
const TANK_LENGTH = Math.ceil(BASE_SCALE_X);
const BASE_SCALE_Y = 1.5;
const BASE_SCALE_Z = 4.0;
const BASE_X = (TANK_LENGTH - BASE_SCALE_X)/2;
const BASE_Y = BASE_SCALE_Y/2.0 + 0.75;

const BASE_F_PRISM_SCALE_X = 0.75;
const BASE_F_PRISM_SCALE_Y = BASE_SCALE_Y;
const BASE_F_PRISM_SCALE_Z = BASE_SCALE_Z;
const BASE_F_PRISM_X = BASE_SCALE_X/2.0 + BASE_F_PRISM_SCALE_X/2.0 - BASE_X;

const BAR_SCALE_X = BASE_SCALE_Z + 1.0;
const BAR_SCALE_Y = 0.5;
const BAR_SCALE_Z = 0.5;
const BAR_Y = -BASE_SCALE_Y/2.0 + BAR_SCALE_Y/2.0;

const WHEEL_SCALE_X = 1.75;
const WHEEL_SCALE_Y = 1.5;
const WHEEL_SCALE_Z = WHEEL_SCALE_X;
const WHEEL_DISTANCE = (TANK_LENGTH - (WHEEL_SCALE_X*4.0))/4.0 + WHEEL_SCALE_X;
const WHEEL_OFFSET = TANK_LENGTH/2.68;

const PLATFORM_SCALE_X = TANK_LENGTH/1.25;
const PLATFORM_SCALE_Y = TANK_LENGTH/10;
const PLATFORM_SCALE_Z = BASE_SCALE_Z + 2.0;
const PLATFORM_X = -(TANK_LENGTH - PLATFORM_SCALE_X)/2.0;
const PLATFORM_Y = BASE_SCALE_Y/2.0 + PLATFORM_SCALE_Y/2.0;

const PLATFORM_PRISM_SCALE_X = 2.0;
const PLATFORM_PRISM_SCALE_Y = PLATFORM_SCALE_Y;
const PLATFORM_PRISM_SCALE_Z = PLATFORM_SCALE_Z;
const PLATFORM_PRISM_X = PLATFORM_PRISM_SCALE_X/2.0 + PLATFORM_SCALE_X/2.0;

const BASE_B_PRISM_SCALE_X = BASE_SCALE_Y + PLATFORM_SCALE_Y;
const BASE_B_PRISM_SCALE_Y = 1.0;
const BASE_B_PRISM_SCALE_Z = BASE_SCALE_Z;
const BASE_B_PRISM_X = -(TANK_LENGTH + BASE_B_PRISM_SCALE_Y)/2.0;
const BASE_B_PRISM_Y = PLATFORM_SCALE_Y/2.0;

const BODY_JOINT_SCALE_X = BASE_SCALE_Z - 0.5;
const BODY_JOINT_SCALE_Y = 1.0;
const BODY_JOINT_SCALE_Z = BASE_SCALE_Z - 0.5;
const BODY_JOINT_Y = PLATFORM_SCALE_Y/2.0;

const BODY_SCALE_X = 6.5;
const BODY_SCALE_Y = 2.0;
const BODY_SCALE_Z = BASE_SCALE_Z;
const BODY_Y = 1.125; // Supposed to be fixed for aesthetic purposes 

const PIPE_BALL_SCALE = 0.75; // 3/4s of the base value
const PIPE_BALL_X = BODY_SCALE_X/2.0;

const PIPE_SCALE_X = 1.0; // Base value
const PIPE_SCALE_Y = BODY_SCALE_X;
const PIPE_SCALE_Z = PIPE_SCALE_X;
const PIPE_X = BODY_SCALE_X/2.0 - PIPE_BALL_X/2;

const SPIPE_SCALE_X = 0.75;
const SPIPE_SCALE_Y = 1.5;
const SPIPE_SCALE_Z = 0.75;
const SPIPE_X = PIPE_SCALE_Y/2.0 + SPIPE_SCALE_Y/2.0;

const NOZZLE_X = SPIPE_SCALE_Y/2.0 + 0.5;

const BODY_TOP_SCALE_X = BODY_SCALE_X - 2.0;
const BODY_TOP_SCALE_Y = 0.5; // Half the base value
const BODY_TOP_SCALE_Z = BODY_SCALE_Z;
const BODY_TOP_Y = BODY_SCALE_Y/2.0 + BODY_TOP_SCALE_Y/2.0;

const BODY_PRISM_SCALE_X = (BODY_SCALE_X - BODY_TOP_SCALE_X)/2.0;
const BODY_PRISM_SCALE_Y = BODY_TOP_SCALE_Y;
const BODY_PRISM_SCALE_Z = BODY_SCALE_Z;
const BODY_PRISM_X = BODY_TOP_SCALE_X/2.0 + BODY_PRISM_SCALE_X/2.0;

const BODY_LID_SCALE_X = BODY_TOP_SCALE_X - 0.5;
const BODY_LID_SCALE_Y = BODY_TOP_SCALE_Y*2;
const BODY_LID_SCALE_Z = BODY_LID_SCALE_X;

const ANTENNA_SCALE_X = 0.125;
const ANTENNA_SCALE_Y = 1.5;
const ANTENNA_SCALE_Z = 0.125;
const ANTENNA_X = -BODY_LID_SCALE_X/2.5;
const ANTENNA_Y = ANTENNA_SCALE_Y/2.0;
const ANTENNA_Z = ANTENNA_X;

const PROJECTILE_SCALE = 0.75; // 3/4s of the base value

let VP_DISTANCE = 10.0;
const VP_DISTANCE_MIN = 6.0;
const VP_DISTANCE_MAX = 20.0;

function setup(shaders)
{
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;

    gl = setupWebGL(canvas);

    let program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    let mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-5*VP_DISTANCE,5*VP_DISTANCE);

    let mView = lookAt([VP_DISTANCE,VP_DISTANCE,VP_DISTANCE], [0,0,0], [0,1,0]);

    mode = gl.TRIANGLES; 

    resize_canvas();
    window.addEventListener("resize", resize_canvas);

    function findKey(key)
    {   
        for(let i = 0; i < keysPressed.length; i++) {
            if(keysPressed[i] == key) {
                return i;
            }
        }

        return -1;
    }

    // Adds the pressed keys to our catcher as the object key and set it to true
    document.onkeydown = function(event) {
        if(findKey(event.key) == -1) {
            keysPressed.push(event.key);
        }
    }

    // Sets key values that are being pressed to false
    document.onkeyup = function(event) {
        keysPressed.splice(findKey(event.key, 1));
    }

    function keyDownSwitch(key) { 
        switch(key) {
            case 'w':
                if(pipeBallVertRot < PIPE_BALL_LIM) {
                    pipeBallVertRot += ACCELARATION*10;
                }
                break;
            case 'W':
                mode = gl.LINES; 
                break;
            case 's':
                if(pipeBallVertRot > -PIPE_BALL_LIM) {
                    pipeBallVertRot -= ACCELARATION*10;
                }
                break;
            case 'S':
                mode = gl.TRIANGLES;
                break;
            case 'a':
                jointRot += ACCELARATION*10;
                break;
            case 'd':
                jointRot -= ACCELARATION*10;
                break;
            case 'ArrowUp':
                if(velocity < VELOCITY_LIM) {
                    velocity += ACCELARATION;
                }
                break;
            case 'ArrowDown':
                if(velocity > -VELOCITY_LIM) {
                    velocity -= ACCELARATION;
                }
                break;
            case '1':
                // Front look
                mView = lookAt([1,0,0], [0,0,0], [0,BASE_Y,0]);
                break;
            case '2':
                // Down look
                mView = lookAt([0,VP_DISTANCE,0], [0,0,0], [0,0,1]);
                break;
            case '3':
                // Side look
                mView = lookAt([0,0,0], [0,0,0], [0,BASE_Y,0]);
                break;
            case '4':
                mView = lookAt([VP_DISTANCE,VP_DISTANCE,VP_DISTANCE], [0,0,0], [0,1,0]);
                break;
            case '+':
                if(VP_DISTANCE >= VP_DISTANCE_MIN) {
                    VP_DISTANCE -= ACCELARATION;
                }
                break;
            case '-':
                if(VP_DISTANCE <= VP_DISTANCE_MAX) {
                    VP_DISTANCE += ACCELARATION;
                }
                break;
            case ' ':
                let p0 = mult(mult(inverse(mView), mProjectile), [0.0, -0.5, 0.0, 1.0]);
                p0 = vec3(p0);

                let v0 = mult(normalMatrix(mult(inverse(mView), mProjectile)), [0.0, -deltaTime, 0.0, 0.0]);
                v0 = scale(10.0, normalize(vec3(v0)));

                projectiles.push([p0, v0]);
                break;
        }
    }

    gl.clearColor(135/RGB, 206/RGB, 235/RGB, 1.0); // sky color
    
    CUBE.init(gl);
    TORUS.init(gl);
    PRISM.init(gl);
    CYLINDER.init(gl);
    SPHERE.init(gl);

    gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test
    
    window.requestAnimationFrame(render);


    function resize_canvas(event)
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        aspect = canvas.width / canvas.height;

        gl.viewport(0,0,canvas.width, canvas.height);
        mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-5*VP_DISTANCE,5*VP_DISTANCE);
    }

    function uploadModelView()
    {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(modelView()));
    }

    function Tile(i, j, colorCounter, uColor) {
        pushMatrix();
            if(colorCounter % 2 == 0) {
                gl.uniform3fv(uColor, flatten(vec3(245/RGB, 222/RGB, 179/RGB)));
            } else {
                gl.uniform3fv(uColor, flatten(vec3(169/RGB, 161/RGB, 140/RGB)));
            }

            multTranslation([i, -GROUND_CUBE_Y, j]);
            multScale([1, GROUND_CUBE_Y, 1]);

            uploadModelView();

            CUBE.draw(gl, program, mode);
        popMatrix();
    }

    function Ground()
    {   
        let colorCounter = 0;
        const uColor = gl.getUniformLocation(program, "uColor");

        for(let i = -20; i <= 20; i++) {
            for(let j = -20; j <= 20; j++) {
                
                Tile(i, j, colorCounter, uColor);

                colorCounter++;
            }
        } 
    }

    function Base()
    {   
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(58/RGB, 65/RGB, 25/RGB)));

        multTranslation([-BASE_X, 0, 0]);
        multScale([BASE_SCALE_X, BASE_SCALE_Y, BASE_SCALE_Z]);

        uploadModelView();

        CUBE.draw(gl, program, mode);
    }

    function BaseFrontPrism() 
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(25/RGB, 28/RGB, 11/RGB)));
        
        multRotationX(180);
        multScale([BASE_F_PRISM_SCALE_X, BASE_F_PRISM_SCALE_Y, BASE_F_PRISM_SCALE_Z]);

        uploadModelView();

        PRISM.draw(gl, program, mode);
    }

    function BaseBackPrism()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(25/RGB, 28/RGB, 11/RGB)));
        
        multRotationZ(90);
        multRotationY(180);
        
        multScale([BASE_B_PRISM_SCALE_X, BASE_B_PRISM_SCALE_Y, BASE_B_PRISM_SCALE_Z]);

        uploadModelView();

        PRISM.draw(gl, program, mode);
    }

    function WheelBar()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(25/RGB, 28/RGB, 11/RGB)));
        
        multRotationY(90);
        multScale([BAR_SCALE_X, BAR_SCALE_Y, BAR_SCALE_Z]);

        uploadModelView();

        CUBE.draw(gl, program, mode);
    }

    function Wheel()
    {   
        pushMatrix();
            // Outside wheel
            const uColor1 = gl.getUniformLocation(program, "uColor");
            gl.uniform3fv(uColor1, flatten(vec3(10/RGB, 10/RGB, 10/RGB)));
        
            multRotationX(90);
            multScale([WHEEL_SCALE_X, WHEEL_SCALE_Y, WHEEL_SCALE_Z]);

            uploadModelView();

            TORUS.draw(gl, program, mode);
        popMatrix();
        
        pushMatrix();
            // Inside wheel
            const uColor2 = gl.getUniformLocation(program, "uColor");
            gl.uniform3fv(uColor2, flatten(vec3(30/RGB, 30/RGB, 30/RGB)));
            
            multScale([WHEEL_SCALE_X, WHEEL_SCALE_Z, WHEEL_SCALE_Y/2]);

            uploadModelView();

            SPHERE.draw(gl, program, mode);
        popMatrix();
    }

    function Platform()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(38/RGB, 45/RGB, 25/RGB)));

        multScale([PLATFORM_SCALE_X, PLATFORM_SCALE_Y, PLATFORM_SCALE_Z]);

        uploadModelView();

        CUBE.draw(gl, program, mode);
    }

    function PlatformPrism()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(25/RGB, 28/RGB, 11/RGB)));
        
        multScale([PLATFORM_PRISM_SCALE_X, PLATFORM_PRISM_SCALE_Y, PLATFORM_PRISM_SCALE_Z]);

        uploadModelView();

        PRISM.draw(gl, program, mode);
    }

    function BodyJoint() 
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(10/RGB, 10/RGB, 10/RGB)));
        
        multScale([BODY_JOINT_SCALE_X, BODY_JOINT_SCALE_Y, BODY_JOINT_SCALE_Z]);

        uploadModelView();

        SPHERE.draw(gl, program, mode);
    }

    function Body()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(58/RGB, 65/RGB, 25/RGB)));
        
        multScale([BODY_SCALE_X, BODY_SCALE_Y, BODY_SCALE_Z]);

        uploadModelView();

        CUBE.draw(gl, program, mode);
    }

    function PipeBall()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(10/RGB, 10/RGB, 10/RGB)));
        
        multScale([PIPE_BALL_SCALE, PIPE_BALL_SCALE, PIPE_BALL_SCALE]);

        uploadModelView();

        SPHERE.draw(gl, program, mode);
    }

    function Pipe()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(38/RGB, 45/RGB, 25/RGB)));
        
        multRotationZ(90);
        multScale([PIPE_SCALE_X, PIPE_SCALE_Y, PIPE_SCALE_Z]);

        uploadModelView();

        CYLINDER.draw(gl, program, mode);
    }

    function SmallerPipe()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(58/RGB, 65/RGB, 25/RGB)));
        
        multRotationZ(90);
        multScale([SPIPE_SCALE_X, SPIPE_SCALE_Y, SPIPE_SCALE_Z]);

        uploadModelView();

        CYLINDER.draw(gl, program, mode);
    }

    function Nozzle()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(25/RGB, 28/RGB, 11/RGB)));
        
        multRotationZ(90);

        mProjectile = modelView();
        uploadModelView();

        CYLINDER.draw(gl, program, mode);
    }

    function BodyTop()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(38/RGB, 45/RGB, 25/RGB)));

        multScale([BODY_TOP_SCALE_X, BODY_TOP_SCALE_Y, BODY_TOP_SCALE_Z]);

        uploadModelView();

        CUBE.draw(gl, program, mode);
    }

    function BodyTopFrontPrism()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(25/RGB, 28/RGB, 11/RGB)));
        
        multScale([BODY_PRISM_SCALE_X, BODY_PRISM_SCALE_Y, BODY_PRISM_SCALE_Z]);

        uploadModelView();

        PRISM.draw(gl, program, mode);
    }
    
    function BodyTopBackPrism()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(25/RGB, 28/RGB, 11/RGB)));
        
        multRotationY(180);
        multScale([BODY_PRISM_SCALE_X, BODY_PRISM_SCALE_Y, BODY_PRISM_SCALE_Z]);

        uploadModelView();

        PRISM.draw(gl, program, mode);
    }

    function BodyTopLid()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(25/RGB, 28/RGB, 11/RGB)));
        
        multScale([BODY_LID_SCALE_X, BODY_LID_SCALE_Y, BODY_LID_SCALE_Z]);

        uploadModelView();

        SPHERE.draw(gl, program, mode);
    }

    function Antenna()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(25/RGB, 28/RGB, 11/RGB)));
        
        multScale([ANTENNA_SCALE_X, ANTENNA_SCALE_Y, ANTENNA_SCALE_Z]);

        uploadModelView();

        CYLINDER.draw(gl, program, mode);
    }

    function Projectile()
    {
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.uniform3fv(uColor, flatten(vec3(11/RGB, 11/RGB, 11/RGB)));
        
        multScale([PROJECTILE_SCALE, PROJECTILE_SCALE, PROJECTILE_SCALE]);

        uploadModelView();

        SPHERE.draw(gl, program, mode);
    }

    function movTank() 
    {
        currentX += velocity*deltaTime;
        wheelRot += (velocity*deltaTime*(180/Math.PI))/(0.7*WHEEL_SCALE_X);
    }

    function deaccelarate()
    {   
        let arrowUp = findKey('ArrowUp');
        let arrowDown = findKey('ArrowDown');
        
        if(arrowDown == -1 && arrowUp == -1) {
            while(velocity != 0) {
                if(velocity > 0.0) {
                    velocity -= ACCELARATION;
                    if(velocity < 0.0) {
                        velocity = 0;
                    }
                }
                if(velocity < 0.0) {
                    velocity += ACCELARATION;
                    if(velocity > 0.0) {
                        velocity = 0;
                    }
                }
            }
        }
    }

    function drawProjectiles()
    {
        for(let i = 0; i < projectiles.length; i++) {
                if(projectiles[i][0][1] >= 0) {
                    pushMatrix();
                        multTranslation([projectiles[i][0][0], projectiles[i][0][1], projectiles[i][0][2]]);
                        projectiles[i][0] = add(projectiles[i][0], scale(deltaTime, projectiles[i][1]));
                        projectiles[i][1] = add(projectiles[i][1], scale(deltaTime, GRAVITY));
                        pushMatrix();    
                            Projectile();
                        popMatrix();
                    popMatrix();
                } else {
                    projectiles.splice(i, 1);
                }
        }
    }

    let then = 0;

    function render(now)
    {
        now *= 0.001;
        deltaTime = now - then;
        then = now;

        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
        
        mProjection = ortho(-VP_DISTANCE*aspect,VP_DISTANCE*aspect, -VP_DISTANCE, VP_DISTANCE,-5*VP_DISTANCE,5*VP_DISTANCE);

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));

        loadMatrix(mView);

        for(let i = 0; i < keysPressed.length; i++) { 
            keyDownSwitch(keysPressed[i]);
        }
       
        movTank();
        deaccelarate();

        Ground();
        pushMatrix();
            // BASE BODY
            multTranslation([currentX, BASE_Y, 0]);
            pushMatrix();
                Base();
            popMatrix();
            pushMatrix();
                multTranslation([BASE_F_PRISM_X, 0, 0]);
                pushMatrix();
                    BaseFrontPrism();
                popMatrix();
            popMatrix();
            pushMatrix();
                multTranslation([BASE_B_PRISM_X, BASE_B_PRISM_Y, 0]);
                pushMatrix();
                    BaseBackPrism();
                popMatrix();
            popMatrix();
            // WHEEL BAR FRONT
            pushMatrix();
                multTranslation([WHEEL_OFFSET, BAR_Y, 0]);
                pushMatrix();
                    WheelBar();
                popMatrix();
                pushMatrix();
                    multTranslation([0, 0, BAR_SCALE_X/2]);
                    multRotationZ(-wheelRot);
                    Wheel();
                popMatrix();
                pushMatrix();
                    multTranslation([0, 0, -BAR_SCALE_X/2]);
                    multRotationZ(-wheelRot);
                    Wheel();
                popMatrix();
            popMatrix();
            // WHEEL BAR
            pushMatrix();
                multTranslation([WHEEL_OFFSET - WHEEL_DISTANCE, BAR_Y, 0]);
                pushMatrix();
                    WheelBar();
                popMatrix();
                pushMatrix();
                    multTranslation([0, 0, BAR_SCALE_X/2]);
                    multRotationZ(-wheelRot);
                    Wheel();
                popMatrix();
                pushMatrix();
                    multTranslation([0, 0, -BAR_SCALE_X/2]);
                    multRotationZ(-wheelRot);
                    Wheel();
                popMatrix();
            popMatrix();
            // WHEEL BAR
            pushMatrix();
                multTranslation([WHEEL_OFFSET - WHEEL_DISTANCE*2, BAR_Y, 0]);
                pushMatrix();
                    WheelBar();
                popMatrix();
                pushMatrix();
                    multTranslation([0, 0, BAR_SCALE_X/2]);
                    multRotationZ(-wheelRot);
                    Wheel();
                popMatrix();
                pushMatrix();
                    multTranslation([0, 0, -BAR_SCALE_X/2]);
                    multRotationZ(-wheelRot);
                    Wheel();
                popMatrix();
            popMatrix();
            // WHEEL BAR BACK
            pushMatrix();
                multTranslation([WHEEL_OFFSET - WHEEL_DISTANCE*3, BAR_Y, 0]);
                pushMatrix();
                    WheelBar();
                popMatrix();
                pushMatrix();
                    multTranslation([0, 0, BAR_SCALE_X/2]);
                    multRotationZ(-wheelRot);
                    Wheel();
                popMatrix();
                pushMatrix();
                    multTranslation([0, 0, -BAR_SCALE_X/2]);
                    multRotationZ(-wheelRot);
                    Wheel();
                popMatrix();
            popMatrix();
            //PLATFORM
            pushMatrix();
                multTranslation([PLATFORM_X, PLATFORM_Y, 0]);
                pushMatrix();
                    Platform();
                popMatrix();
                pushMatrix();
                    multTranslation([PLATFORM_PRISM_X, 0, 0]);
                    pushMatrix();
                        PlatformPrism();
                    popMatrix();
                popMatrix();
                // BODY
                pushMatrix();
                    multTranslation([0, BODY_JOINT_Y, 0]);
                    multRotationY(jointRot); // TO-DO
                    pushMatrix();
                        BodyJoint();
                    popMatrix();
                    pushMatrix
                        multTranslation([0, BODY_Y ,0]);
                        pushMatrix();
                            Body();
                        popMatrix();
                        pushMatrix(); 
                            multTranslation([PIPE_BALL_X, 0, 0]);
                            multRotationZ(pipeBallVertRot); // TO-DO 22.5 a -22.5
                            pushMatrix(); 
                                PipeBall();
                            popMatrix();
                            pushMatrix();
                                multTranslation([PIPE_X, 0, 0]);
                                pushMatrix();
                                    Pipe();
                                popMatrix();
                                pushMatrix();
                                    multTranslation([SPIPE_X, 0, 0]);
                                    pushMatrix();
                                        SmallerPipe();
                                    popMatrix();
                                    pushMatrix();
                                        multTranslation([NOZZLE_X,0,0]);
                                        pushMatrix();
                                            Nozzle();
                                        popMatrix();
                                    popMatrix();
                                popMatrix();
                            popMatrix();
                        popMatrix();
                        pushMatrix();
                            multTranslation([0, BODY_TOP_Y, 0]);
                            pushMatrix();
                                BodyTop();
                            popMatrix();
                            pushMatrix();
                                multTranslation([BODY_PRISM_X, 0, 0]);
                                pushMatrix();
                                    BodyTopFrontPrism();
                                popMatrix();
                            popMatrix();
                            pushMatrix();
                                multTranslation([-BODY_PRISM_X, 0, 0]);
                                pushMatrix();
                                    BodyTopBackPrism();
                                popMatrix();
                            popMatrix();
                            pushMatrix();
                                pushMatrix();
                                    BodyTopLid();
                                popMatrix();
                            popMatrix();
                            pushMatrix();
                                multTranslation([ANTENNA_X, ANTENNA_Y, ANTENNA_Z]);
                                pushMatrix();
                                    Antenna();
                                popMatrix();
                            popMatrix();
                        popMatrix();
                    popMatrix();
                popMatrix();
            popMatrix();
        popMatrix();

        drawProjectiles();
    }
}

const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders));
