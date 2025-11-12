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
