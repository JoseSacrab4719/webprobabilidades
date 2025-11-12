// ============================================
// VARIABLES GLOBALES Y CONFIGURACIÓN
// ============================================
let chartSimple, chartCondicional, chartCompuesta, chartBayes;
let chartPoisson, chartBinomialNegativa, chartExponencial;

const CONFIG = {
  colores: ["#004aad", "#00b894", "#ff4a4a", "#f39c12", "#e74c3c"],
  colorFondo: "#f7f9fc",
  colorPrimario: "#004aad"
};

// ============================================
// UTILIDADES Y VALIDACIONES
// ============================================

/**
 * Valida que un valor esté entre 0 y 1
 */
function validarProbabilidad(valor) {
  const num = parseFloat(valor);
  if (isNaN(num) || num < 0 || num > 1) {
    throw new Error("La probabilidad debe estar entre 0 y 1");
  }
  return num;
}

/**
 * Valida que un valor sea positivo
 */
function validarPositivo(valor) {
  const num = parseFloat(valor);
  if (isNaN(num) || num <= 0) {
    throw new Error("El valor debe ser positivo");
  }
  return num;
}

/**
 * Calcula el factorial de un número
 */
function factorial(n) {
  if (n < 0) throw new Error("El factorial no existe para números negativos");
  if (n === 0 || n === 1) return 1;
  let resultado = 1;
  for (let i = 2; i <= n; i++) {
    resultado *= i;
  }
  return resultado;
}

/**
 * Calcula combinaciones C(n, k) = n! / (k! * (n-k)!)
 */
function combinacion(n, k) {
  if (k > n) return 0;
  return factorial(n) / (factorial(k) * factorial(n - k));
}

/**
 * Muestra mensajes de error al usuario
 */
function mostrarError(mensaje) {
  const div = document.createElement("div");
  div.className = "error-message";
  div.innerHTML = `⚠️ ${mensaje}`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

/**
 * Destruye un gráfico si existe
 */
function destruirGrafico(chart) {
  if (chart) {
    chart.destroy();
    return null;
  }
}

// ============================================
// NAVEGACIÓN Y SECCIONES
// ============================================

/**
 * Muestra la sección seleccionada
 */
function mostrarSeccion(id) {
  document.querySelectorAll("section").forEach(sec => {
    sec.classList.remove("activo");
  });
  
  const seccion = document.getElementById(id);
  if (seccion) {
    seccion.classList.add("activo");
  }
}

// Navegación y acordeón
const panels = document.querySelectorAll('.panel');
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('main-btn')) {
    panels.forEach(p => p.style.display = 'none');
    const id = e.target.dataset.target;
    document.getElementById(id).style.display = 'block';
    window.scrollTo({top:0,behavior:'smooth'});
  }
  if (e.target.classList.contains('acc-btn')) {
    const body = e.target.nextElementSibling;
    body.style.display = (body.style.display === 'block') ? 'none' : 'block';
  }
});
window.addEventListener('load', () => {
  panels.forEach(p => p.style.display = 'none');
  document.getElementById('conteo').style.display = 'block';
  document.querySelectorAll('.acc-body').forEach(b=>b.style.display='none');
});

// ============================================
// PROBABILIDAD SIMPLE
// ============================================

/**
 * P(A) = Casos favorables / Casos totales
 */
function calcularSimple(e) {
  e.preventDefault();
  try {
    const favorables = parseFloat(document.getElementById("favorables").value);
    const totales = parseFloat(document.getElementById("totales").value);

    if (isNaN(favorables) || isNaN(totales)) {
      throw new Error("Ingresa valores válidos");
    }

    if (favorables > totales || favorables < 0) {
      throw new Error("Los casos favorables no pueden ser mayores que los totales");
    }

    if (totales <= 0) {
      throw new Error("El total de casos debe ser positivo");
    }

    const probabilidad = favorables / totales;
    const porcentaje = (probabilidad * 100).toFixed(2);

    // Mostrar resultado con fórmula
    document.getElementById("resultado-simple").innerHTML = `
      <div class="resultado-box">
        <p><strong>Fórmula:</strong> P(A) = ${favorables} / ${totales}</p>
        <p class="resultado-valor">P(A) = <span>${probabilidad.toFixed(4)}</span> (${porcentaje}%)</p>
      </div>
    `;

    // Gráfico
    const datos = [favorables, totales - favorables];
    const etiquetas = ["Favorables", "No favorables"];

    chartSimple = destruirGrafico(chartSimple);
    chartSimple = new Chart(document.getElementById("graficoSimple"), {
      type: "pie",
      data: {
        labels: etiquetas,
        datasets: [{
          data: datos,
          backgroundColor: [CONFIG.colores[0], CONFIG.colores[2]],
          borderColor: "#fff",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: { callbacks: {
            label: (context) => `${context.label}: ${context.parsed} (${(context.parsed/totales*100).toFixed(2)}%)`
          }}
        }
      }
    });
  } catch (error) {
    mostrarError(error.message);
  }
}

// ============================================
// PROBABILIDAD CONDICIONAL
// ============================================

/**
 * P(A|B) = P(A ∩ B) / P(B)
 */
function calcularCondicional(e) {
  e.preventDefault();
  try {
    const pab = validarProbabilidad(document.getElementById("pab").value);
    const pb = validarProbabilidad(document.getElementById("pb").value);

    if (pab > pb) {
      throw new Error("P(A ∩ B) no puede ser mayor que P(B)");
    }

    if (pb === 0) {
      throw new Error("P(B) no puede ser 0");
    }

    const resultado = pab / pb;

    document.getElementById("resultado-condicional").innerHTML = `
      <div class="resultado-box">
        <p><strong>Fórmula:</strong> P(A|B) = P(A ∩ B) / P(B)</p>
        <p><strong>Cálculo:</strong> P(A|B) = ${pab.toFixed(4)} / ${pb.toFixed(4)}</p>
        <p class="resultado-valor">P(A|B) = <span>${resultado.toFixed(4)}</span></p>
      </div>
    `;

    chartCondicional = destruirGrafico(chartCondicional);
    chartCondicional = new Chart(document.getElementById("graficoCondicional"), {
      type: "bar",
      data: {
        labels: ["P(A ∩ B)", "P(B)", "P(A|B)"],
        datasets: [{
          label: "Probabilidades",
          data: [pab, pb, resultado],
          backgroundColor: [CONFIG.colores[0], CONFIG.colores[1], CONFIG.colores[2]]
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 1,
            ticks: { callback: (value) => value.toFixed(2) }
          }
        }
      }
    });
  } catch (error) {
    mostrarError(error.message);
  }
}

// ============================================
// PROBABILIDAD COMPUESTA
// ============================================

/**
 * P(A ∩ B) = P(A) × P(B)
 */
function calcularCompuesta(e) {
  e.preventDefault();
  try {
    const pa = validarProbabilidad(document.getElementById("pa").value);
    const pb = validarProbabilidad(document.getElementById("pb2").value);

    const resultado = pa * pb;

    document.getElementById("resultado-compuesta").innerHTML = `
      <div class="resultado-box">
        <p><strong>Fórmula:</strong> P(A ∩ B) = P(A) × P(B)</p>
        <p><strong>Cálculo:</strong> P(A ∩ B) = ${pa.toFixed(4)} × ${pb.toFixed(4)}</p>
        <p class="resultado-valor">P(A ∩ B) = <span>${resultado.toFixed(4)}</span></p>
      </div>
    `;

    chartCompuesta = destruirGrafico(chartCompuesta);
    chartCompuesta = new Chart(document.getElementById("graficoCompuesta"), {
      type: "bar",
      data: {
        labels: ["P(A)", "P(B)", "P(A ∩ B)"],
        datasets: [{
          label: "Probabilidades",
          data: [pa, pb, resultado],
          backgroundColor: [CONFIG.colores[0], CONFIG.colores[1], CONFIG.colores[2]]
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, max: 1 }
        }
      }
    });
  } catch (error) {
    mostrarError(error.message);
  }
}

// ============================================
// TEOREMA DE BAYES
// ============================================

/**
 * P(A|B) = [P(B|A) × P(A)] / P(B)
 */
function calcularBayes(e) {
  e.preventDefault();
  try {
    const pba = validarProbabilidad(document.getElementById("pba").value);
    const pa = validarProbabilidad(document.getElementById("pa2").value);
    const pb = validarProbabilidad(document.getElementById("pb3").value);

    if (pb === 0) {
      throw new Error("P(B) no puede ser 0");
    }

    const resultado = (pba * pa) / pb;

    document.getElementById("resultado-bayes").innerHTML = `
      <div class="resultado-box">
        <p><strong>Teorema de Bayes:</strong> P(A|B) = [P(B|A) × P(A)] / P(B)</p>
        <p><strong>Cálculo:</strong> P(A|B) = [${pba.toFixed(4)} × ${pa.toFixed(4)}] / ${pb.toFixed(4)}</p>
        <p class="resultado-valor">P(A|B) = <span>${resultado.toFixed(4)}</span></p>
      </div>
    `;

    chartBayes = destruirGrafico(chartBayes);
    chartBayes = new Chart(document.getElementById("graficoBayes"), {
      type: "bar",
      data: {
        labels: ["P(B|A)", "P(A)", "P(B)", "P(A|B)"],
        datasets: [{
          label: "Probabilidades",
          data: [pba, pa, pb, resultado],
          backgroundColor: CONFIG.colores
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, max: 1 }
        }
      }
    });
  } catch (error) {
    mostrarError(error.message);
  }
}

// ============================================
// DISTRIBUCIÓN DE POISSON
// ============================================

/**
 * P(X = k) = (λ^k × e^-λ) / k!
 */
function calcularPoisson(e) {
  e.preventDefault();
  try {
    const lambda = validarPositivo(document.getElementById("lambda_poisson").value);
    const k = parseInt(document.getElementById("k_poisson").value);

    if (k < 0 || isNaN(k)) {
      throw new Error("k debe ser un número entero no negativo");
    }

    const numerador = Math.pow(lambda, k) * Math.exp(-lambda);
    const denominador = factorial(k);
    const probabilidad = numerador / denominador;

    document.getElementById("resultado_poisson").innerHTML = `
      <div class="resultado-box">
        <p><strong>Fórmula:</strong> P(X = ${k}) = (${lambda.toFixed(4)}^${k} × e^-${lambda.toFixed(4)}) / ${k}!</p>
        <p class="resultado-valor">P(X = ${k}) = <span>${probabilidad.toFixed(6)}</span></p>
      </div>
    `;

    // Generar datos para gráfico
    const datosX = [];
    const datosY = [];
    for (let i = 0; i <= k + 3; i++) {
      datosX.push(i);
      const num = Math.pow(lambda, i) * Math.exp(-lambda);
      const den = factorial(i);
      datosY.push(num / den);
    }

    chartPoisson = destruirGrafico(chartPoisson);
    chartPoisson = new Chart(document.getElementById("graficoPoisson"), {
      type: "bar",
      data: {
        labels: datosX.map(String),
        datasets: [{
          label: "Probabilidad",
          data: datosY,
          backgroundColor: CONFIG.colores[0]
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  } catch (error) {
    mostrarError(error.message);
  }
}

// ============================================
// DISTRIBUCIÓN BINOMIAL NEGATIVA
// ============================================

/**
 * P(X = x) = C(x + r - 1, x) × p^r × (1 - p)^x
 */
function calcularBinomialNegativa(e) {
  e.preventDefault();
  try {
    const r = parseInt(document.getElementById("r_bn").value);
    const p = validarProbabilidad(document.getElementById("p_bn").value);
    const x = parseInt(document.getElementById("x_bn").value);

    if (r <= 0 || isNaN(r)) {
      throw new Error("r debe ser un entero positivo");
    }

    if (x < 0 || isNaN(x)) {
      throw new Error("x debe ser un entero no negativo");
    }

    const comb = combinacion(x + r - 1, x);
    const probabilidad = comb * Math.pow(p, r) * Math.pow(1 - p, x);

    document.getElementById("resultado_bn").innerHTML = `
      <div class="resultado-box">
        <p><strong>Fórmula:</strong> P(X = ${x}) = C(${x + r - 1}, ${x}) × ${p.toFixed(4)}^${r} × ${(1 - p).toFixed(4)}^${x}</p>
        <p class="resultado-valor">P(X = ${x}) = <span>${probabilidad.toFixed(6)}</span></p>
      </div>
    `;

    // Generar datos para gráfico
    const datosX = [];
    const datosY = [];
    for (let i = 0; i <= x + 3; i++) {
      datosX.push(i);
      const c = combinacion(i + r - 1, i);
      const prob = c * Math.pow(p, r) * Math.pow(1 - p, i);
      datosY.push(prob);
    }

    chartBinomialNegativa = destruirGrafico(chartBinomialNegativa);
    chartBinomialNegativa = new Chart(document.getElementById("graficoBinomialNegativa"), {
      type: "bar",
      data: {
        labels: datosX.map(String),
        datasets: [{
          label: "Probabilidad",
          data: datosY,
          backgroundColor: CONFIG.colores[1]
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  } catch (error) {
    mostrarError(error.message);
  }
}

// ============================================
// DISTRIBUCIÓN EXPONENCIAL
// ============================================

/**
 * f(x; λ) = λ × e^(-λx)
 */
function calcularExponencial(e) {
  e.preventDefault();
  try {
    const lambda = validarPositivo(document.getElementById("lambda_exp").value);
    const x = validarPositivo(document.getElementById("x_exp").value);

    const resultado = lambda * Math.exp(-lambda * x);

    document.getElementById("resultado_exp").innerHTML = `
      <div class="resultado-box">
        <p><strong>Fórmula:</strong> f(${x.toFixed(4)}) = ${lambda.toFixed(4)} × e^(-${lambda.toFixed(4)} × ${x.toFixed(4)})</p>
        <p class="resultado-valor">f(x) = <span>${resultado.toFixed(6)}</span></p>
      </div>
    `;

    // Generar datos para gráfico
    const datosX = [];
    const datosY = [];
    const paso = x / 10;
    for (let i = 0; i <= x * 2; i += paso || 0.1) {
      datosX.push(i.toFixed(2));
      datosY.push(lambda * Math.exp(-lambda * i));
    }

    chartExponencial = destruirGrafico(chartExponencial);
    chartExponencial = new Chart(document.getElementById("graficoExponencial"), {
      type: "line",
      data: {
        labels: datosX,
        datasets: [{
          label: "Densidad de probabilidad",
          data: datosY,
          borderColor: CONFIG.colores[2],
          backgroundColor: "rgba(255, 74, 74, 0.1)",
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
  } catch (error) {
    mostrarError(error.message);
  }
}

// ============================================
// ANIMACIONES Y EVENTOS
// ============================================

/**
 * Observador para animar secciones al scroll
 */
const observador = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.1 });

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".probabilidad").forEach(sec => {
    observador.observe(sec);
  });
});

// ============================================
// TEMA OSCURO
// ============================================

const toggleDark = document.getElementById("toggle-dark");
if (toggleDark) {
  toggleDark.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  });

  // Cargar preferencia guardada
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }
}

// Tema oscuro
const btnDark = document.getElementById('toggle-dark');
btnDark?.addEventListener('click', ()=> {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('dark', document.body.classList.contains('dark-mode'));
});
if (localStorage.getItem('dark')==='true') document.body.classList.add('dark-mode');

// Utilerías matemáticas
function factorial(n) {
  n = Number(n); if (!Number.isInteger(n) || n < 0) throw new Error('n entero no negativo');
  if (n <= 1) return 1; let r = 1; for (let i=2;i<=n;i++) r *= i; return r;
}
function combinacion(n,k) {
  n=Number(n); k=Number(k); if (k>n) return 0;
  return Math.round(factorial(n)/(factorial(k)*factorial(n-k)));
}
function permutacion(n,r) {
  n=Number(n); r=Number(r); if (r>n) return 0;
  return Math.round(factorial(n)/factorial(n-r));
}
function validarProb(v) { v=Number(v); if (isNaN(v) || v<0 || v>1) throw new Error('Valor entre 0 y 1'); return v; }
function destruirChart(id) { if (window._charts && window._charts[id]) { window._charts[id].destroy(); window._charts[id]=null; } }
if (!window._charts) window._charts = {};

// 1. Conteo
function calcularPermutacionSimple(e) {
  e.preventDefault();
  try {
    const n = Number(document.getElementById('n_perm').value);
    const res = factorial(n);
    document.getElementById('res_perm').innerHTML = `<div class="result">${n}! = ${res}</div>`;
  } catch (err) { document.getElementById('res_perm').innerHTML = `<div class="result error">${err.message}</div>`; }
}
function calcularPermutacionR(e) {
  e.preventDefault();
  try {
    const n = Number(document.getElementById('n_perm_r').value);
    const r = Number(document.getElementById('r_perm_r').value);
    const res = permutacion(n,r);
    document.getElementById('res_perm_r').innerHTML = `<div class="result">P(${n},${r}) = ${res}</div>`;
  } catch (err) { document.getElementById('res_perm_r').innerHTML = `<div class="result error">${err.message}</div>`; }
}
function calcularCombinacionSimple(e) {
  e.preventDefault();
  try {
    const n = Number(document.getElementById('n_comb').value);
    const k = Number(document.getElementById('k_comb').value);
    const res = combinacion(n,k);
    document.getElementById('res_comb').innerHTML = `<div class="result">C(${n},${k}) = ${res}</div>`;
  } catch (err) { document.getElementById('res_comb').innerHTML = `<div class="result error">${err.message}</div>`; }
}

// 2. Conceptos básicos
function calcularSimple(e) {
  e.preventDefault();
  try {
    const f = Number(document.getElementById('favorables').value);
    const t = Number(document.getElementById('totales').value);
    if (f>t) throw new Error('Favorables no puede ser mayor que totales');
    const p = f / t;
    document.getElementById('res_simple').innerHTML = `<div class="result">P(A) = ${p.toFixed(4)} (${(p*100).toFixed(2)}%)</div>`;
    destruirChart('chart_simple');
    const ctx = document.getElementById('chart_simple');
    window._charts['chart_simple'] = new Chart(ctx, {
      type:'pie', data:{labels:['Favorables','No favorables'], datasets:[{data:[f,t-f], backgroundColor:['#004aad','#00b894']}]}
    });
  } catch (err) { document.getElementById('res_simple').innerHTML = `<div class="result error">${err.message}</div>`; }
}
function calcularSuma(e) {
  e.preventDefault();
  try {
    const pA = validarProb(document.getElementById('pA_suma').value);
    const pB = validarProb(document.getElementById('pB_suma').value);
    const res = pA + pB;
    document.getElementById('res_suma').innerHTML = `<div class="result">Si A y B son excluyentes: P(A∪B) = ${res.toFixed(4)}</div>`;
  } catch (err) { document.getElementById('res_suma').innerHTML = `<div class="result error">${err.message}</div>`; }
}
function calcularUnion(e) {
  e.preventDefault();
  try {
    const pA = validarProb(document.getElementById('pA_union').value);
    const pB = validarProb(document.getElementById('pB_union').value);
    const pAB = validarProb(document.getElementById('pAB_union').value);
    const union = pA + pB - pAB;
    document.getElementById('res_union').innerHTML = `<div class="result">P(A∪B) = ${union.toFixed(4)}</div>`;
    destruirChart('chart_union');
    const ctx = document.getElementById('chart_union');
    window._charts['chart_union'] = new Chart(ctx, {
      type:'bar', data:{labels:['P(A)','P(B)','P(A∩B)','P(A∪B)'], datasets:[{data:[pA,pB,pAB,union], backgroundColor:['#004aad','#00b894','#ff7b54','#6c5ce7']}]}
    });
  } catch (err) { document.getElementById('res_union').innerHTML = `<div class="result error">${err.message}</div>`; }
}
function calcularProducto(e) {
  e.preventDefault();
  try {
    const raw = document.getElementById('opts_prod').value.trim();
    const m = Number(document.getElementById('m_prod').value);
    if (!raw) throw new Error('Opciones vacías');
    const parts = raw.split(',').map(s=>s.trim()).filter(Boolean).map(Number);
    let res = 1;
    let labels = [];
    if (parts.length === 1) {
      res = Math.pow(parts[0], m);
      for (let i=0;i<m;i++) labels.push(`Etapa ${i+1}`);
    } else {
      if (parts.length !== m) throw new Error('si lista por etapa, dar exactamente m números');
      res = parts.reduce((a,b)=>a*b,1);
      labels = parts.map((v,i)=>`E${i+1}`);
    }
    document.getElementById('res_prod').innerHTML = `<div class="result">Total combinaciones: ${res}</div>`;
    destruirChart('chart_prod');
    const ctx = document.getElementById('chart_prod');
    if (ctx) { window._charts['chart_prod'] = new Chart(ctx, { type:'bar', data:{labels, datasets:[{data:parts, backgroundColor:'#004aad'}]} }); }
  } catch (err) { document.getElementById('res_prod').innerHTML = `<div class="result error">${err.message}</div>`; }
}
function verificarIndependencia(e) {
  e.preventDefault();
  try {
    const pA = validarProb(document.getElementById('pA_ind').value);
    const pB = validarProb(document.getElementById('pB_ind').value);
    const pAB = validarProb(document.getElementById('pAB_ind').value);
    const indep = Math.abs(pA*pB - pAB) < 1e-9;
    document.getElementById('res_ind').innerHTML = `<div class="result">${indep? 'Independientes' : 'Dependientes'}</div>`;
  } catch (err) { document.getElementById('res_ind').innerHTML = `<div class="result error">${err.message}</div>`; }
}
function calcularComplemento(e) {
  e.preventDefault();
  try {
    const p = validarProb(document.getElementById('p_compl').value);
    document.getElementById('res_compl').innerHTML = `<div class="result">P(A^c) = ${(1-p).toFixed(4)}</div>`;
  } catch (err) { document.getElementById('res_compl').innerHTML = `<div class="result error">${err.message}</div>`; }
}

// 3. Condicionales y tablas
function calcularCondicional(e) {
  e.preventDefault();
  try {
    const pab = validarProb(document.getElementById('pab').value);
    const pb = validarProb(document.getElementById('pb').value);
    if (pb === 0) throw new Error('P(B)=0 no permitido');
    const res = pab / pb;
    document.getElementById('res_cond').innerHTML = `<div class="result">P(A|B) = ${res.toFixed(4)}</div>`;
    destruirChart('chart_cond');
    const ctx = document.getElementById('chart_cond');
    window._charts['chart_cond'] = new Chart(ctx, { type:'bar', data:{labels:['P(A∩B)','P(B)','P(A|B)'], datasets:[{data:[pab,pb,res], backgroundColor:['#004aad','#00b894','#ff7b54']}] } });
  } catch (err) { document.getElementById('res_cond').innerHTML = `<div class="result error">${err.message}</div>`; }
}
function calcularDesdeTabla(e) {
  e.preventDefault();
  try {
    const ab = Number(document.getElementById('t_ab').value);
    const a_nb = Number(document.getElementById('t_a_nb').value);
    const na_b = Number(document.getElementById('t_na_b').value);
    const na_nb = Number(document.getElementById('t_na_nb').value);
    const total = ab + a_nb + na_b + na_nb;
    if (total === 0) throw new Error('Total no puede ser 0');
    const pAB = ab/total, pB = (ab+na_b)/total, pA = (ab + a_nb)/total;
    const pA_given_B = pAB / pB;
    document.getElementById('res_tabla').innerHTML = `<div class="result">P(A|B) ≈ ${pA_given_B.toFixed(4)} — P(A)=${pA.toFixed(4)}, P(B)=${pB.toFixed(4)}</div>`;
    destruirChart('chart_tabla');
    const ctx = document.getElementById('chart_tabla');
    window._charts['chart_tabla'] = new Chart(ctx, { type:'pie', data:{labels:['A∩B','A∩B̄','Ā∩B','Ā∩B̄'], datasets:[{data:[ab,a_nb,na_b,na_nb], backgroundColor:['#004aad','#00b894','#ff7b54','#6c5ce7']}] } });
  } catch (err) { document.getElementById('res_tabla').innerHTML = `<div class="result error">${err.message}</div>`; }
}

// 4. Bayes
function calcularBayes(e) {
  e.preventDefault();
  try {
    const pa = validarProb(document.getElementById('pa').value);
    const pba = validarProb(document.getElementById('pba').value); // P(B|A)
    const pba_neg = validarProb(document.getElementById('pba_neg').value); // P(B|Ā)
    const pb = pba*pa + pba_neg*(1-pa);
    if (pb === 0) throw new Error('P(B)=0');
    const posterior = (pba*pa)/pb;
    document.getElementById('res_bayes').innerHTML = `<div class="result">P(A|B) = ${posterior.toFixed(4)}</div>`;
    destruirChart('chart_bayes');
    const ctx = document.getElementById('chart_bayes');
    window._charts['chart_bayes'] = new Chart(ctx, { type:'bar', data:{labels:['P(A)','P(B|A)','P(B|Ā)','P(A|B)'], datasets:[{data:[pa,pba,pba_neg,posterior], backgroundColor:['#004aad','#00b894','#ff7b54','#6c5ce7']}] } });
  } catch (err) { document.getElementById('res_bayes').innerHTML = `<div class="result error">${err.message}</div>`; }
}

// 5. Distribuciones discretas
function binom(n,p,k) { // P(X=k)
  if (k<0 || k>n) return 0;
  return combinacion(n,k) * Math.pow(p,k) * Math.pow(1-p,n-k);
}
function calcularBinomial(e) {
  e.preventDefault();
  try {
    const n = Number(document.getElementById('bin_n').value);
    const p = validarProb(document.getElementById('bin_p').value);
    const k = Number(document.getElementById('bin_k').value);
    const tipo = document.getElementById('bin_tipo').value;
    let res = 0;
    if (tipo==='exacto') res = binom(n,p,k);
    else if (tipo==='almenos') { for (let i=k;i<=n;i++) res += binom(n,p,i); }
    else { for (let i=0;i<=k;i++) res += binom(n,p,i); }
    document.getElementById('res_binomial').innerHTML = `<div class="result">Resultado = ${res.toFixed(6)}</div>`;
    destruirChart('chart_binomial');
    const ctx = document.getElementById('chart_binomial');
    const xs = [], ys=[];
    for (let i=0;i<=n;i++){ xs.push(i); ys.push(binom(n,p,i)); }
    window._charts['chart_binomial'] = new Chart(ctx, { type:'bar', data:{labels:xs,datasets:[{data:ys, backgroundColor:'#004aad'}]} });
  } catch (err) { document.getElementById('res_binomial').innerHTML = `<div class="result error">${err.message}</div>`; }
}
function calcularBinomialNegativa(e) {
  e.preventDefault();
  try {
    const r = Number(document.getElementById('bn_r').value);
    const p = validarProb(document.getElementById('bn_p').value);
    const x = Number(document.getElementById('bn_x').value); // failures
    const comb = combinacion(x + r - 1, x);
    const res = comb * Math.pow(p, r) * Math.pow(1-p, x);
    document.getElementById('res_bn').innerHTML = `<div class="result">P(X=${x}) = ${res.toFixed(6)}</div>`;
    destruirChart('chart_bn');
    const ctx = document.getElementById('chart_bn');
    const xs=[], ys=[];
    for (let i=0;i<=x+5;i++){ xs.push(i); ys.push(combinacion(i+r-1,i) * Math.pow(p,r) * Math.pow(1-p,i)); }
    window._charts['chart_bn'] = new Chart(ctx, { type:'bar', data:{labels:xs,datasets:[{data:ys, backgroundColor:'#00b894'}]} });
  } catch (err) { document.getElementById('res_bn').innerHTML = `<div class="result error">${err.message}</div>`; }
}
function poissonPMF(lambda,k){ return Math.pow(lambda,k)*Math.exp(-lambda)/factorial(k); }
function calcularPoisson(e) {
  e.preventDefault();
  try {
    const lambda = Number(document.getElementById('po_lambda').value);
    const k = Number(document.getElementById('po_k').value);
    const tipo = document.getElementById('po_tipo').value;
    let res = 0;
    if (tipo==='exacto') res = poissonPMF(lambda,k);
    else if (tipo==='menos') { for (let i=0;i<=k;i++) res += poissonPMF(lambda,i); }
    else { for (let i=k;i<=Math.max(k, Math.ceil(lambda+10*Math.sqrt(lambda)));i++) res += poissonPMF(lambda,i); } // approx tail
    document.getElementById('res_poisson').innerHTML = `<div class="result">Resultado = ${res.toFixed(6)}</div>`;
    destruirChart('chart_poisson');
    const ctx = document.getElementById('chart_poisson');
    const xs=[], ys=[];
    const max = Math.max(15, k+5, Math.ceil(lambda+4*Math.sqrt(lambda)));
    for (let i=0;i<=max;i++){ xs.push(i); ys.push(poissonPMF(lambda,i)); }
    window._charts['chart_poisson'] = new Chart(ctx, { type:'bar', data:{labels:xs,datasets:[{data:ys, backgroundColor:'#ff7b54'}]} });
  } catch (err) { document.getElementById('res_poisson').innerHTML = `<div class="result error">${err.message}</div>`; }
}

// 6. Distribuciones continuas
function exponencialCDF(lambda,x){ return 1 - Math.exp(-lambda*x); }
function calcularExponencial(e) {
  e.preventDefault();
  try {
    const lambda = Number(document.getElementById('exp_lambda').value);
    const tipo = document.getElementById('exp_tipo').value;
    const x = Number(document.getElementById('exp_x').value);
    const b = Number(document.getElementById('exp_b').value) || 0;
    let out = '';
    if (tipo==='pdf') out = `f(${x}) = ${(lambda*Math.exp(-lambda*x)).toFixed(6)}`;
    else if (tipo==='menor') out = `P(X < ${x}) = ${exponencialCDF(lambda,x).toFixed(6)}`;
    else if (tipo==='mayor') out = `P(X > ${x}) = ${(1 - exponencialCDF(lambda,x)).toFixed(6)}`;
    else out = `P(${x} < X < ${b}) = ${(exponencialCDF(lambda,b) - exponencialCDF(lambda,x)).toFixed(6)}`;
    document.getElementById('res_exp').innerHTML = `<div class="result">${out}</div>`;
    destruirChart('chart_exp');
    const ctx = document.getElementById('chart_exp');
    const xs = [], ys=[];
    const max = Math.max(5/lambda, x, b||0)*1.5;
    for (let t=0;t<=max;t+=max/100){ xs.push(t.toFixed(2)); ys.push(lambda*Math.exp(-lambda*t)); }
    window._charts['chart_exp'] = new Chart(ctx, { type:'line', data:{labels:xs,datasets:[{data:ys,borderColor:'#004aad',fill:true}]} });
  } catch (err) { document.getElementById('res_exp').innerHTML = `<div class="result error">${err.message}</div>`; }
}

// Normal: PDF, CDF (erf approx) y calculos inversos (aproximado)
function erf(x){ // aproximación
  const sign = x<0?-1:1; x = Math.abs(x);
  const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
  const t = 1/(1+p*x);
  const y = 1 - ((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
  return sign*y;
}
function normalCDF(x,mu,sigma){ return 0.5*(1+erf((x-mu)/(Math.SQRT2*sigma))); }
function normalPDF(x,mu,sigma){ return (1/(Math.sqrt(2*Math.PI)*sigma))*Math.exp(-0.5*Math.pow((x-mu)/sigma,2)); }
function calcularNormal(e) {
  e.preventDefault();
  try {
    const mu = Number(document.getElementById('norm_mu').value);
    const sigma = Number(document.getElementById('norm_sigma').value);
    const tipo = document.getElementById('norm_tipo').value;
    if (sigma <= 0) throw new Error('σ debe ser > 0');
    let out = '';
    if (tipo==='lt') {
      const x = Number(document.getElementById('norm_x').value);
      out = `P(X < ${x}) = ${normalCDF(x,mu,sigma).toFixed(6)}`;
    } else if (tipo==='gt') {
      const x = Number(document.getElementById('norm_x').value);
      out = `P(X > ${x}) = ${(1-normalCDF(x,mu,sigma)).toFixed(6)}`;
    } else if (tipo==='entre') {
      const a = Number(document.getElementById('norm_a').value);
      const b = Number(document.getElementById('norm_b').value);
      out = `P(${a} < X < ${b}) = ${(normalCDF(b,mu,sigma)-normalCDF(a,mu,sigma)).toFixed(6)}`;
    } else { // inverso: calcular x dado prob (aprox) usando búsqueda
      const p = Number(document.getElementById('norm_p').value);
      if (p<=0||p>=1) throw new Error('Prob entre 0 y 1');
      // binary search for x
      let lo = mu - 10*sigma, hi = mu + 10*sigma, mid;
      for (let i=0;i<60;i++){ mid=(lo+hi)/2; if (normalCDF(mid,mu,sigma) < p) lo = mid; else hi = mid; }
      out = `x ≈ ${mid.toFixed(6)} tal que P(X < x) = ${p}`;
    }
    document.getElementById('res_norm').innerHTML = `<div class="result">${out}</div>`;
    destruirChart('chart_norm');
    const ctx = document.getElementById('chart_norm');
    const xs=[]; const ys=[];
    const min = mu - 4*sigma, max = mu + 4*sigma;
    for (let t=min;t<=max;t+=(max-min)/200){ xs.push(t.toFixed(2)); ys.push(normalPDF(t,mu,sigma)); }
    window._charts['chart_norm'] = new Chart(ctx, { type:'line', data:{labels:xs,datasets:[{data:ys,borderColor:'#00b894',fill:true}] } });
  } catch (err) { document.getElementById('res_norm').innerHTML = `<div class="result error">${err.message}</div>`; }
}

// Mostrar/ocultar inputs dependientes (pequeñas ayudas UI)
document.getElementById('exp_tipo')?.addEventListener('change', (e)=>{
  const t = e.target.value;
  document.getElementById('label_exp_b').style.display = (t==='entre') ? 'block' : 'none';
});
document.getElementById('norm_tipo')?.addEventListener('change', (e)=>{
  const t = e.target.value;
  document.getElementById('label_norm_x').style.display = (t==='lt' || t==='gt') ? 'block' : 'none';
  document.getElementById('label_norm_a').style.display = (t==='entre') ? 'block' : 'none';
  document.getElementById('label_norm_b').style.display = (t==='entre') ? 'block' : 'none';
  document.getElementById('label_norm_p').style.display = (t==='valor') ? 'block' : 'none';
});

// ===== Inicializador y control de modo claro/oscuro =====
(function initDarkMode() {
  const btn = document.getElementById('toggle-dark');
  if (!btn) return;

  // Actualiza el icono del botón según el estado actual
  function actualizarIcono() {
    btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌓';
    btn.title = document.body.classList.contains('dark-mode') ? 'Cambiar a claro' : 'Cambiar a oscuro';
  }

  // Carga preferencia guardada (si existe)
  const preferencia = localStorage.getItem('darkMode');
  if (preferencia === 'true') document.body.classList.add('dark-mode');
  else if (preferencia === 'false') document.body.classList.remove('dark-mode');
  // Si no hay preferencia, no forzamos nada (respeta preferencia del sistema/CSS)

  actualizarIcono();

  // Toggle al hacer clic y guardar preferencia
  btn.addEventListener('click', () => {
    const activo = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', activo);
    actualizarIcono();
  });

  // Opcional: escucha cambios en preferencia del sistema y respeta guardado
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', (e) => {
      // Solo aplicar cambio si el usuario NO guardó una preferencia explícita
      if (localStorage.getItem('darkMode') === null) {
        if (e.matches) document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
        actualizarIcono();
      }
    });
  } catch (err) {
    // navegadores antiguos: no importa
  }
})();
