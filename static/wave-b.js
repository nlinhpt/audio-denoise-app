const canvas = document.getElementById('wave-bg');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let t = 0;
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let amp = 40 + 15 * Math.sin(t/80);
    let freq = 0.013 + 0.006 * Math.cos(t/160);
    ctx.save();
    ctx.globalAlpha = 0.18;
    for (let j=0; j<5; j++) {
        ctx.beginPath();
        for (let x=0; x<=canvas.width; x+=4) {
            let y = Math.sin(x*freq + t/30 + j*0.9) * amp + canvas.height/2 + j*32 - 64;
            ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsl(${180+j*30}, 95%, 62%)`;
        ctx.lineWidth = 2.1-j*0.3;
        ctx.stroke();
    }
    ctx.restore();
    t += 1.8;
    requestAnimationFrame(draw);
}
draw();