let chartSimple, chartCondicional, chartCompuesta, chartBayes;

// Mostrar secciones
function mostrarSeccion(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("activo"));
  document.getElementById(id).classList.add("activo");
}

// -----------------------------
// PROBABILIDAD SIMPLE
// -----------------------------
function calcularSimple(e) {
  e.preventDefault();
  const f = parseFloat(document.getElementById("favorables").value);
  const t = parseFloat(document.getElementById("totales").value);

  if (f > t) {
    document.getElementById("resultado-simple").innerText =
      "Los casos favorables no pueden ser mayores que los totales.";
    return;
  }

  const p = f / t;
  document.getElementById("resultado-simple").innerText =
    `P(A) = ${p.toFixed(4)} (${(p * 100).toFixed(2)}%)`;

  const datos = [f, t - f];
  const etiquetas = ["Favorables", "No favorables"];

  // Destruir gráfico anterior
  if (chartSimple) chartSimple.destroy();

  chartSimple = new Chart(document.getElementById("graficoSimple"), {
    type: "pie",
    data: {
      labels: etiquetas,
      datasets: [{
        data: datos,
        backgroundColor: ["#004aad", "#ff4a4a"]
      }]
    },
    options: {
      plugins: { legend: { position: "bottom" } }
    }
  });
}

// -----------------------------
// PROBABILIDAD CONDICIONAL
// -----------------------------
function calcularCondicional(e) {
  e.preventDefault();
  const pab = parseFloat(document.getElementById("pab").value);
  const pb = parseFloat(document.getElementById("pb").value);
  const resultado = pab / pb;

  document.getElementById("resultado-condicional").innerText =
    `P(A|B) = ${resultado.toFixed(4)}`;

  if (chartCondicional) chartCondicional.destroy();
  chartCondicional = new Chart(document.getElementById("graficoCondicional"), {
    type: "bar",
    data: {
      labels: ["P(A ∩ B)", "P(B)", "P(A|B)"],
      datasets: [{
        label: "Probabilidades",
        data: [pab, pb, resultado],
        backgroundColor: ["#004aad", "#00b894", "#ff4a4a"]
      }]
    },
    options: { scales: { y: { beginAtZero: true, max: 1 } } }
  });
}

// -----------------------------
// PROBABILIDAD COMPUESTA
// -----------------------------
function calcularCompuesta(e) {
  e.preventDefault();
  const pa = parseFloat(document.getElementById("pa").value);
  const pb = parseFloat(document.getElementById("pb2").value);
  const resultado = pa * pb;

  document.getElementById("resultado-compuesta").innerText =
    `P(A ∩ B) = ${resultado.toFixed(4)}`;

  if (chartCompuesta) chartCompuesta.destroy();
  chartCompuesta = new Chart(document.getElementById("graficoCompuesta"), {
    type: "bar",
    data: {
      labels: ["P(A)", "P(B)", "P(A ∩ B)"],
      datasets: [{
        label: "Probabilidades",
        data: [pa, pb, resultado],
        backgroundColor: ["#004aad", "#00b894", "#ff4a4a"]
      }]
    },
    options: { scales: { y: { beginAtZero: true, max: 1 } } }
  });
}

// -----------------------------
// TEOREMA DE BAYES
// -----------------------------
function calcularBayes(e) {
  e.preventDefault();
  const pba = parseFloat(document.getElementById("pba").value);
  const pa = parseFloat(document.getElementById("pa2").value);
  const pb = parseFloat(document.getElementById("pb3").value);
  const resultado = (pba * pa) / pb;

  document.getElementById("resultado-bayes").innerText =
    `P(A|B) = ${resultado.toFixed(4)}`;

  if (chartBayes) chartBayes.destroy();
  chartBayes = new Chart(document.getElementById("graficoBayes"), {
    type: "bar",
    data: {
      labels: ["P(B|A)", "P(A)", "P(B)", "P(A|B)"],
      datasets: [{
        label: "Probabilidades",
        data: [pba, pa, pb, resultado],
        backgroundColor: ["#004aad", "#00b894", "#ff4a4a", "#f39c12"]
      }]
    },
    options: { scales: { y: { beginAtZero: true, max: 1 } } }
  });
}
