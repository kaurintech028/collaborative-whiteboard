const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const socket = io();

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 120;

let drawing = false;
let color = document.getElementById("colorPicker").value;

let history = [];
let redoStack = [];

document.getElementById("colorPicker").addEventListener("change", (e) => {
  color = e.target.value;
});

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mousemove", draw);

function startDraw() {
  drawing = true;
  ctx.beginPath();
}

function stopDraw() {
  if (drawing) {
    drawing = false;
    history.push(canvas.toDataURL());
    redoStack = []; // clear redo stack
  }
}

function draw(e) {
  if (!drawing) return;

  const x = e.clientX;
  const y = e.clientY;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fill();

  socket.emit("draw", { x, y, color });
}

socket.on("draw", (data) => {
  ctx.fillStyle = data.color;
  ctx.beginPath();
  ctx.arc(data.x, data.y, 3, 0, Math.PI * 2);
  ctx.fill();
});

// --------------------------
// CLEAR BOARD
// --------------------------
document.getElementById("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit("clear");
  history = [];
  redoStack = [];
});

socket.on("clear", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  history = [];
  redoStack = [];
});

// --------------------------
// UNDO & REDO
// --------------------------
document.getElementById("undoBtn").addEventListener("click", () => {
  if (history.length > 0) {
    redoStack.push(history.pop());
    let imgData = history[history.length - 1];
    restoreCanvas(imgData);
    socket.emit("undo", imgData);
  }
});

document.getElementById("redoBtn").addEventListener("click", () => {
  if (redoStack.length > 0) {
    let imgData = redoStack.pop();
    history.push(imgData);
    restoreCanvas(imgData);
    socket.emit("redo", imgData);
  }
});

socket.on("undo", (imgData) => restoreCanvas(imgData));
socket.on("redo", (imgData) => restoreCanvas(imgData));

function restoreCanvas(imgData) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!imgData) return;
  const img = new Image();
  img.src = imgData;
  img.onload = () => ctx.drawImage(img, 0, 0);
}

// --------------------------
// SAVE DRAWING
// --------------------------
document.getElementById("saveBtn").addEventListener("click", () => {
  const image = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = image;
  link.download = "whiteboard_drawing.png";
  link.click();
});
