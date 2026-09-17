var data = [], chars = {}, colors = ['#6366f1','#22c55e','#f59e0b','#ef4444','#a855f7','#ec4899','#06b6d4','#eab308','#10b981','#f97316','#8b5cf6','#14b8a6','#d946ef','#84cc16','#3b82f6','#fbbf24','#6366f1','#f43f5e','#0ea5e9','#84cc16','#e11d48','#0ea5e9','#d946ef','#65a30d','#dc2626','#7c3aed','#0891b2','#ca8a04'];
var cIdx = 0, speed = 3, fontSize = 22, paused = true, anim = null, filter = 'todos', startTime = 0, timerInterval = null;

function parse(text) {
    var lines = text.split('\n');
    var result = [], ch = {};
    cIdx = 0;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line) continue;

        if (line[0] === '[' && line[line.length-1] === ']') {
            result.push({t: 's', v: line.slice(1, -1)});
            continue;
        }
        if (line.toUpperCase().indexOf('ESCENA') === 0 || line.toUpperCase().indexOf('VIDEO') === 0) {
            result.push({t: 's', v: line});
            continue;
        }
        if (line.match(/^(ESCENA|VIDEO)\s+\d+/i)) {
            result.push({t: 's', v: line});
            continue;
        }

        var partes = dividirLinea(line);

        for (var p = 0; p < partes.length; p++) {
            var parte = partes[p].trim();
            if (!parte) continue;

            var idx = parte.indexOf(':');
            if (idx > 0 && idx < 35) {
                var name = parte.substring(0, idx).trim();
                var txt = parte.substring(idx + 1).trim();

                if (name.length >= 2 && name === name.toUpperCase() && /[A-Z]/.test(name)) {
                    var norm = name;
                    if (name.indexOf('CORO') === 0) norm = 'CORO';
                    if (name.indexOf('VERSO') === 0) norm = 'VERSO';
                    if (name.indexOf('PRE CORO') === 0) norm = 'PRE CORO';
                    if (name.indexOf('PRISIONERO') === 0) norm = 'PRISIONEROS';
                    if (name.indexOf('PRISIONERA') === 0) norm = 'PRISIONEROS';
                    if (name.indexOf('TODOS') === 0) norm = 'TODOS';

                    result.push({t: 'c', n: norm, v: txt});
                    if (!ch[norm]) {
                        var colorAsignado = colors[cIdx % colors.length];
                        if (norm === 'CORO') colorAsignado = '#eab308';
                        else if (norm === 'PRE CORO') colorAsignado = '#f97316';
                        else if (norm === 'VERSO') colorAsignado = '#22c55e';
                        else if (norm === 'PRISIONEROS') colorAsignado = '#a855f7';
                        else if (norm === 'TODOS') colorAsignado = '#ec4899';
                        ch[norm] = {c: colorAsignado, n: 0};
                        cIdx++;
                    }
                    ch[norm].n++;
                    continue;
                }
            }
            result.push({t: 'd', v: parte});
        }
    }
    return {data: result, chars: ch};
}

function dividirLinea(linea) {
    var partes = [];
    var actual = '';

    for (var i = 0; i < linea.length; i++) {
        actual += linea[i];

        if (linea[i] === ':' && i < linea.length - 1) {
            var resto = linea.substring(i + 1).trimStart();
            var match = resto.match(/^([A-ZÁÉÍÓÚÑÜ][A-ZÁÉÍÓÚÑÜ\s\d]*?):/);
            if (match && match[1].trim().length >= 2) {
                partes.push(actual.trim());
                actual = '';
            }
        }
    }

    if (actual.trim()) partes.push(actual.trim());
    return partes.length > 0 ? partes : [linea];
}

function update() {
    var text = document.getElementById('guion').value;
    if (!text.trim()) {
        document.getElementById('pjs-list').innerHTML = '<div class="empty-state">Pega un guion para comenzar</div>';
        document.getElementById('btn-start').disabled = true;
        document.getElementById('stat-lines').textContent = '0';
        document.getElementById('stat-chars').textContent = '0';
        document.getElementById('stat-words').textContent = '0';
        document.getElementById('stat-time').textContent = '0';
        return;
    }

    var r = parse(text);
    data = r.data;
    chars = r.chars;

    var html = '';
    var n = 0;
    var totalWords = 0;

    for (var name in chars) {
        html += '<div class="character-tag"><div class="character-dot" style="background:' + chars[name].c + '"></div><label for="c-' + n + '">' + name + '</label><input type="color" id="c-' + n + '" value="' + chars[name].c + '" data-name="' + name + '"><span class="character-count">' + chars[name].n + '</span></div>';
        n++;
    }

    document.getElementById('pjs-list').innerHTML = html || '<div class="empty-state">Sin personajes detectados</div>';
    document.getElementById('btn-start').disabled = n === 0;

    for (var k = 0; k < data.length; k++) {
        totalWords += data[k].v.split(/\s+/).length;
    }

    document.getElementById('stat-lines').textContent = data.length;
    document.getElementById('stat-chars').textContent = n;
    document.getElementById('stat-words').textContent = totalWords;
    document.getElementById('stat-time').textContent = Math.ceil(totalWords / 130);

    var inputs = document.querySelectorAll('input[type="color"]');
    for (var j = 0; j < inputs.length; j++) {
        inputs[j].onchange = function() {
            chars[this.dataset.name].c = this.value;
            this.previousElementSibling.style.background = this.value;
        };
    }
}

function render() {
    var html = '';
    for (var i = 0; i < data.length; i++) {
        var d = data[i];
        var cls = 'tp-line', style = '', txt = '', hidden = '', dataAttr = 'data-idx="' + i + '"';

        if (d.t === 's') {
            cls += ' scene';
            txt = d.v;
            dataAttr += ' data-type="scene"';
        } else if (d.t === 'c') {
            if (filter !== 'todos' && d.n !== filter) hidden = ' hidden';
            cls += ' character' + hidden;
            style = 'color:' + (chars[d.n] ? chars[d.n].c : '#6366f1');
            txt = d.n + '<br><span style="font-weight:400;text-transform:none;color:var(--text-secondary);font-size:0.9em;">' + d.v + '</span>';
            dataAttr += ' data-type="character" data-name="' + d.n + '"';
        } else {
            if (filter !== 'todos') {
                for (var j = i - 1; j >= 0; j--) {
                    if (data[j].t === 's') break;
                    if (data[j].t === 'c' && data[j].n !== filter) { hidden = ' hidden'; break; }
                    if (data[j].t === 'c') break;
                }
            }
            cls += ' dialogue' + hidden;
            for (var j = i - 1; j >= 0; j--) {
                if (data[j].t === 'c') {
                    style = 'color:' + (chars[data[j].n] ? chars[data[j].n].c : '#a1a1aa');
                    dataAttr += ' data-type="dialogue" data-name="' + data[j].n + '"';
                    break;
                }
            }
            if (!style) style = 'color:var(--text-secondary)';
            txt = d.v;
        }

        html += '<div class="' + cls + '" ' + dataAttr + ' style="' + style + '">' + txt + '</div>';
    }
    document.getElementById('tp-text').innerHTML = html;
    document.getElementById('tp-text').scrollTop = 0;
    document.getElementById('tp-text').style.fontSize = fontSize + 'px';

    var lineas = document.querySelectorAll('#tp-text .tp-line');
    for (var k = 0; k < lineas.length; k++) {
        lineas[k].addEventListener('click', function(e) {
            e.stopPropagation();
            paused = true;
            document.getElementById('btn-play').innerHTML = '&#9654;';
            var prev = document.querySelector('#tp-text .tp-line.selected');
            if (prev) prev.classList.remove('selected');
            this.classList.add('selected');
        });
    }
}

function start() {
    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('tp').classList.add('active');

    var sel = document.getElementById('sel-pj');
    sel.innerHTML = '<option value="todos">Ver todos</option>';
    for (var n in chars) {
        sel.innerHTML += '<option value="' + n + '">' + n + '</option>';
    }
    sel.value = 'todos';
    filter = 'todos';
    paused = true;
    startTime = 0;
    document.getElementById('btn-play').innerHTML = '&#9654;';
    document.getElementById('tp-timer').textContent = '00:00';
    render();
    showToast('Presiona play o Espacio para comenzar');
}

function back() {
    paused = true;
    if (anim) cancelAnimationFrame(anim);
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('tp').classList.remove('active');
    document.getElementById('sidebar').style.display = '';
}

function showToast(t) {
    var el = document.getElementById('tp-msg');
    el.textContent = t;
    el.classList.add('show');
    clearTimeout(window._mt);
    window._mt = setTimeout(function() { el.classList.remove('show'); }, 2000);
}

function togglePlay() {
    paused = !paused;
    document.getElementById('btn-play').innerHTML = paused ? '&#9654;' : '&#9646;&#9646;';
    if (!paused) {
        if (startTime === 0) {
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 500);
        }
        animateScroll();
    }
}

function animateScroll() {
    if (paused) return;
    document.getElementById('tp-text').scrollTop += speed * 0.5;
    anim = requestAnimationFrame(animateScroll);
}

function updateTimer() {
    if (paused || startTime === 0) return;
    var diff = Date.now() - startTime;
    var seg = Math.floor(diff / 1000);
    var min = Math.floor(seg / 60);
    seg = seg % 60;
    document.getElementById('tp-timer').textContent = (min < 10 ? '0' : '') + min + ':' + (seg < 10 ? '0' : '') + seg;
}

function setSpeed(v) {
    speed = Math.max(1, Math.min(15, v));
    document.getElementById('vel').value = speed;
    document.getElementById('vel-val').textContent = speed;
}

function setSize(v) {
    fontSize = Math.max(14, Math.min(100, v));
    document.getElementById('size').value = fontSize;
    document.getElementById('size-val').textContent = fontSize;
    document.getElementById('tp-text').style.fontSize = fontSize + 'px';
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function loadExample() {
    document.getElementById('guion').value =
        'ESCENA 1: EL PRECIO DE LA ARENA\n\n' +
        'CLAUDIO: El de Batavia es un habil luchador, Marcelo. No creo haber visto jamas un gladiador mejor que este.\n' +
        'MARCELO: Verdaderamente lo es, mi querido CLAUDIO ambos son superiores a lo comun.\n' +
        'CLAUDIO: Pero ahi adentro tienen a uno mejor que todos ellos: El gran gladiador Macer.\n' +
        'PUEBLO: ¡Macer! ¡Macer! ¡Macer!\n\n' +
        'PUEBLO: ¡Que muera! ¡Que muera! ¡Que muera! EMPERADOR DECIO: Cumple la sentencia!\n' +
        'PUEBLO: ¡No! ¡Matalo! ¡Obedece al Cesar! CLAUDIO: ¿Que significa esto?\n' +
        'EMPERADOR DECIO: Que insolencia es esta, Macer? Te di la gloria. Te di el favor del Imperio.\n' +
        'MACER: Emperador Decio... Puedo enfrentar a las fieras y entregar mi propia vida si Roma lo exige.\n' +
        'CLAUDIO: ¡Insensato! ¡Tu Dios no tiene autoridad en el Coliseo!\n' +
        'EMPERADOR DECIO: Si tu espada no sirve a Roma, tu cuerpo servira para su entretenimiento. ¡Guardias!\n' +
        'MACER: Senor Jesus, recibe mi espiritu y permite que mi vida anuncie tu verdad.\n' +
        'CLAUDIO: Ven. Estos no merecen ni un pensamiento mas.';
    update();
    showToast('Ejemplo cargado');
}

function buscarEnEditor() {
    var textarea = document.getElementById('guion');
    var busqueda = document.getElementById('search-editor').value;
    var countEl = document.getElementById('search-editor-count');

    if (!busqueda || busqueda.length < 2) {
        countEl.textContent = '';
        return;
    }

    var texto = textarea.value;
    var inicio = textarea.selectionEnd;
    var idx = texto.indexOf(busqueda, inicio);

    if (idx === -1) {
        idx = texto.indexOf(busqueda, 0);
    }

    if (idx !== -1) {
        textarea.focus();
        textarea.setSelectionRange(idx, idx + busqueda.length);
        var lineas = texto.substring(0, idx).split('\n');
        var numLinea = lineas.length;
        var scrollTarget = (numLinea - 5) * 20;
        textarea.scrollTop = scrollTarget;

        var total = 0;
        var pos = 0;
        while ((pos = texto.indexOf(busqueda, pos)) !== -1) {
            total++;
            pos++;
        }
        countEl.textContent = '1 de ' + total;
    } else {
        countEl.textContent = 'Sin resultados';
    }
}

document.getElementById('guion').addEventListener('input', update);
document.getElementById('vel').addEventListener('input', function() { setSpeed(+this.value); });
document.getElementById('size').addEventListener('input', function() { setSize(+this.value); });
document.getElementById('btn-start').addEventListener('click', start);
document.getElementById('btn-back').addEventListener('click', back);
document.getElementById('btn-play').addEventListener('click', togglePlay);
document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);
document.getElementById('btn-example').addEventListener('click', loadExample);

document.getElementById('btn-copy').addEventListener('click', function() {
    var textarea = document.getElementById('guion');
    if (!textarea.value.trim()) return;
    navigator.clipboard.writeText(textarea.value).then(function() {
        var btn = document.getElementById('btn-copy');
        var original = btn.innerHTML;
        btn.innerHTML = '&#10003; Copiado';
        setTimeout(function() { btn.innerHTML = original; }, 1500);
    });
});

document.getElementById('btn-slower').addEventListener('click', function() { setSpeed(speed - 1); showToast('Velocidad: ' + speed); });
document.getElementById('btn-faster').addEventListener('click', function() { setSpeed(speed + 1); showToast('Velocidad: ' + speed); });
document.getElementById('btn-smaller').addEventListener('click', function() { setSize(fontSize - 2); showToast('Tamano: ' + fontSize); });
document.getElementById('btn-bigger').addEventListener('click', function() { setSize(fontSize + 2); showToast('Tamano: ' + fontSize); });
document.getElementById('sel-pj').addEventListener('change', function() { filter = this.value; render(); });
document.getElementById('tp-text').addEventListener('click', togglePlay);

document.getElementById('search-editor-btn').addEventListener('click', buscarEnEditor);
document.getElementById('search-editor').addEventListener('keydown', function(e) {
    if (e.code === 'Enter') { e.preventDefault(); buscarEnEditor(); }
});

document.onkeydown = function(e) {
    if (!document.getElementById('tp').classList.contains('active')) return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    if (e.code === 'ArrowUp' || e.code === 'ArrowRight') { e.preventDefault(); setSpeed(speed + 1); showToast('Velocidad: ' + speed); }
    if (e.code === 'ArrowDown' || e.code === 'ArrowLeft') { e.preventDefault(); setSpeed(speed - 1); showToast('Velocidad: ' + speed); }
    if (e.code === 'KeyF') { e.preventDefault(); toggleFullscreen(); }
    if (e.code === 'Escape') {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            back();
        }
    }
};

update();
