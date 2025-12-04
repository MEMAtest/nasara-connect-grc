import { createCanvas } from 'canvas';
import fs from 'fs';

const size = 512;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Background - dark with subtle gradient
const bgGradient = ctx.createLinearGradient(0, 0, size, size);
bgGradient.addColorStop(0, '#0f172a');
bgGradient.addColorStop(1, '#1e293b');

// Rounded rectangle background
ctx.beginPath();
ctx.roundRect(0, 0, size, size, 80);
ctx.fillStyle = bgGradient;
ctx.fill();

// 3D N settings
const letterX = 80;
const letterY = 60;
const letterWidth = 350;
const letterHeight = 390;
const strokeWidth = 70;
const depth = 25;

// Colors
const mainColor = '#14b8a6'; // teal-500
const lightColor = '#5eead4'; // teal-300
const darkColor = '#0d9488'; // teal-600
const shadowColor = '#134e4a'; // teal-900
const glowColor = 'rgba(20, 184, 166, 0.6)';

// Draw glow effect
ctx.shadowColor = glowColor;
ctx.shadowBlur = 40;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;

// Function to draw N shape
function drawN(offsetX, offsetY, color) {
  ctx.beginPath();
  ctx.fillStyle = color;

  // Left vertical bar
  ctx.moveTo(letterX + offsetX, letterY + offsetY);
  ctx.lineTo(letterX + strokeWidth + offsetX, letterY + offsetY);
  ctx.lineTo(letterX + strokeWidth + offsetX, letterY + letterHeight + offsetY);
  ctx.lineTo(letterX + offsetX, letterY + letterHeight + offsetY);
  ctx.closePath();
  ctx.fill();

  // Right vertical bar
  ctx.beginPath();
  ctx.moveTo(letterX + letterWidth - strokeWidth + offsetX, letterY + offsetY);
  ctx.lineTo(letterX + letterWidth + offsetX, letterY + offsetY);
  ctx.lineTo(letterX + letterWidth + offsetX, letterY + letterHeight + offsetY);
  ctx.lineTo(letterX + letterWidth - strokeWidth + offsetX, letterY + letterHeight + offsetY);
  ctx.closePath();
  ctx.fill();

  // Diagonal connector
  ctx.beginPath();
  ctx.moveTo(letterX + offsetX, letterY + offsetY);
  ctx.lineTo(letterX + strokeWidth + 20 + offsetX, letterY + offsetY);
  ctx.lineTo(letterX + letterWidth + offsetX, letterY + letterHeight - 60 + offsetY);
  ctx.lineTo(letterX + letterWidth + offsetX, letterY + letterHeight + offsetY);
  ctx.lineTo(letterX + letterWidth - strokeWidth - 20 + offsetX, letterY + letterHeight + offsetY);
  ctx.lineTo(letterX + offsetX, letterY + 60 + offsetY);
  ctx.closePath();
  ctx.fill();
}

// Draw shadow/depth layers (back to front)
ctx.shadowBlur = 0;
for (let i = depth; i > 0; i--) {
  const shade = i === depth ? shadowColor : darkColor;
  drawN(i, i, shade);
}

// Draw main N with glow
ctx.shadowColor = glowColor;
ctx.shadowBlur = 30;
drawN(0, 0, mainColor);

// Draw highlight on top edge
ctx.shadowBlur = 0;
const highlightGradient = ctx.createLinearGradient(letterX, letterY, letterX, letterY + 50);
highlightGradient.addColorStop(0, lightColor);
highlightGradient.addColorStop(1, mainColor);

// Top highlight strip
ctx.beginPath();
ctx.fillStyle = highlightGradient;
ctx.moveTo(letterX, letterY);
ctx.lineTo(letterX + strokeWidth, letterY);
ctx.lineTo(letterX + strokeWidth, letterY + 20);
ctx.lineTo(letterX, letterY + 20);
ctx.closePath();
ctx.fill();

// Right bar top highlight
ctx.beginPath();
ctx.moveTo(letterX + letterWidth - strokeWidth, letterY);
ctx.lineTo(letterX + letterWidth, letterY);
ctx.lineTo(letterX + letterWidth, letterY + 20);
ctx.lineTo(letterX + letterWidth - strokeWidth, letterY + 20);
ctx.closePath();
ctx.fill();

// Add subtle inner glow/shine
ctx.globalCompositeOperation = 'overlay';
const shineGradient = ctx.createLinearGradient(0, 0, size, size);
shineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
shineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
shineGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
ctx.fillStyle = shineGradient;
ctx.fillRect(0, 0, size, size);

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('src/app/icon.png', buffer);
fs.writeFileSync('src/app/apple-icon.png', buffer);

// Create smaller favicon
const smallCanvas = createCanvas(32, 32);
const smallCtx = smallCanvas.getContext('2d');
smallCtx.drawImage(canvas, 0, 0, 32, 32);
// For favicon.ico we'll just copy the PNG - browsers handle it

console.log('Generated bold 3D N favicon!');
console.log('- src/app/icon.png (512x512)');
console.log('- src/app/apple-icon.png (512x512)');
