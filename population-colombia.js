const inputDepto = document.getElementById("inputDepto");
const btnBuscar = document.getElementById("btnBuscar");

const seccionResultado = document.getElementById("resultado");
const seccionError = document.getElementById("error");
const nombreDepto = document.getElementById("nombreDepto");
const poblacionDepto = document.getElementById("poblacionDepto");
const infoDepto = document.getElementById("infoDepto");
const listaMunicipios = document.getElementById("listaMunicipios");

btnBuscar.addEventListener("click", buscarDepartamento);
inputDepto.addEventListener("keydown", (e) => {
    if (e.key === "Enter") buscarDepartamento();
});

function resetUI() {
    seccionResultado.classList.add("oculto");
    seccionError.classList.add("oculto");
    listaMunicipios.innerHTML = "";
    nombreDepto.textContent = "";
    poblacionDepto.textContent = "";
    infoDepto.textContent = "";
}

async function buscarDepartamento() {
const nombreRaw = inputDepto.value.trim();
if (!nombreRaw) return;

resetUI();

try {

    const nombreEncoded = encodeURIComponent(nombreRaw.toLowerCase());
    const urlDeptoByName = `https://api-colombia.com/api/v1/Department/name/${nombreEncoded}`;

    const resp = await fetch(urlDeptoByName);
    if (!resp.ok) {

    seccionError.classList.remove("oculto");
    seccionError.textContent = `No se encontró el departamento (status ${resp.status}).`;
    return;
    }

    const data = await resp.json();
    const depto = Array.isArray(data) ? data[0] : data;

    if (!depto) {
    seccionError.classList.remove("oculto");
    seccionError.textContent = "No se obtuvo información del departamento.";
    return;
    }


    nombreDepto.textContent = depto.name ?? "Nombre no disponible";

    const poblacion = depto.population ?? depto.population_total ?? null;
    poblacionDepto.textContent = poblacion ? `Población total: ${Number(poblacion).toLocaleString()}` : "Población: No disponible";


    const area = depto.surface ?? depto.area ?? depto.areaTotal ?? null;
    infoDepto.textContent = area ? `Área total: ${Number(area).toLocaleString()} km²` : "Área total: No disponible";


    if (!depto.id) {

    console.warn("Departamento sin id en la respuesta:", depto);
    } else {
    const urlCities = `https://api-colombia.com/api/v1/Department/${depto.id}/cities`;
    const respCities = await fetch(urlCities);
    if (respCities.ok) {
        const municipios = await respCities.json();
        listaMunicipios.innerHTML = "";
        if (Array.isArray(municipios) && municipios.length > 0) {
        municipios.forEach(m => {
            const div = document.createElement("div");
            div.classList.add("card");
            const poblM = m.population ?? m.population_total ?? null;
            div.innerHTML = `
            <strong>${m.name}</strong><br>
            Población: ${poblM ? Number(poblM).toLocaleString() : "No disponible"}
            `;
            listaMunicipios.appendChild(div);
        });
        } else {
        listaMunicipios.innerHTML = "<p>No hay municipios disponibles.</p>";
        }
    } else {

        console.warn(`No se pudieron obtener municipios (status ${respCities.status})`);
        listaMunicipios.innerHTML = "<p>No fue posible obtener los municipios.</p>";
    }
    }

    seccionResultado.classList.remove("oculto");

} catch (err) {
    console.error("Error en buscarDepartamento:", err);
    seccionError.classList.remove("oculto");
    seccionError.textContent = "Ocurrió un error al consultar la API. Revisa la consola (F12).";
}
}