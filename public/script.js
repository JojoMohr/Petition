/////////////////////// CANVAS ////////////////////

let canvas = document.querySelector("canvas")
let ctx = canvas.getContext("2d");
const submitButton = document.querySelector("#submit")
    // const hiddenInput = document.querySelector("#hidden").value

// SET COORDINATES //////////
let coord = { x: 0, y: 0 };

////////// Start registering our drawing////////////////
canvas.addEventListener("mousedown", start);

function start(event) {
    canvas.addEventListener('mousemove', draw);
    reposition(event);
    console.log(coord)
}

function reposition(event) {
    coord.x = event.clientX - canvas.offsetLeft - 12;
    coord.y = event.clientY - canvas.offsetTop + 30;
}
////////////////// stop the drawing ////////////////////////
canvas.addEventListener("mouseup", stop);

function stop() {
    canvas.removeEventListener('mousemove', draw);
}

//////////////// DRAW FUNCTION //////////////////////////////
let drawn = false;

function draw(event) {
    // Set drawn to true 
    drawn = true;
    // begin a new path.
    ctx.beginPath();
    // set the line width to X pixels.
    ctx.lineWidth = 3;
    //We change the line endings to round.
    ctx.lineCap = 'round';
    // Set COLOR 
    ctx.strokeStyle = 'white';
    //We change our position to the initial position
    // and move the canvas point to the moved position.
    ctx.moveTo(coord.x, coord.y);
    reposition(event);
    ctx.lineTo(coord.x, coord.y);
    ctx.stroke();
    //LOGGING OUR POSITION
    // console.log(coord)
    // console.log("DRAW FUNCTION GOT CALLED")
}
/////// ADD IMAGE URL DATA FOR THE CANVAS //////////////////
submitButton.addEventListener("click", signData)

function signData() {
    if (!drawn) return
    document.querySelector('[type="hidden"]').value = canvas.toDataURL();
    console.log(canvas.toDataURL());
}