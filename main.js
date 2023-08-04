function multiplyMatrixVector(matrix, vector) {
    const result = [];
    for (let i = 0; i < 3; i++) {
      let sum = 0;
      for (let j = 0; j < 3; j++) {
        sum += matrix[i][j] * vector[j];
      }
      result.push(sum);
    }
    return result;
  }


function timeStep(milliseconds) {

    window.m_1 = IdentityMatrix

    let seconds = milliseconds/ 1000


    if (keysBeingPressed['ArrowLeft'] == true) {
        window.camera_r[1] += Math.PI * 0.005
    }

    if (keysBeingPressed['ArrowRight'] == true) {
        window.camera_r[1] -= Math.PI * 0.005
    }

    if (keysBeingPressed['ArrowUp'] == true) {
        window.camera_r[0] += Math.PI * 0.005
    }

    if (keysBeingPressed['ArrowDown'] == true) {
        window.camera_r[0] -= Math.PI * 0.005
    }

    let size =  window.resolution * terrain_increment

    let forward = [-1,0,0]
    let up = [0,0,1] 
    let right = [0,1,0] 

    let theta1 = camera_r[0]
    let theta2 = camera_r[1]

    const rotationY = 
        [[ Math.cos(theta1), 0, Math.sin(theta1) ],
        [ 0,               1, 0              ],
        [-Math.sin(theta1), 0, Math.cos(theta1) ]]

    const rotationZ =[
        [ Math.cos(theta2), -Math.sin(theta2), 0 ],
        [ Math.sin(theta2), Math.cos(theta2),  0 ],
        [ 0,               0,                1 ]]

    forward = multiplyMatrixVector(rotationY,forward)
    forward = multiplyMatrixVector(rotationZ,forward)

    up = multiplyMatrixVector(rotationY,up)
    up = multiplyMatrixVector(rotationZ,up)

    right =  multiplyMatrixVector(rotationY,right)
    right =  multiplyMatrixVector(rotationZ,right)


    if (keysBeingPressed['w'] == true) {
        window.camera_position = add(window.camera_position, mul(forward,0.01))
    }

    if (keysBeingPressed['a'] == true) {
        window.camera_position = sub(window.camera_position, mul(right,0.01))
    }

    if (keysBeingPressed['s'] == true) {
        window.camera_position = sub(window.camera_position, mul(forward,0.01))
    }

    if (keysBeingPressed['d'] == true) {
        window.camera_position = add(window.camera_position, mul(right,0.01))
    }

    if (keysBeingPressed['f'] == true) {
        window.fog *= -1
    } 



    window.v = m4view(camera_position, add(camera_position, forward), up)

    x = size / 2
    y = size / 2
    window.m_2 = m4trans(-x,-y, 0)
    window.model_m_2 = m4trans(0,0, size/5)


    draw()
    window.pending = requestAnimationFrame(timeStep)
}


function addNormals(geom) {
    geom.attributes.normal = []
    for(let i=0; i<geom.attributes.position.length; i+=1) {
        geom.attributes.normal.push([0,0,0])
    }
    for(let i=0; i<geom.triangles.length; i+=1) {
        let tri = geom.triangles[i]
        let p0 = geom.attributes.position[tri[0]]
        let p1 = geom.attributes.position[tri[1]]
        let p2 = geom.attributes.position[tri[2]]
        let e1 = sub(p1,p0)
        let e2 = sub(p2,p0)
        let n = cross(e1,e2)
        geom.attributes.normal[tri[0]] = add(geom.attributes.normal[tri[0]], n)
        geom.attributes.normal[tri[1]] = add(geom.attributes.normal[tri[1]], n)
        geom.attributes.normal[tri[2]] = add(geom.attributes.normal[tri[2]], n)
    }
    for(let i=0; i<geom.attributes.position.length; i+=1) {
        geom.attributes.normal[i] = normalize(geom.attributes.normal[i] )
    }
    
}



/**
 * Draw one frame
 */
function draw() {
    gl.clearColor(...IlliniBlue) // f(...[1,2,3]) means f(1,2,3)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.useProgram(program)
    gl.bindVertexArray(geom.vao)

    let lightdir = normalize([1,1,1])
    let halfway = [0,0,0]
    if (window.shiny == true) {
        halfway = normalize(add(lightdir, normalize(window.camera_position)))
    } else {
        halfway = [0,0,0]
    }


    gl.uniform3fv(gl.getUniformLocation(program, 'lightdir'), lightdir)
    gl.uniform3fv(gl.getUniformLocation(program, 'halfway'), halfway)
    gl.uniform3fv(gl.getUniformLocation(program, 'lightcolor'), [0.8,0.8,0.8])

    lightdir = normalize([1,4,5])

    if (window.shiny == true) {
        halfway = normalize(add(lightdir, normalize(window.camera_position)))
    } else {
        halfway = [0,0,0]
    }

    gl.uniform3fv(gl.getUniformLocation(program, 'lightdir2'), lightdir)
    gl.uniform3fv(gl.getUniformLocation(program, 'halfway2'), halfway)
    gl.uniform3fv(gl.getUniformLocation(program, 'lightcolor2'), [1,0.8,0])


    gl.uniform1f(gl.getUniformLocation(program, 'min_height'), window.min_height)
    gl.uniform1f(gl.getUniformLocation(program, 'max_height'), window.max_height)

    gl.uniform4fv(gl.getUniformLocation(program, 'fog_color'), IlliniBlue)

    if (fog){
        gl.uniform1f(gl.getUniformLocation(program, 'fog'), 1.0)
    } else {
        gl.uniform1f(gl.getUniformLocation(program, 'fog'), 0,0)
    }



    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'm_1'), false, m_1)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'm_2'), false, m_2)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'v'), false, v)
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'p'), false, p)

    gl.uniform1f(gl.getUniformLocation(program, 'terrain_or_model'), 1.0);

    gl.drawElements(geom.mode, geom.count, geom.type, 0)
    
    if (window.geom2){
        gl.useProgram(program_model)
        gl.bindVertexArray(geom2.vao)

        let scale = m4scale(0.05, 0.05, 0.05);

        gl.uniformMatrix4fv(gl.getUniformLocation(program_model, 'm_1'), false, model_m_2)
        gl.uniformMatrix4fv(gl.getUniformLocation(program_model, 'm_2'), false, scale)
        gl.uniformMatrix4fv(gl.getUniformLocation(program_model, 'v'), false, v)
        gl.uniformMatrix4fv(gl.getUniformLocation(program_model, 'p'), false, p)

        gl.uniform4fv(gl.getUniformLocation(program_model, 'fog_color'), IlliniBlue)

        gl.uniform3fv(gl.getUniformLocation(program_model, 'lightdir'), lightdir)
        gl.uniform3fv(gl.getUniformLocation(program_model, 'halfway'), halfway)
        gl.uniform3fv(gl.getUniformLocation(program_model, 'lightcolor'), [0.8,0.8,0.8])

        
        gl.uniform3fv(gl.getUniformLocation(program_model, 'lightdir2'), lightdir)
        gl.uniform3fv(gl.getUniformLocation(program_model, 'halfway2'), halfway)
        gl.uniform3fv(gl.getUniformLocation(program_model, 'lightcolor2'), [1,0.8,0])

        if (fog){
            gl.uniform1f(gl.getUniformLocation(program_model, 'fog'), 1.0)
        } else {
            gl.uniform1f(gl.getUniformLocation(program_model, 'fog'), 0,0)
        }

        gl.drawElements(geom2.mode, geom2.count, geom2.type, 0)
    }

}

function draw2() {
    gl.clearColor(...IlliniBlue) // f(...[1,2,3]) means f(1,2,3)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}

/**
 * Resizes the canvas to completely fill the screen
 */
function fillScreen() {
    let canvas = document.querySelector('canvas')
    document.body.style.margin = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    canvas.style.width = ''
    canvas.style.height = ''

    // to do: update aspect ratio of projection matrix here
    if (window.gl) {
        gl.viewport(0,0, canvas.width, canvas.height)
        window.p = m4perspNegZ(0.1, 10, 1, canvas.width, canvas.height)
    }
}

/**
 * Compile, link, other option-independent setup
 */
async function setup(event) {
    window.gl = document.querySelector('canvas').getContext('webgl2',
        {antialias: false, depth:true, preserveDrawingBuffer:true}
    )

    //////////////
    let vs = document.querySelector('#vert').textContent.trim()
    let fs = document.querySelector('#frag').textContent.trim()


    let vs_model = document.querySelector('#model_vert').textContent.trim()
    let fs_model = document.querySelector('#model_frag').textContent.trim()
    window.program_model = compileAndLinkGLSL(vs_model, fs_model)
    console.log(vs_model)
    console.log(fs_model)

    window.program = compileAndLinkGLSL(vs,fs)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    window.keysBeingPressed = { w : false, a : false, s : false, d : false}
    window.fog = false
    

    // image
    let img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = "farm.jpg";

    //obj
    loadObj();

    
    img.addEventListener('load', (event) => {

        let slot = 0;
        let texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + slot);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);


        gl.texImage2D(
            gl.TEXTURE_2D, // destination slot
            0, // the mipmap level this data provides; almost always 0
            gl.RGBA, // how to store it in graphics memory
            gl.RGBA, // how it is stored in the image object
            gl.UNSIGNED_BYTE, // size of a single pixel-color in HTML
            img, // source data
        );
        gl.generateMipmap(gl.TEXTURE_2D) // lets you use a mipmapping min filter
    })

    let bindPoint = gl.getUniformLocation(window.program, 'aTextureIPlanToUse')
    gl.uniform1i(bindPoint, 0) 


    fillScreen()
    setupScene()
}

async function loadObj(){
    fetch('example.obj')
        .then((response) => response.text())
        .then((text) => {
            let lines  = text.split('\n');
            if (text) {
                let model =
                {"triangles":[]
                ,"attributes":
                    {"position":[]
                    }
                }

                lines.forEach(function(line) {
                let parts = line.trim().split(/\s+/);
                if (parts[0] === 'f') {
                    model.triangles.push([
                        parseInt(parts[1]) -1,
                        parseInt(parts[2]) -1,
                        parseInt(parts[3]) -1
                    ]);
                } else if (parts[0] === 'v') {
                    model.attributes.position.push([
                        parseFloat(parts[1]) ,
                        parseFloat(parts[2]) ,
                        parseFloat(parts[3]),
                    ]);
                }
                });
                // or do something else with the object

                addNormals(model)
                if (model.triangles.length != 0) {
                    window.geom2 = setupGeomery(model) 
                }
            }
        }).catch(error => {
            console.error('Error fetching data:', error);
          });

}

/**
 * Generate geometry, render the scene
 */
async function setupScene() {

    window.resolution = 100
    window.slices = 100

    window.shiny = true
    window.color_map = true
    window.cliff = true

    let terrain = generateTerrain(window.resolution,window.slices, terrain_increment, terrain_displacement);

    addNormals(terrain)
    window.geom = setupGeomery(terrain)

    let size =  window.resolution * terrain_increment
    window.camera_position = [(1.5*size + 0.05),  0 , (size+0.05)]

    // up angle and 
    window.camera_r = [-0.5, 0]


    if (window.pending) {
        cancelAnimationFrame(window.pending)
    }
    window.pending = requestAnimationFrame(timeStep)
}

window.addEventListener('load', setup)
window.addEventListener('resize', fillScreen)
window.addEventListener('keydown', event => {   
                                                keysBeingPressed[event.key] = true 
                                                if (event.key == 'f') {
                                                    window.fog = ! window.fog
                                                }
                                            
                                            })
window.addEventListener('keyup', event => keysBeingPressed[event.key] = false)


// Generate Terrain
// increment: horizontal gap in the grid
// displacement: how high/low we move the plane in each iterartion
function generateTerrain(resolution, slices, increment, displacement) {
    let terrain =
    {"triangles":[]
    ,"attributes":
        {"position":[],
         "aTexCoord":[]
        }
    }

    let size = (resolution - 1) * increment 

    for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {

            let x = i * increment
            let y = j * increment
            
            terrain.attributes.position.push([x,y,0])
            terrain.attributes.aTexCoord.push([x/size, y/size])
        }   
    }


    for (let i = 0; i < slices; i++) {

        // random point
        let a = Math.random() * size
        let b = Math.random() * size
        let random_point = [a,b]

        // random normal
        let theta = 2 * Math.PI * Math.random();
        let dx = Math.sin(theta);
        let dy = Math.cos(theta);
        let normal = [dx, dy]

        // move vertex
        for (let j = 0; j < terrain.attributes.position.length; j++) {
            let point = [terrain.attributes.position[j][0], terrain.attributes.position[j][1]]

            if (  dot(sub(point, random_point), normal)  > 0 ){
                terrain.attributes.position[j][2] += displacement
            } else {
                terrain.attributes.position[j][2] -= displacement
            }
        }

    }

    let h = size * 0.4
    let max = -9999
    let min = 9999


    for (let i = 0; i < terrain.attributes.position.length; i++) {
        let height = terrain.attributes.position[i][2]
        if (height> max) {
            max = height
        } 

        if (height< min) {
            min = height
        } 
        
    }


    window.min_height = 9999
    window.max_height = -9999

    if (max != min && max!= -9999 & min != 9999) {
        for (let i = 0; i < terrain.attributes.position.length; i++) {
            let height = terrain.attributes.position[i][2]
            height = (height - min) / (max - min) * h - h/2
            terrain.attributes.position[i][2] = height
            if (height > max_height) {
                window.max_height = height;
            }
            if (height < min_height) {
                window.min_height = height;
            }
        }
    }

    console.log(max_height, min_height)


    for (var i = 0; i < resolution - 1; i++) {
        for (var j = 0; j < resolution - 1; j++) {
          var a = i * resolution + j;
          var b = i * resolution + j + 1;
          var c = (i + 1) * resolution + j;
          var d = (i + 1) * resolution + j + 1;
          terrain.triangles.push([c, b, a]);
          terrain.triangles.push([c, d, b]);
        }
    }
    
    return terrain;


}


