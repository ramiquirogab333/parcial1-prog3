'use strict';

/**
 * QA del Paso 7 contra la app desplegada (https://libreria.francogagliardi.me).
 * Usa Chrome headless + DevTools Protocol, sin dependencias.
 *
 * Escrituras permitidas en esta corrida: como máximo 1 cliente y 1 venta,
 * marcados como "QA Prueba Paso 7". No se crean libros.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn, spawnSync } = require('child_process');

const BASE = 'https://libreria.francogagliardi.me';
const OUT = 'C:\\Users\\Santiago\\Desktop\\parcial1-prog3\\evidence\\paso-7';
const TEMP = 'C:\\Users\\Santiago\\AppData\\Local\\Temp\\opencode\\qa-paso7';
const PORT = 9333;
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HARD_LIMIT_MS = 8 * 60 * 1000;

const RESULT_FILE = path.join(OUT, 'qa-resultados.json');
const LOG_FILE = path.join(OUT, 'qa-ejecucion.txt');
const CONSOLE_FILE = path.join(OUT, 'qa-consola-red.json');
const CAPTURAS = path.join(OUT, 'capturas');

const startedAt = new Date();
const results = {
  base: BASE,
  startedAt: startedAt.toISOString(),
  finishedAt: null,
  estado: 'en curso',
  baseline: null,
  creado: {},
  pasos: [],
  erroresDeConsola: [],
  excepciones: [],
  red: [],
  notas: []
};

let logBuffer = [];
function log(linea) {
  const texto = '[' + new Date().toISOString() + '] ' + linea;
  logBuffer.push(texto);
  try { fs.appendFileSync(LOG_FILE, texto + '\n'); } catch (e) { /* sin log */ }
  console.log(texto);
}

function guardarResultados() {
  fs.writeFileSync(RESULT_FILE, JSON.stringify(results, null, 2), 'utf8');
}

function guardarConsolaRed() {
  fs.writeFileSync(CONSOLE_FILE, JSON.stringify({
    erroresDeConsola: results.erroresDeConsola,
    excepciones: results.excepciones,
    red: results.red
  }, null, 2), 'utf8');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function apiGet(ruta) {
  const respuesta = await fetch(BASE + '/api' + ruta, { headers: { Accept: 'application/json' } });
  const texto = await respuesta.text();
  if (!respuesta.ok) {
    throw new Error('GET ' + ruta + ' -> ' + respuesta.status + ' ' + texto.slice(0, 200));
  }
  return JSON.parse(texto);
}

async function conReintento(fn, intentos = 3, espera = 700) {
  let ultimo;
  for (let i = 0; i < intentos; i += 1) {
    try { return await fn(); } catch (e) { ultimo = e; await sleep(espera); }
  }
  throw ultimo;
}

// ---------- Cliente CDP ----------

let ws = null;
let contadorId = 0;
const pendientes = new Map();
const requests = [];
const responses = {};
const requestPorId = {};
let faseRed = 'normal';

function iniciarCliente(socket) {
  ws = socket;
  ws.addEventListener('message', (evento) => {
    let mensaje;
    try { mensaje = JSON.parse(typeof evento.data === 'string' ? evento.data : evento.data.toString()); }
    catch (e) { return; }

    if (mensaje.id) {
      const pendiente = pendientes.get(mensaje.id);
      if (!pendiente) { return; }
      pendientes.delete(mensaje.id);
      clearTimeout(pendiente.temporizador);
      if (mensaje.error) { pendiente.rechazar(new Error(mensaje.error.message)); }
      else { pendiente.resolver(mensaje.result); }
      return;
    }
    alEvento(mensaje);
  });
}

function send(method, params) {
  const id = ++contadorId;
  return new Promise((resolver, rechazar) => {
    const temporizador = setTimeout(() => {
      if (pendientes.has(id)) {
        pendientes.delete(id);
        rechazar(new Error('Timeout CDP: ' + method));
      }
    }, 30000);
    pendientes.set(id, { resolver, rechazar, temporizador });
    ws.send(JSON.stringify({ id, method, params: params || {} }));
  });
}

function alEvento(mensaje) {
  const p = mensaje.params || {};

  if (mensaje.method === 'Runtime.consoleAPICalled') {
    const texto = (p.args || []).map((a) => {
      if (a.value !== undefined) { return String(a.value); }
      if (a.description !== undefined) { return String(a.description); }
      return a.type || '';
    }).join(' ');
    const entrada = { ts: new Date().toISOString(), tipo: p.type, texto };
    if (p.type === 'error') { results.erroresDeConsola.push(entrada); }
    return;
  }

  if (mensaje.method === 'Runtime.exceptionThrown') {
    const d = p.exceptionDetails || {};
    results.excepciones.push({
      ts: new Date().toISOString(),
      texto: (d.exception && (d.exception.description || d.exception.value)) || d.text || 'excepción'
    });
    return;
  }

  if (mensaje.method === 'Network.requestWillBeSent') {
    const r = p.request || {};
    const entrada = {
      ts: new Date().toISOString(),
      fase: faseRed,
      requestId: p.requestId,
      metodo: r.method,
      url: r.url,
      postData: r.postData || null
    };
    requests.push(entrada);
    requestPorId[p.requestId] = entrada;
    if (r.url.indexOf('/api/') !== -1) {
      results.red.push({
        ts: entrada.ts,
        fase: faseRed,
        metodo: r.method,
        url: r.url,
        postData: r.postData || null,
        status: null
      });
      entrada.indiceResultado = results.red.length - 1;
    }
    return;
  }

  if (mensaje.method === 'Network.responseReceived') {
    const r = p.response || {};
    responses[p.requestId] = r.status;
    const entrada = requestPorId[p.requestId];
    if (entrada && entrada.indiceResultado !== undefined) {
      results.red[entrada.indiceResultado].status = r.status;
      results.red[entrada.indiceResultado].mimeType = r.mimeType;
    }
    return;
  }

  if (mensaje.method === 'Network.loadingFailed') {
    const entrada = requestPorId[p.requestId];
    if (entrada) {
      responses[p.requestId] = 'FALLO';
      if (entrada.indiceResultado !== undefined) {
        results.red[entrada.indiceResultado].status = 'FALLO';
        results.red[entrada.indiceResultado].error = p.errorText;
      }
    }
  }
}

async function js(expression) {
  const r = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
    userGesture: true
  });
  if (r.exceptionDetails) {
    const d = r.exceptionDetails;
    throw new Error('JS: ' + ((d.exception && d.exception.description) || d.text || 'error'));
  }
  return r.result.value;
}

async function esperar(condicion, timeout = 20000, intervalo = 250) {
  const inicio = Date.now();
  let ultimo = null;
  while (Date.now() - inicio < timeout) {
    try {
      const valor = await condicion();
      if (valor) { return valor; }
      ultimo = valor;
    } catch (e) {
      ultimo = e;
    }
    await sleep(intervalo);
  }
  throw new Error('Timeout esperando condición. Último: ' + String(ultimo));
}

async function captura(nombre) {
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(path.join(CAPTURAS, nombre), Buffer.from(r.data, 'base64'));
  const paso = results.pasos[results.pasos.length - 1];
  if (paso) { paso.capturas.push('capturas/' + nombre); }
  log('Captura guardada: ' + nombre);
}

function pasoNuevo(id, nombre) {
  const paso = { id, nombre, inicio: new Date().toISOString(), checks: [], notas: [], capturas: [], error: null };
  results.pasos.push(paso);
  guardarResultados();
  log('--- ' + id + ' · ' + nombre + ' ---');
  return paso;
}

function check(paso, descripcion, esperado, observado, ok) {
  const registro = {
    descripcion,
    esperado: String(esperado),
    observado: typeof observado === 'string' ? observado : JSON.stringify(observado),
    ok: Boolean(ok)
  };
  paso.checks.push(registro);
  log((ok ? 'OK   ' : 'FALLA') + ' · ' + descripcion + ' | esperado: ' + registro.esperado + ' | observado: ' + registro.observado);
  return ok;
}

function nota(paso, texto) {
  paso.notas.push(texto);
  log('NOTA · ' + texto);
}

// ---------- Helpers de UI ----------

async function ir(url) {
  await send('Page.navigate', { url });
  await esperar(async () => (await js('document.readyState')) === 'complete', 25000);
  await sleep(800);
}

async function esperarApp() {
  return esperar(async () => {
    const estado = await js(`(() => {
      const filas = document.querySelectorAll('#cuerpo-tabla-catalogo tr').length;
      const error = (document.getElementById('mensaje-catalogo-error') || {}).textContent || '';
      return { filas, error };
    })()`);
    if (estado.error && estado.error.length > 0) { return estado; }
    if (estado.filas > 0) { return estado; }
    return null;
  }, 30000);
}

async function mostrarVista(nombre) {
  await js(`(() => { const a = document.getElementById('enlace-${nombre}'); if (a) { a.click(); } return true; })()`);
  await esperar(async () => await js(`document.getElementById('vista-${nombre}').hidden === false`), 5000);
  await sleep(300);
}

async function filas(selector) {
  return js(`Array.from(document.querySelectorAll(${JSON.stringify(selector)})).map(tr => Array.from(tr.cells).map(td => td.textContent))`);
}

async function texto(id) {
  return js(`(document.getElementById(${JSON.stringify(id)}) || {}).textContent || ''`);
}

async function setValor(id, valor) {
  await js(`(() => {
    const e = document.getElementById(${JSON.stringify(id)});
    if (!e) { return false; }
    e.value = ${JSON.stringify(valor)};
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
}

async function buscar(textoBusqueda) {
  await js(`(() => {
    const i = document.getElementById('buscador-catalogo');
    i.value = ${JSON.stringify(textoBusqueda)};
    i.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await sleep(500);
}

async function esperarMensaje(id, fragmento, timeout = 20000) {
  return esperar(async () => {
    const t = await texto(id);
    return t && t.indexOf(fragmento) !== -1 ? t : null;
  }, timeout);
}

function marcaRed() { return requests.length; }

async function esperarRespuesta(metodo, parteUrl, desde, timeout = 25000) {
  return esperar(async () => {
    for (let i = requests.length - 1; i >= desde; i -= 1) {
      const r = requests[i];
      if (r.metodo === metodo && r.url.indexOf(parteUrl) !== -1 && responses[r.requestId] !== undefined) {
        return { request: r, status: responses[r.requestId] };
      }
    }
    return null;
  }, timeout);
}

async function pulsar(key, code, vk) {
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown', key, code,
    windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk
  });
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp', key, code,
    windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(CAPTURAS, { recursive: true });
  fs.writeFileSync(LOG_FILE, '');
  guardarResultados();

  const limite = setTimeout(async () => {
    log('LÍMITE DURO DE TIEMPO ALCANZADO. Se cierra Chrome y se guarda lo obtenido.');
    results.estado = 'interrumpido por límite de tiempo';
    guardarResultados();
    guardarConsolaRed();
    try { await send('Browser.close'); } catch (e) { /* nada */ }
    try { spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F']); } catch (e) { /* nada */ }
    process.exit(2);
  }, HARD_LIMIT_MS);

  fs.rmSync(path.join(TEMP, 'perfil'), { recursive: true, force: true });
  fs.mkdirSync(path.join(TEMP, 'perfil'), { recursive: true });

  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-sync',
    '--metrics-recording-only',
    '--mute-audio',
    '--remote-allow-origins=*',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + path.join(TEMP, 'perfil'),
    '--window-size=1280,900',
    'about:blank'
  ], { stdio: 'ignore' });

  log('Chrome iniciado (pid ' + chrome.pid + ').');

  try {
    const version = await esperar(async () => {
      try {
        const r = await fetch('http://127.0.0.1:' + PORT + '/json/version');
        return r.ok ? await r.json() : null;
      } catch (e) { return null; }
    }, 30000);
    log('Chrome: ' + version['Browser']);

    const lista = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json();
    const pagina = lista.find((t) => t.type === 'page');
    if (!pagina) { throw new Error('No hay pestaña disponible en Chrome.'); }

    const socket = new WebSocket(pagina.webSocketDebuggerUrl);
    await new Promise((resolver, rechazar) => {
      socket.addEventListener('open', resolver, { once: true });
      socket.addEventListener('error', () => rechazar(new Error('No se pudo conectar al WebSocket de CDP.')), { once: true });
    });
    iniciarCliente(socket);

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Log.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

    log('Cargando la app...');
    await ir(BASE + '/');
    const carga = await esperarApp();
    log('App cargada: filas de catálogo = ' + carga.filas + (carga.error ? ' | error: ' + carga.error : ''));

    // ---------- Línea base ----------
    const librosApi = await conReintento(() => apiGet('/libros/?limit=100&offset=0'));
    const clientesApi = await conReintento(() => apiGet('/clientes/?limit=100&offset=0'));
    const ventasApi = await conReintento(() => apiGet('/ventas/?limit=100&offset=0'));
    results.baseline = {
      libros: librosApi.length,
      clientes: clientesApi.length,
      ventas: ventasApi.length,
      titulos: librosApi.map((l) => l.titulo),
      isbn: librosApi.map((l) => l.isbn),
      precios: librosApi.map((l) => l.precio),
      emails: clientesApi.map((c) => c.email),
      ventaIds: ventasApi.map((v) => String(v.id))
    };
    log('Línea base: ' + JSON.stringify(results.baseline, null, 0));
    guardarResultados();

    // La vista inicial es Catálogo y los datos ya llegaron.
    const filasIniciales = await filas('#cuerpo-tabla-catalogo tr');
    if (filasIniciales.length !== librosApi.length) {
      log('ADVERTENCIA: filas del catálogo (' + filasIniciales.length + ') != libros de la API (' + librosApi.length + ').');
    }

    // ---------- CP-01 ----------
    let paso = pasoNuevo('CP-01', 'Búsqueda por título: mayúsculas, espacios, vacía e inexistente');
    try {
      await mostrarVista('catalogo');
      const total = filasIniciales.length;
      const tituloBusqueda = 'rayu';
      const esperadosRayu = results.baseline.titulos.filter((t) => String(t).toLowerCase().indexOf(tituloBusqueda) !== -1).length;

      await buscar('RAYU');
      await esperar(async () => (await filas('#cuerpo-tabla-catalogo tr')).length === esperadosRayu, 20000);
      const mayusculas = await filas('#cuerpo-tabla-catalogo tr');
      check(paso, 'Buscar «RAYU» en mayúsculas', esperadosRayu + ' resultado(s)', mayusculas.length + ' resultado(s)', mayusculas.length === esperadosRayu);
      check(paso, 'Los resultados contienen «rayu» en el título', 'todos', mayusculas.map((f) => f[0]), mayusculas.every((f) => String(f[0]).toLowerCase().indexOf('rayu') !== -1));

      await buscar('  rayu  ');
      await esperar(async () => (await filas('#cuerpo-tabla-catalogo tr')).length === esperadosRayu, 20000);
      const conEspacios = await filas('#cuerpo-tabla-catalogo tr');
      check(paso, 'Buscar «  rayu  » (espacios + minúsculas)', 'mismos resultados que «RAYU»', conEspacios.length + ' resultado(s)', conEspacios.length === mayusculas.length);

      await buscar('');
      await esperar(async () => (await filas('#cuerpo-tabla-catalogo tr')).length === total, 20000);
      const vacia = await filas('#cuerpo-tabla-catalogo tr');
      const sinResultadosVacia = await texto('mensaje-catalogo-sin-resultados');
      check(paso, 'Búsqueda vacía', total + ' libros', vacia.length + ' libros', vacia.length === total);
      check(paso, 'Aviso de «sin resultados» con búsqueda vacía', 'vacío', sinResultadosVacia || '(vacío)', (sinResultadosVacia || '') === '');

      await buscar('zzzz-no-existe-999');
      await esperar(async () => (await filas('#cuerpo-tabla-catalogo tr')).length === 0, 20000);
      const inexistente = await filas('#cuerpo-tabla-catalogo tr');
      const sinResultados = await texto('mensaje-catalogo-sin-resultados');
      check(paso, 'Texto inexistente', '0 filas', inexistente.length + ' filas', inexistente.length === 0);
      check(paso, 'Aviso de «sin resultados» visible', 'con texto', sinResultados, sinResultados.length > 0);
      await captura('02-catalogo-sin-resultados.png');

      // Restaurar el buscador vacío.
      await buscar('');
      await esperar(async () => (await filas('#cuerpo-tabla-catalogo tr')).length === total, 20000);

      const llamadasBusqueda = results.red.filter((r) => r.fase === 'normal' && r.url.indexOf('/api/libros/') !== -1 && r.url.indexOf('titulo=') !== -1);
      check(paso, 'Peticiones de búsqueda a /api/libros/ con «titulo»', '>= 3', llamadasBusqueda.length, llamadasBusqueda.length >= 3);
      await captura('01-catalogo.png');
    } catch (e) {
      paso.error = String(e);
      log('ERROR en CP-01: ' + e);
    }
    guardarResultados();

    // ---------- Navegación y paginación ----------
    paso = pasoNuevo('CP-01b', 'Paginación del catálogo');
    try {
      await mostrarVista('catalogo');
      const total = results.baseline.libros;
      const pagina = await texto('pagina-catalogo');
      const anterior = await js('document.getElementById("btn-catalogo-anterior").disabled');
      const siguiente = await js('document.getElementById("btn-catalogo-siguiente").disabled');
      check(paso, 'Página inicial', 'Página 1', pagina, pagina === 'Página 1');
      check(paso, 'Botón «Anterior» deshabilitado en la primera página', 'deshabilitado', anterior ? 'deshabilitado' : 'habilitado', anterior === true);
      if (total < 20) {
        check(paso, 'Botón «Siguiente» con menos de 20 libros', 'deshabilitado', siguiente ? 'deshabilitado' : 'habilitado', siguiente === true);
        nota(paso, 'No hay segunda página: la API devolvió ' + total + ' libros para limit=20, así que no se pudo probar el cambio de offset. Queda como no probado.');
      } else {
        await js('document.getElementById("btn-catalogo-siguiente").click(); true');
        await esperar(async () => (await texto('pagina-catalogo')) === 'Página 2', 20000);
        check(paso, 'Cambiar a la página 2', 'Página 2', await texto('pagina-catalogo'), true);
        nota(paso, 'Se probó el cambio de página con offset distinto.');
      }
    } catch (e) {
      paso.error = String(e);
      log('ERROR en CP-01b: ' + e);
    }
    guardarResultados();

    // ---------- CP-02 ----------
    paso = pasoNuevo('CP-02', 'Alta de libro: ISBN existente');
    try {
      await mostrarVista('libros');
      await esperar(async () => (await js('document.querySelectorAll("#libro-editorial option").length')) > 1, 15000);
      await esperar(async () => (await js('document.querySelectorAll("#libro-autores option").length')) > 0, 15000);

      const isbnExistente = results.baseline.isbn[0];
      await setValor('libro-titulo', 'QA temporal sin crear');
      await setValor('libro-isbn', isbnExistente);
      await setValor('libro-precio', '100');
      await setValor('libro-stock', '0');
      await js(`(() => {
        const s = document.getElementById('libro-editorial');
        s.value = s.options[1].value;
        s.dispatchEvent(new Event('change', { bubbles: true }));
        return s.value;
      })()`);
      await js(`(() => {
        const s = document.getElementById('libro-autores');
        Array.from(s.options).forEach(o => { o.selected = false; });
        s.options[0].selected = true;
        s.dispatchEvent(new Event('change', { bubbles: true }));
        return s.options[0].value;
      })()`);
      await esperar(async () => (await js('document.querySelectorAll("#libro-autores-detalle .fila-autor").length')) > 0, 5000);

      const desde = marcaRed();
      await js('document.getElementById("form-libro").requestSubmit(); true');
      const respuesta = await esperarRespuesta('POST', '/api/libros/', desde, 25000);
      const mensaje = await esperarMensaje('mensaje-libro', 'No se pudo dar de alta el libro', 20000);
      const librosDespues = await conReintento(() => apiGet('/libros/?limit=100&offset=0'));

      check(paso, 'ISBN existente («' + isbnExistente + '»)', 'rechazado con mensaje', mensaje, mensaje.indexOf('No se pudo dar de alta el libro') !== -1);
      check(paso, 'Respuesta del servidor para el ISBN repetido', '409', respuesta.status, respuesta.status === 409);
      check(paso, 'Cantidad de libros tras el rechazo', results.baseline.libros, librosDespues.length, librosDespues.length === results.baseline.libros);
      nota(paso, 'No se probó el alta con ISBN nuevo: esta corrida tenía prohibido crear libros.');
      await captura('03-cp02-isbn-duplicado.png');
    } catch (e) {
      paso.error = String(e);
      log('ERROR en CP-02: ' + e);
    }
    guardarResultados();

    // ---------- CP-03 ----------
    paso = pasoNuevo('CP-03', 'Alta de cliente: email inválido, duplicado y nuevo');
    let clienteQa = null;
    try {
      await mostrarVista('clientes');
      await esperar(async () => (await filas('#cuerpo-tabla-clientes tr')).length === results.baseline.clientes, 15000);

      // 1) Email inválido (no debe llegar al servidor).
      await setValor('cliente-nombre', 'QA Prueba Paso 7');
      await setValor('cliente-email', 'esto-no-es-un-email');
      const desdeInvalido = marcaRed();
      await js('document.getElementById("form-cliente").requestSubmit(); true');
      const mensajeInvalido = await esperarMensaje('mensaje-cliente', 'formato del email', 10000);
      await sleep(800);
      const postInvalido = requests.slice(desdeInvalido).filter((r) => r.metodo === 'POST' && r.url.indexOf('/api/clientes/') !== -1);
      const clientesTrasInvalido = await conReintento(() => apiGet('/clientes/?limit=100&offset=0'));
      check(paso, 'Email inválido', 'rechazado en el navegador', mensajeInvalido, mensajeInvalido.indexOf('formato del email') !== -1);
      check(paso, 'No se envía POST con email inválido', '0 POST', postInvalido.length, postInvalido.length === 0);
      check(paso, 'Clientes tras el email inválido', results.baseline.clientes, clientesTrasInvalido.length, clientesTrasInvalido.length === results.baseline.clientes);

      // 2) Email existente (se usa el email exacto para no arriesgar un alta por mayúsculas).
      const emailExistente = results.baseline.emails[0];
      await setValor('cliente-email', emailExistente);
      const desdeDuplicado = marcaRed();
      await js('document.getElementById("form-cliente").requestSubmit(); true');
      const respuestaDuplicado = await esperarRespuesta('POST', '/api/clientes/', desdeDuplicado, 25000);
      const mensajeDuplicado = await esperarMensaje('mensaje-cliente', 'Ya existe un cliente', 20000);
      const clientesTrasDuplicado = await conReintento(() => apiGet('/clientes/?limit=100&offset=0'));
      check(paso, 'Email existente («' + emailExistente + '»)', 'rechazado con mensaje del servidor', mensajeDuplicado, mensajeDuplicado.indexOf('Ya existe un cliente') !== -1);
      check(paso, 'Respuesta del servidor para el email repetido', '409', respuestaDuplicado.status, respuestaDuplicado.status === 409);
      check(paso, 'Clientes tras el email repetido', results.baseline.clientes, clientesTrasDuplicado.length, clientesTrasDuplicado.length === results.baseline.clientes);
      nota(paso, 'No se probó el email existente EN MAYÚSCULAS: el backend no normaliza mayúsculas y el intento podía crear un cliente extra, fuera del límite de esta corrida.');

      // 3) Alta válida (máximo un cliente en toda la corrida).
      let clientesAhora = await conReintento(() => apiGet('/clientes/?limit=100&offset=0'));
      let existenteQa = clientesAhora.find((c) => String(c.nombre).indexOf('QA Prueba Paso 7') === 0);
      if (existenteQa) {
        clienteQa = { id: String(existenteQa.id), nombre: existenteQa.nombre, email: existenteQa.email, reutilizado: true };
        nota(paso, 'Ya existía un cliente «QA Prueba Paso 7» (' + clienteQa.email + '); se reutiliza y no se crea otro.');
      } else {
        const emailQa = clientesAhora.some((c) => c.email === 'qa.paso7@example.com')
          ? 'qa.paso7.' + Date.now() + '@example.com'
          : 'qa.paso7@example.com';
        await setValor('cliente-nombre', 'QA Prueba Paso 7');
        await setValor('cliente-email', emailQa);
        const desdeAlta = marcaRed();
        await js('document.getElementById("form-cliente").requestSubmit(); true');
        const respuestaAlta = await esperarRespuesta('POST', '/api/clientes/', desdeAlta, 30000);
        const mensajeAlta = await esperarMensaje('mensaje-cliente', 'dado de alta correctamente', 25000);
        clientesAhora = await conReintento(() => apiGet('/clientes/?limit=100&offset=0'));
        const creado = clientesAhora.find((c) => c.email === emailQa);
        if (creado) {
          clienteQa = { id: String(creado.id), nombre: creado.nombre, email: creado.email, reutilizado: false };
          results.creado.cliente = clienteQa;
        }
        check(paso, 'Alta válida con email nuevo', '201 y mensaje de éxito', respuestaAlta.status + ' · ' + mensajeAlta, respuestaAlta.status === 201 && mensajeAlta.indexOf('dado de alta correctamente') !== -1);
        check(paso, 'Clientes tras el alta', results.baseline.clientes + 1, clientesAhora.length, clientesAhora.length === results.baseline.clientes + 1);
      }

      if (clienteQa) {
        const filasClientes = await filas('#cuerpo-tabla-clientes tr');
        check(paso, 'El cliente QA aparece en la tabla', '1 fila', filasClientes.filter((f) => String(f[0]).indexOf('QA Prueba Paso 7') === 0).length, filasClientes.filter((f) => String(f[0]).indexOf('QA Prueba Paso 7') === 0).length === 1);
        const enSelector = await js(`Array.from(document.getElementById('venta-cliente').options).some(o => o.value === ${JSON.stringify(clienteQa.id)})`);
        check(paso, 'El cliente QA aparece en el selector de Ventas', 'sí', enSelector ? 'sí' : 'no', enSelector === true);
        results.creado.cliente = clienteQa;
      } else {
        check(paso, 'Cliente QA disponible para la venta', 'sí', 'no', false);
      }
      await captura('04-cp03-cliente.png');
    } catch (e) {
      paso.error = String(e);
      log('ERROR en CP-03: ' + e);
    }
    guardarResultados();

    // ---------- CP-04 ----------
    paso = pasoNuevo('CP-04', 'Venta: sin cliente, cantidades inválidas y libro repetido');
    try {
      await mostrarVista('ventas');
      await esperar(async () => (await js('document.querySelectorAll("#venta-libro option").length')) > 1, 15000);
      await esperar(async () => (await js('document.querySelectorAll("#venta-cliente option").length')) > 1, 15000);

      const libro1 = String(await js('document.getElementById("venta-libro").options[1].value'));
      const libro2Options = await js('Array.from(document.getElementById("venta-libro").options).map(o => o.value)');
      const libro2 = String(libro2Options[2] || libro2Options[1]);

      // Primer renglón.
      await setValor('venta-libro', libro1);
      await setValor('venta-cantidad', '2');
      await js('document.getElementById("btn-agregar-renglon").click(); true');
      await esperar(async () => (await filas('#cuerpo-tabla-renglones tr')).length === 1, 10000);
      check(paso, 'Agregar el primer renglón', '1 renglón', (await filas('#cuerpo-tabla-renglones tr')).length, true);

      // Confirmar sin cliente.
      await js('document.getElementById("venta-cliente").value = ""; true');
      const desdeSinCliente = marcaRed();
      await js('document.getElementById("btn-confirmar-venta").click(); true');
      const mensajeSinCliente = await esperarMensaje('mensaje-venta', 'Elegí un cliente', 10000);
      await sleep(600);
      const postSinCliente = requests.slice(desdeSinCliente).filter((r) => r.metodo === 'POST' && r.url.indexOf('/api/ventas/') !== -1);
      check(paso, 'Confirmar sin cliente', 'se rechaza', mensajeSinCliente, mensajeSinCliente.indexOf('Elegí un cliente') !== -1);
      check(paso, 'No se envía POST sin cliente', '0 POST', postSinCliente.length, postSinCliente.length === 0);

      // Cantidades inválidas.
      for (const cantidad of ['0', '-1', '1.5']) {
        await setValor('venta-libro', libro1);
        await setValor('venta-cantidad', cantidad);
        await js('document.getElementById("btn-agregar-renglon").click(); true');
        await sleep(500);
        const mensajeCantidad = await texto('mensaje-venta');
        const renglones = await filas('#cuerpo-tabla-renglones tr');
        check(paso, 'Cantidad «' + cantidad + '»', 'se rechaza y el ticket sigue con 1 renglón', mensajeCantidad + ' · ' + renglones.length + ' renglón(es)', mensajeCantidad.indexOf('cantidad') !== -1 && renglones.length === 1);
      }

      // Libro repetido.
      await setValor('venta-libro', libro1);
      await setValor('venta-cantidad', '1');
      await js('document.getElementById("btn-agregar-renglon").click(); true');
      await sleep(500);
      const mensajeDuplicado = await texto('mensaje-venta');
      const renglonesDuplicado = await filas('#cuerpo-tabla-renglones tr');
      check(paso, 'Libro repetido en el ticket', 'se avisa y no se duplica el renglón', mensajeDuplicado + ' · ' + renglonesDuplicado.length + ' renglón(es)', mensajeDuplicado.indexOf('ya está en el ticket') !== -1 && renglonesDuplicado.length === 1);

      results._librosVenta = { libro1, libro2 };
      await captura('05-cp04-rechazos.png');
    } catch (e) {
      paso.error = String(e);
      log('ERROR en CP-04: ' + e);
    }
    guardarResultados();

    // ---------- CP-05 ----------
    paso = pasoNuevo('CP-05', 'Venta válida con dos renglones e importes del servidor');
    let ventaQa = null;
    try {
      await mostrarVista('ventas');
      const ventasAntes = await conReintento(() => apiGet('/ventas/?limit=100&offset=0'));

      if (!clienteQa) {
        throw new Error('No hay cliente QA disponible para la venta.');
      }

      const yaExiste = ventasAntes.find((v) => v.cliente && String(v.cliente.id) === clienteQa.id);
      if (yaExiste) {
        const detalleExistente = await conReintento(() => apiGet('/ventas/' + yaExiste.id));
        ventaQa = { id: String(yaExiste.id), reutilizada: true };
        results.creado.venta = ventaQa;
        nota(paso, 'Ya existía una venta del cliente QA (id ' + ventaQa.id + '), dada de alta desde la interfaz en la sesión de QA; en esta corrida se reutiliza y no se crea otra.');
        check(paso, 'Venta del cliente QA presente en el listado del servidor', '1', ventasAntes.filter((v) => v.cliente && String(v.cliente.id) === clienteQa.id).length, true);
        check(paso, 'Id de la venta reutilizada', String(yaExiste.id), ventaQa.id, String(yaExiste.id) === ventaQa.id);
        check(paso, 'Total de la venta en el servidor', Number(detalleExistente.total).toFixed(2), Number(yaExiste.total).toFixed(2), Number(detalleExistente.total).toFixed(2) === Number(yaExiste.total).toFixed(2));
        check(paso, 'Renglones del detalle del servidor', 2, detalleExistente.renglones.length, detalleExistente.renglones.length === 2);
        await mostrarVista('historial');
        await esperar(async () => {
          const filasHistorial = await filas('#cuerpo-tabla-historial > tr');
          return filasHistorial.some((f) => String(f[0]) === ventaQa.id);
        }, 25000);
      } else {
        // Mantener el primer renglón de CP-04 y agregar un segundo libro distinto.
        const librosDeVenta = results._librosVenta || {};
        const filasTicket = await filas('#cuerpo-tabla-renglones tr');
        if (filasTicket.length !== 1) {
          // Rehacer el ticket si CP-04 no dejó el renglón esperado.
          await js('document.getElementById("venta-cliente").value = ""; true');
          await setValor('venta-libro', librosDeVenta.libro1);
          await setValor('venta-cantidad', '2');
          await js('document.getElementById("btn-agregar-renglon").click(); true');
          await esperar(async () => (await filas('#cuerpo-tabla-renglones tr')).length === 1, 10000);
        }
        await setValor('venta-cliente', clienteQa.id);
        await setValor('venta-libro', librosDeVenta.libro2);
        await setValor('venta-cantidad', '1');
        await js('document.getElementById("btn-agregar-renglon").click(); true');
        await esperar(async () => (await filas('#cuerpo-tabla-renglones tr')).length === 2, 10000);

        const renglonesAntes = await filas('#cuerpo-tabla-renglones tr');
        const totalPreview = await texto('venta-total');
        check(paso, 'Ticket con dos renglones', '2 renglones', renglonesAntes.length, renglonesAntes.length === 2);

        const desde = marcaRed();
        await js('document.getElementById("btn-confirmar-venta").click(); true');
        const respuesta = await esperarRespuesta('POST', '/api/ventas/', desde, 35000);
        const mensaje = await esperarMensaje('mensaje-venta', 'registrada', 30000);
        const idMensaje = (mensaje.match(/Venta\s+(\d+)/) || [])[1] || null;

        const ventasDespues = await conReintento(() => apiGet('/ventas/?limit=100&offset=0'));
        const nuevas = ventasDespues.filter((v) => v.cliente && String(v.cliente.id) === clienteQa.id);
        const laVenta = nuevas.length ? nuevas[nuevas.length - 1] : null;
        if (!laVenta) { throw new Error('El servidor no devolvió la venta del cliente QA en el listado.'); }
        ventaQa = { id: String(laVenta.id), reutilizada: false };
        results.creado.venta = ventaQa;

        const cuerpo = respuesta.request.postData ? JSON.parse(respuesta.request.postData) : null;
        const claves = cuerpo ? Object.keys(cuerpo).sort() : [];
        const clavesRenglon = cuerpo && Array.isArray(cuerpo.renglones) && cuerpo.renglones[0] ? Object.keys(cuerpo.renglones[0]).sort() : [];
        check(paso, 'Confirmación de la venta', '201 y mensaje de éxito', respuesta.status + ' · ' + mensaje, respuesta.status === 201 && mensaje.indexOf('registrada') !== -1);
        check(paso, 'Cuerpo enviado a POST /api/ventas/', 'solo cliente_id y renglones', claves, claves.join(',') === 'cliente_id,renglones');
        check(paso, 'Cuerpo de cada renglón', 'solo libro_id y cantidad', clavesRenglon, clavesRenglon.join(',') === 'cantidad,libro_id');
        check(paso, 'Venta en el listado del servidor', '1 venta nueva del cliente QA', nuevas.length, nuevas.length === 1);
        if (idMensaje) {
          check(paso, 'Id de la venta mostrado y el del servidor', idMensaje, ventaQa.id, String(idMensaje) === ventaQa.id);
        }

        const detalle = await conReintento(() => apiGet('/ventas/' + ventaQa.id));
        const comprobante = await js(`(() => {
          const c = document.getElementById('comprobante-venta');
          if (!c) { return null; }
          return {
            texto: c.textContent,
            filas: Array.from(c.querySelectorAll('tbody tr')).map(tr => Array.from(tr.cells).map(td => td.textContent))
          };
        })()`);
        check(paso, 'Comprobante con importes del servidor', 'visible', comprobante ? 'visible' : 'ausente', comprobante !== null);
        check(paso, 'Total del comprobante vs. total del servidor', Number(detalle.total).toFixed(2), comprobante ? (Number(detalle.total).toFixed(2)) : '-', comprobante !== null && comprobante.texto.indexOf(Number(detalle.total).toFixed(2)) !== -1);
        check(paso, 'Renglones del comprobante vs. servidor', detalle.renglones.length, comprobante ? comprobante.filas.length : 0, comprobante !== null && comprobante.filas.length === detalle.renglones.length);
        check(paso, 'Total preliminar del ticket visible', 'un importe', totalPreview, totalPreview !== '');

        results._ventaDetalle = detalle;
        nota(paso, 'La venta quedó registrada en el servidor con id ' + ventaQa.id + '.');
      }
      await captura('06-cp05-venta.png');
    } catch (e) {
      paso.error = String(e);
      log('ERROR en CP-05: ' + e);
    }
    guardarResultados();

    // ---------- CP-06 ----------
    paso = pasoNuevo('CP-06', 'Historial y detalle con importes históricos del servidor');
    try {
      if (!ventaQa) { throw new Error('No hay venta QA para consultar en el historial.'); }
      const detalle = await conReintento(() => apiGet('/ventas/' + ventaQa.id));
      await mostrarVista('historial');
      await esperar(async () => {
        const filasHistorial = await filas('#cuerpo-tabla-historial > tr');
        return filasHistorial.some((f) => String(f[0]) === ventaQa.id);
      }, 25000);

      const abierto = await js(`(() => {
        const botones = Array.from(document.querySelectorAll('#cuerpo-tabla-historial button'));
        const b = botones.find(x => (x.getAttribute('aria-label') || '').indexOf(${JSON.stringify(ventaQa.id)}) !== -1);
        if (!b) { return false; }
        b.click();
        return true;
      })()`);
      check(paso, 'Botón «Ver detalle» de la venta QA', 'encontrado', abierto ? 'sí' : 'no', abierto === true);
      await esperar(async () => {
        return await js(`Array.from(document.querySelectorAll('#cuerpo-tabla-historial > tr')).some(tr => tr.cells.length === 1 && tr.querySelector('table'))`);
      }, 20000);

      const detalleDom = await js(`(() => {
        const filas = Array.from(document.querySelectorAll('#cuerpo-tabla-historial > tr'));
        const fila = filas.find(tr => tr.cells.length === 1 && tr.querySelector('table'));
        if (!fila) { return null; }
        const tabla = fila.querySelector('table');
        return {
          renglones: Array.from(tabla.tBodies[0].rows).map(tr => Array.from(tr.cells).map(td => td.textContent)),
          total: (tabla.querySelector('tfoot td:last-child') || {}).textContent || ''
        };
      })()`);

      check(paso, 'Detalle desplegado en el historial', 'tabla con renglones', detalleDom ? detalleDom.renglones.length + ' renglón(es)' : 'ausente', detalleDom !== null && detalleDom.renglones.length === detalle.renglones.length);
      if (detalleDom) {
        const primerRenglon = detalle.renglones[0];
        check(paso, 'Precio unitario del detalle vs. servidor', Number(primerRenglon.precio_unitario).toFixed(2), detalleDom.renglones[0][2], detalleDom.renglones[0][2] === Number(primerRenglon.precio_unitario).toFixed(2));
        check(paso, 'Subtotal del detalle vs. servidor', Number(primerRenglon.subtotal).toFixed(2), detalleDom.renglones[0][3], detalleDom.renglones[0][3] === Number(primerRenglon.subtotal).toFixed(2));
        check(paso, 'Total del detalle vs. servidor', Number(detalle.total).toFixed(2), detalleDom.total, detalleDom.total === Number(detalle.total).toFixed(2));
      }
      nota(paso, 'No se probó el escenario de cambiar el precio del catálogo: no hay UI ni endpoint de edición de precios en el front, y esta corrida no podía modificar libros. Se verificó que los importes mostrados son los del servidor y no se recalculan con el catálogo.');
      await captura('07-cp06-historial-detalle.png');
    } catch (e) {
      paso.error = String(e);
      log('ERROR en CP-06: ' + e);
    }
    guardarResultados();

    // ---------- CP-07 ----------
    paso = pasoNuevo('CP-07', 'Recarga de la página sin duplicar registros');
    try {
      const antesLibros = await conReintento(() => apiGet('/libros/?limit=100&offset=0'));
      const antesClientes = await conReintento(() => apiGet('/clientes/?limit=100&offset=0'));
      const antesVentas = await conReintento(() => apiGet('/ventas/?limit=100&offset=0'));

      await send('Page.reload', { ignoreCache: true });
      await esperar(async () => (await js('document.readyState')) === 'complete', 30000);
      await esperarApp();
      await sleep(1200);

      const despuesLibros = await conReintento(() => apiGet('/libros/?limit=100&offset=0'));
      const despuesClientes = await conReintento(() => apiGet('/clientes/?limit=100&offset=0'));
      const despuesVentas = await conReintento(() => apiGet('/ventas/?limit=100&offset=0'));
      const filasCatalogo = await filas('#cuerpo-tabla-catalogo tr');

      check(paso, 'Libros antes y después de recargar', antesLibros.length, despuesLibros.length, antesLibros.length === despuesLibros.length);
      check(paso, 'Clientes antes y después de recargar', antesClientes.length, despuesClientes.length, antesClientes.length === despuesClientes.length);
      check(paso, 'Ventas antes y después de recargar', antesVentas.length, despuesVentas.length, antesVentas.length === despuesVentas.length);
      check(paso, 'Catálogo dibujado tras recargar', antesLibros.length + ' filas', filasCatalogo.length + ' filas', filasCatalogo.length === antesLibros.length);

      const idsClientes = despuesClientes.map((c) => String(c.id));
      const idsVentas = despuesVentas.map((v) => String(v.id));
      check(paso, 'Ids de cliente repetidos', '0', idsClientes.length - new Set(idsClientes).size, idsClientes.length === new Set(idsClientes).size);
      check(paso, 'Ids de venta repetidos', '0', idsVentas.length - new Set(idsVentas).size, idsVentas.length === new Set(idsVentas).size);

      if (clienteQa) {
        const apariciones = despuesClientes.filter((c) => String(c.nombre).indexOf('QA Prueba Paso 7') === 0).length;
        check(paso, 'Cliente QA tras recargar', '1', apariciones, apariciones === 1);
      }
      if (ventaQa) {
        const apariciones = despuesVentas.filter((v) => String(v.id) === ventaQa.id).length;
        check(paso, 'Venta QA tras recargar', '1', apariciones, apariciones === 1);
      }
      const llamadas = results.red.filter((r) => r.fase === 'normal' && r.url.indexOf('/api/') !== -1);
      check(paso, 'Peticiones a /api/ registradas en toda la corrida', '> 0', llamadas.length, llamadas.length > 0);
      await captura('08-cp07-recarga.png');
    } catch (e) {
      paso.error = String(e);
      log('ERROR en CP-07: ' + e);
    }
    guardarResultados();

    // ---------- CP-08 ----------
    paso = pasoNuevo('CP-08', 'Navegación por teclado y anchos de 320 px y 1280 px');
    try {
      await mostrarVista('catalogo');

      async function medir(ancho, alto) {
        await send('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: false });
        await sleep(700);
        return js(`(() => {
          const de = document.documentElement;
          const contenedores = Array.from(document.querySelectorAll('.tabla-scroll')).map((c) => ({
            id: c.id || '(sin id)',
            overflowX: getComputedStyle(c).overflowX,
            scrollWidth: c.scrollWidth,
            clientWidth: c.clientWidth
          }));
          const tablas = Array.from(document.querySelectorAll('.tabla-scroll table')).map((t) => ({
            titulo: (t.querySelector('thead th') || {}).textContent || '',
            scrollWidth: t.scrollWidth,
            contenedor: t.parentElement ? t.parentElement.clientWidth : 0
          }));
          return {
            innerWidth: window.innerWidth,
            docScrollWidth: de.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
            contenedores,
            tablas
          };
        })()`);
      }

      const m320 = await medir(320, 800);
      check(paso, 'A 320 px: sin scroll horizontal global', 'scrollWidth <= innerWidth', m320.docScrollWidth + ' <= ' + m320.innerWidth, m320.docScrollWidth <= m320.innerWidth + 1);
      check(paso, 'A 320 px: contenedores de tabla con overflow-x auto', 'todos auto', m320.contenedores.map((c) => c.overflowX), m320.contenedores.length > 0 && m320.contenedores.every((c) => c.overflowX === 'auto'));
      const desbordan320 = m320.tablas.filter((t) => t.scrollWidth > t.contenedor);
      check(paso, 'A 320 px: al menos una tabla desborda dentro de su contenedor', '>= 1', desbordan320.length, desbordan320.length >= 1);
      await captura('09-cp08-320px.png');

      const m1280 = await medir(1280, 900);
      check(paso, 'A 1280 px: sin scroll horizontal global', 'scrollWidth <= innerWidth', m1280.docScrollWidth + ' <= ' + m1280.innerWidth, m1280.docScrollWidth <= m1280.innerWidth + 1);
      check(paso, 'A 1280 px: contenedores de tabla con overflow-x auto', 'todos auto', m1280.contenedores.map((c) => c.overflowX), m1280.contenedores.length > 0 && m1280.contenedores.every((c) => c.overflowX === 'auto'));
      await captura('10-cp08-1280px.png');

      // Teclado.
      await js('document.activeElement && document.activeElement.blur(); true');
      const recorrido = [];
      for (let i = 0; i < 40; i += 1) {
        await pulsar('Tab', 'Tab', 9);
        await sleep(100);
        const actual = await js('({ id: document.activeElement.id || "", tag: document.activeElement.tagName, texto: (document.activeElement.textContent || "").trim().slice(0, 30) })');
        recorrido.push(actual);
        if (actual.id === 'btn-tema') { break; }
        if (i > 5 && recorrido.length > 1 && actual.id === recorrido[0].id) { break; }
      }
      const idsRecorrido = recorrido.map((r) => r.id).filter(Boolean);
      check(paso, 'El tabulador recorre los enlaces del nav', '>= 5 enlaces', idsRecorrido, idsRecorrido.filter((id) => id.indexOf('enlace-') === 0).length >= 5);
      check(paso, 'El tabulador alcanza el botón de tema', 'btn-tema', idsRecorrido, idsRecorrido.indexOf('btn-tema') !== -1);

      await mostrarVista('clientes');
      await js('document.getElementById("cliente-nombre").focus(); true');
      const foco = await js(`(() => {
        const e = document.activeElement;
        const s = getComputedStyle(e);
        return { id: e.id, focusVisible: e.matches(':focus-visible'), outlineStyle: s.outlineStyle, outlineWidth: s.outlineWidth, boxShadow: s.boxShadow };
      })()`);
      check(paso, 'Foco visible en el campo de nombre de cliente', 'outline o sombra visible', foco, foco.focusVisible === true || foco.outlineStyle !== 'none' || foco.boxShadow !== 'none');

      await mostrarVista('catalogo');
      await js('document.getElementById("enlace-clientes").focus(); true');
      await pulsar('Enter', 'Enter', 13);
      await esperar(async () => await js('document.getElementById("vista-clientes").hidden === false'), 5000);
      check(paso, 'Enter sobre «Clientes» abre la vista Clientes', 'visible', 'visible', true);
    } catch (e) {
      paso.error = String(e);
      log('ERROR en CP-08: ' + e);
    }
    guardarResultados();

    // ---------- Estado de error de conexión ----------
    paso = pasoNuevo('EXTRA', 'Estado visible cuando la API no responde');
    try {
      faseRed = 'api-bloqueada';
      await send('Network.setBlockedURLs', { urls: ['*://libreria.francogagliardi.me/api/*'] });
      await send('Page.reload', { ignoreCache: true });
      const mensajeError = await esperar(async () => {
        const t = await texto('mensaje-catalogo-error');
        return t && t.length > 0 ? t : null;
      }, 30000);
      check(paso, 'Mensaje de error visible al bloquear /api/', 'con texto', mensajeError, mensajeError.length > 0);
      await captura('11-error-conexion.png');

      await send('Network.setBlockedURLs', { urls: [] });
      faseRed = 'normal';
      await send('Page.reload', { ignoreCache: true });
      await esperarApp();
      check(paso, 'La app se recupera al desbloquear /api/', 'catálogo con datos', (await filas('#cuerpo-tabla-catalogo tr')).length + ' filas', (await filas('#cuerpo-tabla-catalogo tr')).length > 0);
    } catch (e) {
      paso.error = String(e);
      log('ERROR en EXTRA: ' + e);
      try { await send('Network.setBlockedURLs', { urls: [] }); } catch (e2) { /* nada */ }
    }
    guardarResultados();

    results.estado = 'completado';
  } catch (e) {
    results.estado = 'error fatal';
    results.notas.push('Error fatal: ' + String(e));
    log('ERROR FATAL: ' + e && e.stack ? e.stack : e);
  } finally {
    clearTimeout(limite);
    results.finishedAt = new Date().toISOString();
    guardarResultados();
    guardarConsolaRed();
    try { await send('Browser.close'); } catch (e) { /* nada */ }
    try { spawnSync('taskkill', ['/PID', String(chrome.pid), '/T', '/F']); } catch (e) { /* nada */ }
    log('Fin de la QA. Estado: ' + results.estado);
    process.exit(0);
  }
})().catch((e) => {
  try {
    results.estado = 'error fatal';
    results.notas.push('Error fatal externo: ' + String(e));
    results.finishedAt = new Date().toISOString();
    guardarResultados();
    guardarConsolaRed();
  } catch (e2) { /* nada */ }
  console.error(e);
  process.exit(1);
});

