console.log("TEST")

let canvas = document.querySelector("canvas")
let ctx = canvas.getContext("2d");
const submitButton = document.querySelector("#submit")
    // const hiddenInput = document.querySelector("#hidden").value



/////// CANVAS ////////////////////
function signData() {
    document.querySelector('[type="hidden"]').value = canvas.toDataURL();
    console.log(canvas.toDataURL());
}
submitButton.addEventListener("click", signData)



//////////////////////////////////////////





// SET COORDINATES //////////
let coord = { x: 0, y: 0 };
canvas.addEventListener("mousedown", start);

function start(event) {
    canvas.addEventListener('mousemove', draw);
    reposition(event);
    console.log(coord)

}

function reposition(event) {
    coord.x = event.clientX - canvas.offsetLeft;
    coord.y = event.clientY - canvas.offsetTop;
}

canvas.addEventListener("mouseup", stop);

function stop() {
    canvas.removeEventListener('mousemove', draw);
}

function draw(event) {
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
    //LOGGING OUT POSITION
    console.log(coord)


}