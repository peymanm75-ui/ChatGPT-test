const molarityCalcButton = document.getElementById("molarity-calc");
const molarityClearButton = document.getElementById("molarity-clear");
const molarityStatus = document.getElementById("molarity-status");
const molarWeightInput = document.getElementById("molar-weight");
const molesInputs = {
  mol: document.getElementById("moles-mol"),
  mmol: document.getElementById("moles-mmol"),
  umol: document.getElementById("moles-umol")
};
const massInputs = {
  g: document.getElementById("mass-g"),
  mg: document.getElementById("mass-mg"),
  ug: document.getElementById("mass-ug")
};

const pubchemQuery = document.getElementById("pubchem-query");
const pubchemSearch = document.getElementById("pubchem-search");
const pubchemResult = document.getElementById("pubchem-result");
const pubchemLink = document.getElementById("pubchem-link");

const voiceStart = document.getElementById("voice-start");
const voiceStop = document.getElementById("voice-stop");
const voiceStatus = document.getElementById("voice-status");

const reactionVolumeInput = document.getElementById("reaction-volume");
const reactionCountInput = document.getElementById("reaction-count");
const bufferNameInput = document.getElementById("buffer-name");
const addComponentButton = document.getElementById("add-component");
const componentsContainer = document.getElementById("components");
const mixCalcButton = document.getElementById("mix-calc");
const mixClearButton = document.getElementById("mix-clear");
const mixStatus = document.getElementById("mix-status");
const mixResults = document.getElementById("mix-results");

const unitFactors = {
  mol: 1,
  mmol: 1e-3,
  umol: 1e-6,
  g: 1,
  mg: 1e-3,
  ug: 1e-6
};

const volumeUnits = {
  uL: 1,
  mL: 1000,
  L: 1_000_000
};

const formatNumber = (value, decimals = 4) => {
  if (!Number.isFinite(value)) {
    return "";
  }
  return Number(value.toFixed(decimals)).toString();
};

const getMoles = () => {
  const values = Object.entries(molesInputs)
    .map(([unit, input]) => ({ unit, value: parseFloat(input.value) }))
    .filter(({ value }) => Number.isFinite(value));

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, { unit, value }) => sum + value * unitFactors[unit], 0);
  return total;
};

const setMoles = (moles) => {
  if (!Number.isFinite(moles)) {
    return;
  }
  molesInputs.mol.value = formatNumber(moles, 6);
  molesInputs.mmol.value = formatNumber(moles / unitFactors.mmol, 4);
  molesInputs.umol.value = formatNumber(moles / unitFactors.umol, 2);
};

const getMass = () => {
  const values = Object.entries(massInputs)
    .map(([unit, input]) => ({ unit, value: parseFloat(input.value) }))
    .filter(({ value }) => Number.isFinite(value));

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, { unit, value }) => sum + value * unitFactors[unit], 0);
  return total;
};

const setMass = (massG) => {
  if (!Number.isFinite(massG)) {
    return;
  }
  massInputs.g.value = formatNumber(massG, 6);
  massInputs.mg.value = formatNumber(massG / unitFactors.mg, 4);
  massInputs.ug.value = formatNumber(massG / unitFactors.ug, 2);
};

const getMolarWeight = () => {
  const value = parseFloat(molarWeightInput.value);
  return Number.isFinite(value) ? value : null;
};

const setMolarWeight = (value) => {
  molarWeightInput.value = Number.isFinite(value) ? formatNumber(value, 4) : "";
};

const updateMolarityStatus = (message, isError = false) => {
  molarityStatus.textContent = message;
  molarityStatus.style.color = isError ? "#b42318" : "var(--muted)";
};

const calculateMolarity = () => {
  const moles = getMoles();
  const mass = getMass();
  const molarWeight = getMolarWeight();

  const known = [moles, mass, molarWeight].filter((value) => value !== null);
  if (known.length < 2) {
    updateMolarityStatus("Enter any two of moles, mass, and molar weight to calculate the third.", true);
    return;
  }

  if (moles !== null && mass !== null && molarWeight !== null) {
    updateMolarityStatus("All three values are provided. Clear one field to calculate.");
    return;
  }

  if (moles === null && mass !== null && molarWeight !== null) {
    const computedMoles = mass / molarWeight;
    setMoles(computedMoles);
    updateMolarityStatus("Calculated moles from mass and molar weight.");
    return;
  }

  if (mass === null && moles !== null && molarWeight !== null) {
    const computedMass = moles * molarWeight;
    setMass(computedMass);
    updateMolarityStatus("Calculated mass from moles and molar weight.");
    return;
  }

  if (molarWeight === null && moles !== null && mass !== null) {
    const computedWeight = mass / moles;
    setMolarWeight(computedWeight);
    updateMolarityStatus("Calculated molar weight from moles and mass.");
  }
};

const clearMolarity = () => {
  Object.values(molesInputs).forEach((input) => {
    input.value = "";
  });
  Object.values(massInputs).forEach((input) => {
    input.value = "";
  });
  molarWeightInput.value = "";
  updateMolarityStatus("");
};

const pubchemLookup = async (query) => {
  const response = await fetch(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/MolecularWeight,Title/JSON`
  );
  if (!response.ok) {
    throw new Error("PubChem lookup failed");
  }
  const data = await response.json();
  const record = data?.PropertyTable?.Properties?.[0];
  return record;
};

const handlePubchemSearch = async () => {
  const query = pubchemQuery.value.trim();
  if (!query) {
    pubchemResult.textContent = "Enter a chemical name to search.";
    return;
  }

  pubchemResult.textContent = "Searching PubChem...";
  pubchemLink.href = `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(query)}`;
  pubchemLink.textContent = "Open PubChem search";

  try {
    const record = await pubchemLookup(query);
    if (!record) {
      pubchemResult.textContent = "No results found. Try a different name.";
      return;
    }
    pubchemResult.textContent = `${record.Title}: ${formatNumber(record.MolecularWeight, 4)} g/mol`;
    pubchemLink.href = `https://pubchem.ncbi.nlm.nih.gov/compound/${record.CID}`;
    pubchemLink.textContent = "Open PubChem record";
    setMolarWeight(record.MolecularWeight);
  } catch (error) {
    pubchemResult.textContent = "Unable to reach PubChem right now.";
  }
};

let recognition;
let listening = false;

const initSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceStatus.textContent = "Speech recognition is not supported in this browser.";
    voiceStart.disabled = true;
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    voiceStatus.textContent = `Heard: "${transcript}"`;
    await answerVoiceQuery(transcript);
  };
  recognition.onerror = () => {
    voiceStatus.textContent = "Voice input failed. Try again.";
  };
  recognition.onend = () => {
    listening = false;
  };
};

const speak = (message) => {
  if (!window.speechSynthesis) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-US";
  window.speechSynthesis.speak(utterance);
};

const parseMassQuery = (text) => {
  const lower = text.toLowerCase();
  const unitMatch = lower.match(/(microgram|micrograms|µg|ug|milligram|milligrams|mg|gram|grams|g)/);
  if (!unitMatch) {
    return null;
  }
  const unit = unitMatch[0];
  const unitKey = unit.includes("micro") || unit === "ug" || unit === "µg" ? "ug" : unit.includes("milli") || unit === "mg" ? "mg" : "g";
  const hasOneMole = lower.includes("one mole") || lower.includes("1 mole");
  if (!hasOneMole) {
    return null;
  }
  const nameMatch = lower.replace(/how much|what is|equal to|equals|one mole|micrograms|microgram|milligrams|milligram|grams|gram|g|mg|ug|µg/gi, "").trim();
  return { unitKey, name: nameMatch || null };
};

const answerVoiceQuery = async (query) => {
  const massQuery = parseMassQuery(query);
  const name = massQuery?.name || query;

  try {
    const record = await pubchemLookup(name);
    if (!record) {
      voiceStatus.textContent = "No matching compound found on PubChem.";
      speak("I could not find that compound on PubChem.");
      return;
    }
    const molWeight = record.MolecularWeight;

    if (massQuery) {
      const massInGrams = molWeight;
      const massConverted = massInGrams / unitFactors[massQuery.unitKey];
      const response = `One mole of ${record.Title} is ${formatNumber(massConverted, 2)} ${massQuery.unitKey}.`;
      voiceStatus.textContent = response;
      speak(response);
      return;
    }

    const response = `${record.Title} has a molar weight of ${formatNumber(molWeight, 4)} grams per mole.`;
    voiceStatus.textContent = response;
    speak(response);
    setMolarWeight(molWeight);
  } catch (error) {
    voiceStatus.textContent = "Unable to reach PubChem for that request.";
    speak("I could not reach PubChem right now.");
  }
};

const addComponentRow = (component = {}) => {
  const wrapper = document.createElement("div");
  wrapper.className = "component";
  wrapper.innerHTML = `
    <div class="grid-two">
      <div class="field-group">
        <label>Component name</label>
        <input type="text" class="component-name" placeholder="e.g., primer" value="${component.name || ""}" />
      </div>
      <div class="field-group">
        <label>Stock concentration</label>
        <input type="number" step="any" class="component-stock" placeholder="e.g., 10" value="${component.stock || ""}" />
      </div>
    </div>
    <div class="grid-two">
      <div class="field-group">
        <label>Final concentration (optional)</label>
        <input type="number" step="any" class="component-final" placeholder="e.g., 0.5" value="${component.final || ""}" />
      </div>
      <div class="field-group">
        <label>Dilution factor (optional)</label>
        <input type="number" step="any" class="component-dilution" placeholder="e.g., 20" value="${component.dilution || ""}" />
      </div>
    </div>
    <button type="button" class="ghost remove-component">Remove component</button>
  `;
  wrapper.querySelector(".remove-component").addEventListener("click", () => {
    wrapper.remove();
  });
  componentsContainer.appendChild(wrapper);
};

const getComponentData = () => {
  const components = Array.from(componentsContainer.querySelectorAll(".component")).map((component) => {
    const name = component.querySelector(".component-name").value.trim() || "Component";
    const stock = parseFloat(component.querySelector(".component-stock").value);
    const final = parseFloat(component.querySelector(".component-final").value);
    const dilution = parseFloat(component.querySelector(".component-dilution").value);

    return { name, stock, final, dilution };
  });
  return components;
};

const calculateComponentVolume = (component, totalVolume) => {
  if (!Number.isFinite(component.stock)) {
    return null;
  }
  if (Number.isFinite(component.final)) {
    return (component.final / component.stock) * totalVolume;
  }
  if (Number.isFinite(component.dilution)) {
    return totalVolume / component.dilution;
  }
  return null;
};

const formatVolumeRow = (name, volume) => {
  return `
    <tr>
      <td>${name}</td>
      <td>${formatNumber(volume / volumeUnits.L, 6)} L</td>
      <td>${formatNumber(volume / volumeUnits.mL, 4)} mL</td>
      <td>${formatNumber(volume, 2)} µL</td>
    </tr>
  `;
};

const handleMixCalculation = () => {
  const reactionVolume = parseFloat(reactionVolumeInput.value);
  const reactionCount = parseFloat(reactionCountInput.value);

  if (!Number.isFinite(reactionVolume) || !Number.isFinite(reactionCount)) {
    mixStatus.textContent = "Enter both final volume per reaction and the number of reactions.";
    return;
  }

  const totalVolume = reactionVolume * reactionCount;
  const components = getComponentData();

  let totalComponentsVolume = 0;
  const rows = [];

  for (const component of components) {
    const volume = calculateComponentVolume(component, totalVolume);
    if (!Number.isFinite(volume)) {
      mixStatus.textContent = "Each component needs a stock concentration and either final concentration or dilution factor.";
      return;
    }
    totalComponentsVolume += volume;
    rows.push(formatVolumeRow(component.name, volume));
  }

  const bufferVolume = totalVolume - totalComponentsVolume;
  if (bufferVolume < 0) {
    mixStatus.textContent = "Component volumes exceed the total master mix volume.";
    return;
  }

  const bufferName = bufferNameInput.value.trim() || "Buffer";
  rows.push(formatVolumeRow(bufferName, bufferVolume));

  mixResults.innerHTML = `
    <table class="results-table">
      <thead>
        <tr>
          <th>Component</th>
          <th>Volume (L)</th>
          <th>Volume (mL)</th>
          <th>Volume (µL)</th>
        </tr>
      </thead>
      <tbody>
        ${rows.join("")}
      </tbody>
    </table>
    <p class="muted">Total master mix volume: ${formatNumber(totalVolume, 2)} µL</p>
  `;

  mixStatus.textContent = "Master mix calculated.";
};

const clearMix = () => {
  reactionVolumeInput.value = "";
  reactionCountInput.value = "";
  bufferNameInput.value = "";
  componentsContainer.innerHTML = "";
  mixResults.innerHTML = "";
  mixStatus.textContent = "";
};

molarityCalcButton.addEventListener("click", calculateMolarity);
molarityClearButton.addEventListener("click", clearMolarity);
pubchemSearch.addEventListener("click", handlePubchemSearch);

voiceStart.addEventListener("click", () => {
  if (!recognition) {
    initSpeechRecognition();
  }
  if (recognition && !listening) {
    listening = true;
    recognition.start();
    voiceStatus.textContent = "Listening...";
  }
});

voiceStop.addEventListener("click", () => {
  if (recognition && listening) {
    recognition.stop();
    listening = false;
    voiceStatus.textContent = "Voice input stopped.";
  }
});

addComponentButton.addEventListener("click", () => addComponentRow());
mixCalcButton.addEventListener("click", handleMixCalculation);
mixClearButton.addEventListener("click", clearMix);

addComponentRow();
initSpeechRecognition();
