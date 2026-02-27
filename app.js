// ============================================================
// BG Maker — Background Image Generator
// ============================================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// State
const state = {
    width: 1200,
    height: 800,
    colors: ['#1a1a2e', '#16213e', '#0f3460'],
    stops: 2,
    gradientType: 'linear',
    angle: 135,
    centerX: 50,
    pattern: 'none',
    seed: 42,
    // Bubbles
    bubblesCount: 50, bubblesMin: 5, bubblesMax: 40,
    bubblesOpacity: 0.15, bubblesBlur: 0, bubblesColor: '#ffffff',
    // Honeycomb
    honeycombSize: 30, honeycombThickness: 1,
    honeycombOpacity: 0.15, honeycombStyle: 'stroke', honeycombColor: '#ffffff',
    // Dots
    dotsSpacing: 30, dotsSize: 3, dotsOpacity: 0.15, dotsColor: '#ffffff',
    // Lines
    linesSpacing: 20, linesThickness: 1, linesAngle: 45,
    linesOpacity: 0.15, linesColor: '#ffffff',
    // Waves
    wavesCount: 5, wavesAmplitude: 30, wavesFrequency: 3,
    wavesThickness: 2, wavesOpacity: 0.15, wavesColor: '#ffffff',
};

// Seeded PRNG (mulberry32)
function mulberry32(a) {
    return function() {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// ============================================================
// Rendering
// ============================================================

function render() {
    canvas.width = state.width;
    canvas.height = state.height;

    drawGradient();
    drawPattern();

    // Scale preview
    canvas.style.width = '';
    canvas.style.height = '';
}

function drawGradient() {
    let grad;
    const w = state.width, h = state.height;

    const cx = w * state.centerX / 100;
    const cy = h / 2;

    if (state.gradientType === 'radial') {
        const r = Math.sqrt(Math.max(cx, w - cx) ** 2 + Math.max(cy, h - cy) ** 2);
        grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    } else {
        const a = state.angle * Math.PI / 180;
        // Project canvas corners onto the gradient direction to find exact needed length
        const cosA = Math.cos(a), sinA = Math.sin(a);
        const corners = [
            [0,0], [w,0], [w,h], [0,h]
        ];
        let minProj = Infinity, maxProj = -Infinity;
        for (const [px, py] of corners) {
            const proj = (px - cx) * cosA + (py - cy) * sinA;
            if (proj < minProj) minProj = proj;
            if (proj > maxProj) maxProj = proj;
        }
        const x1 = cx + cosA * minProj;
        const y1 = cy + sinA * minProj;
        const x2 = cx + cosA * maxProj;
        const y2 = cy + sinA * maxProj;
        grad = ctx.createLinearGradient(x1, y1, x2, y2);
    }

    if (state.stops === 2) {
        grad.addColorStop(0, state.colors[0]);
        grad.addColorStop(1, state.colors[1]);
    } else {
        grad.addColorStop(0, state.colors[0]);
        grad.addColorStop(0.5, state.colors[1]);
        grad.addColorStop(1, state.colors[2]);
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, state.width, state.height);
}

function drawPattern() {
    switch (state.pattern) {
        case 'bubbles': drawBubbles(); break;
        case 'honeycomb': drawHoneycomb(); break;
        case 'dots': drawDots(); break;
        case 'lines': drawLines(); break;
        case 'waves': drawWaves(); break;
    }
}

function drawBubbles() {
    const rng = mulberry32(state.seed);
    const w = state.width, h = state.height;

    ctx.save();
    ctx.globalAlpha = state.bubblesOpacity;
    if (state.bubblesBlur > 0) ctx.filter = `blur(${state.bubblesBlur}px)`;
    ctx.fillStyle = state.bubblesColor;

    for (let i = 0; i < state.bubblesCount; i++) {
        const x = rng() * w;
        const y = rng() * h;
        const r = state.bubblesMin + rng() * (state.bubblesMax - state.bubblesMin);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

function drawHoneycomb() {
    const s = state.honeycombSize;
    const w = state.width, h = state.height;
    const sqrt3 = Math.sqrt(3);

    ctx.save();
    ctx.globalAlpha = state.honeycombOpacity;
    ctx.strokeStyle = state.honeycombColor;
    ctx.fillStyle = state.honeycombColor;
    ctx.lineWidth = state.honeycombThickness;

    function hexPath(cx, cy) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 3 * i - Math.PI / 6;
            const x = cx + s * Math.cos(angle);
            const y = cy + s * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
    }

    const colW = s * 1.5;
    const rowH = s * sqrt3;
    const cols = Math.ceil(w / colW) + 2;
    const rows = Math.ceil(h / rowH) + 2;

    for (let col = -1; col < cols; col++) {
        for (let row = -1; row < rows; row++) {
            const cx = col * colW;
            const cy = row * rowH + (col % 2 ? rowH / 2 : 0);
            hexPath(cx, cy);
            if (state.honeycombStyle === 'fill') ctx.fill();
            else ctx.stroke();
        }
    }

    ctx.restore();
}

function drawDots() {
    const sp = state.dotsSpacing;
    const w = state.width, h = state.height;

    ctx.save();
    ctx.globalAlpha = state.dotsOpacity;
    ctx.fillStyle = state.dotsColor;

    for (let x = sp / 2; x < w; x += sp) {
        for (let y = sp / 2; y < h; y += sp) {
            ctx.beginPath();
            ctx.arc(x, y, state.dotsSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

function drawLines() {
    const sp = state.linesSpacing;
    const w = state.width, h = state.height;
    const a = state.linesAngle * Math.PI / 180;

    ctx.save();
    ctx.globalAlpha = state.linesOpacity;
    ctx.strokeStyle = state.linesColor;
    ctx.lineWidth = state.linesThickness;

    // Diagonal from canvas center
    const diag = Math.sqrt(w * w + h * h);
    const perpX = Math.cos(a + Math.PI / 2);
    const perpY = Math.sin(a + Math.PI / 2);
    const dirX = Math.cos(a);
    const dirY = Math.sin(a);
    const count = Math.ceil(diag / sp) + 2;

    ctx.translate(w / 2, h / 2);

    for (let i = -count; i <= count; i++) {
        const ox = perpX * i * sp;
        const oy = perpY * i * sp;
        ctx.beginPath();
        ctx.moveTo(ox - dirX * diag, oy - dirY * diag);
        ctx.lineTo(ox + dirX * diag, oy + dirY * diag);
        ctx.stroke();
    }

    ctx.restore();
}

function drawWaves() {
    const w = state.width, h = state.height;
    const count = state.wavesCount;
    const amp = state.wavesAmplitude;
    const freq = state.wavesFrequency;

    ctx.save();
    ctx.globalAlpha = state.wavesOpacity;
    ctx.strokeStyle = state.wavesColor;
    ctx.lineWidth = state.wavesThickness;

    const spacing = h / (count + 1);

    for (let i = 1; i <= count; i++) {
        const baseY = spacing * i;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
            const y = baseY + Math.sin((x / w) * Math.PI * 2 * freq) * amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    ctx.restore();
}

// ============================================================
// Controls Wiring
// ============================================================

// Preset
const presetEl = document.getElementById('preset');
const widthEl = document.getElementById('width');
const heightEl = document.getElementById('height');

presetEl.addEventListener('change', () => {
    const v = presetEl.value;
    if (v !== 'custom') {
        const [w, h] = v.split('x').map(Number);
        widthEl.value = w; heightEl.value = h;
        state.width = w; state.height = h;
        render();
    }
});

widthEl.addEventListener('input', () => {
    state.width = parseInt(widthEl.value) || 100;
    presetEl.value = 'custom';
    render();
});

heightEl.addEventListener('input', () => {
    state.height = parseInt(heightEl.value) || 100;
    presetEl.value = 'custom';
    render();
});

// Color stops toggle
document.querySelectorAll('[data-stops]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-stops]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.stops = parseInt(btn.dataset.stops);
        document.querySelector('[data-index="2"]').style.display = state.stops === 3 ? '' : 'none';
        render();
    });
});

// Color inputs
for (let i = 0; i < 3; i++) {
    const picker = document.getElementById(`color${i}`);
    const hex = document.getElementById(`hex${i}`);

    picker.addEventListener('input', () => {
        hex.value = picker.value;
        state.colors[i] = picker.value;
        render();
    });

    hex.addEventListener('input', () => {
        const v = hex.value;
        if (/^#[0-9a-fA-F]{6}$/.test(v)) {
            picker.value = v;
            state.colors[i] = v;
            render();
        }
    });
}

// Gradient type
document.querySelectorAll('[data-gradient]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-gradient]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.gradientType = btn.dataset.gradient;
        document.getElementById('angle-field').style.display =
            state.gradientType === 'linear' ? '' : 'none';
        render();
    });
});

// Angle
const angleEl = document.getElementById('angle');
angleEl.addEventListener('input', () => {
    state.angle = parseInt(angleEl.value);
    document.getElementById('angle-val').textContent = state.angle + '°';
    render();
});

// Pattern selector
const patternEl = document.getElementById('pattern');
patternEl.addEventListener('change', () => {
    state.pattern = patternEl.value;
    document.querySelectorAll('.pattern-controls').forEach(el => el.style.display = 'none');
    const ctrl = document.getElementById(`ctrl-${state.pattern}`);
    if (ctrl) ctrl.style.display = '';
    render();
});

// Helper: wire up a range slider
function wireRange(id, stateKey, display, suffix = '', transform = null) {
    const el = document.getElementById(id);
    const valEl = document.getElementById(id + '-val');
    if (!el) return;
    el.addEventListener('input', () => {
        let v = parseFloat(el.value);
        if (transform) v = transform(v);
        state[stateKey] = v;
        if (valEl) valEl.textContent = display ? display(v) : v + suffix;
        render();
    });
}

// Helper: wire up a color input pair
function wireColor(idPrefix, stateKey) {
    const picker = document.getElementById(idPrefix);
    const hex = document.getElementById(idPrefix + '-hex');
    if (!picker || !hex) return;

    picker.addEventListener('input', () => {
        hex.value = picker.value;
        state[stateKey] = picker.value;
        render();
    });
    hex.addEventListener('input', () => {
        if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) {
            picker.value = hex.value;
            state[stateKey] = hex.value;
            render();
        }
    });
}

// Helper: wire number input
function wireNumber(id, stateKey) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
        state[stateKey] = parseInt(el.value) || 1;
        render();
    });
}

// Gradient center
wireRange('center-x', 'centerX', v => v + '%');

// Bubbles
wireRange('bubbles-count', 'bubblesCount', null, '');
wireNumber('bubbles-min', 'bubblesMin');
wireNumber('bubbles-max', 'bubblesMax');
wireRange('bubbles-opacity', 'bubblesOpacity', v => v.toFixed(2), '', v => v / 100);
wireRange('bubbles-blur', 'bubblesBlur', v => v + 'px');
wireColor('bubbles-color', 'bubblesColor');

document.getElementById('bubbles-randomize')?.addEventListener('click', () => {
    state.seed = Math.floor(Math.random() * 100000);
    render();
});

// Honeycomb
wireRange('honeycomb-size', 'honeycombSize');
wireRange('honeycomb-thickness', 'honeycombThickness');
wireRange('honeycomb-opacity', 'honeycombOpacity', v => v.toFixed(2), '', v => v / 100);
wireColor('honeycomb-color', 'honeycombColor');

document.querySelectorAll('[data-honeycomb-style]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-honeycomb-style]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.honeycombStyle = btn.dataset.honeycombStyle;
        render();
    });
});

// Dots
wireRange('dots-spacing', 'dotsSpacing');
wireRange('dots-size', 'dotsSize');
wireRange('dots-opacity', 'dotsOpacity', v => v.toFixed(2), '', v => v / 100);
wireColor('dots-color', 'dotsColor');

// Lines
wireRange('lines-spacing', 'linesSpacing');
wireRange('lines-thickness', 'linesThickness');
wireRange('lines-angle', 'linesAngle', v => v + '°');
wireRange('lines-opacity', 'linesOpacity', v => v.toFixed(2), '', v => v / 100);
wireColor('lines-color', 'linesColor');

// Waves
wireRange('waves-count', 'wavesCount');
wireRange('waves-amplitude', 'wavesAmplitude');
wireRange('waves-frequency', 'wavesFrequency');
wireRange('waves-thickness', 'wavesThickness');
wireRange('waves-opacity', 'wavesOpacity', v => v.toFixed(2), '', v => v / 100);
wireColor('waves-color', 'wavesColor');

// ============================================================
// Export
// ============================================================

function download(format) {
    const type = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpeg' ? 0.92 : undefined;
    const ext = format === 'jpeg' ? 'jpg' : 'png';

    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bg-${state.width}x${state.height}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    }, type, quality);
}

document.getElementById('export-jpeg').addEventListener('click', () => download('jpeg'));
document.getElementById('export-png').addEventListener('click', () => download('png'));

// ============================================================
// Init
// ============================================================

render();
