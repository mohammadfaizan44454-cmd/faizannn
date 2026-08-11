/* ==========================================================================
   KRISHIRAKSHAK AI - CORE JAVASCRIPT APPLICATION ENGINE
   Features: AI Disease Scan, Climate Intelligence, Smart Irrigation Advisor,
             Voice Engine (TTS/STT), What-If Simulator, Community Map,
             Low-Literacy Mode, Emergency Mode, 2-Min Guided WOW Tour.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- 1. GLOBAL STATE MANAGER ---
  const state = {
    farmer: {
      name: "Ravi Kumar",
      location: "Guntur, Andhra Pradesh",
      crop: "Tomato",
      cropIcon: "🍅",
      stage: "Flowering",
      acreage: 2.5,
      irrigationType: "Canal",
      soilType: "Red Loamy"
    },
    weather: {
      temp: 36,
      humidity: 84,
      rainProb: 78,
      wind: 14,
      uv: "High"
    },
    resilienceScore: 78,
    activeView: "view-home",
    lang: "en",
    lowLiteracy: false,
    emergencyMode: false,
    selectedPresetLeaf: "tomato-early-blight",
    tourStep: 0,
    tourActive: false,
    history: [
      { date: "Today 11:20 AM", title: "AI Irrigation Advisory", desc: "Delayed irrigation due to 78% rainfall forecast." },
      { date: "3 Days Ago", title: "Leaf Scan Diagnostic", desc: "Tomato Early Blight identified (82% confidence)." }
    ]
  };

  // --- 2. PRESET DISEASE DATABASE ---
  const diseaseDatabase = {
    "tomato-early-blight": {
      name: "Tomato Early Blight",
      pathogen: "Alternaria solani (Fungal Infection)",
      confidence: 87,
      simpleExplanation: "Dark concentric rings with yellow halos found on lower leaves. High humidity (84%) and rainfall forecast are accelerating fungal spore germination.",
      causes: "High humidity, leaf wetness over 8 hours, poor airflow, and wind-blown spores.",
      actions: [
        { title: "Immediate Action", desc: "Prune infected lower leaves immediately and dispose of away from field." },
        { title: "Field Management", desc: "Avoid overhead sprinkler watering; keep leaf canopy dry during high humidity." },
        { title: "Preventive Action", desc: "Improve plant spacing and clear drainage channels before tonight's rain." },
        { title: "Monitoring Schedule", desc: "Re-inspect field after 48 hours. If spreading continues, consult local expert." }
      ]
    },
    "paddy-blight": {
      name: "Rice Bacterial Leaf Blight",
      pathogen: "Xanthomonas oryzae (Bacterial)",
      confidence: 89,
      simpleExplanation: "Water-soaked lesions turning yellow along leaf margins. Heavy rains and high temperatures spread bacterial ooze quickly.",
      causes: "Wind-blown rain, flooded fields, high nitrogen fertilizer application.",
      actions: [
        { title: "Immediate Action", desc: "Drain excess standing water from paddy fields to reduce humidity." },
        { title: "Field Management", desc: "Temporarily delay top-dressing nitrogen fertilizers until symptoms stabilize." },
        { title: "Preventive Action", desc: "Apply fresh neem cake or copper-based spray according to local agricultural guidance." },
        { title: "Monitoring Schedule", desc: "Inspect fresh leaves daily after heavy rainfall events." }
      ]
    },
    "cotton-curl": {
      name: "Cotton Leaf Curl Virus",
      pathogen: "Begomovirus (Whitefly-transmitted)",
      confidence: 84,
      simpleExplanation: "Upward leaf curling with thickened veins. Transmitted primarily by whitefly pests under warm dry conditions.",
      causes: "Whitefly vector population explosion, nearby host weed growth.",
      actions: [
        { title: "Immediate Action", desc: "Deploy yellow sticky traps (10/acre) to monitor whitefly population." },
        { title: "Field Management", desc: "Remove weeds around field borders that serve as whitefly reservoirs." },
        { title: "Preventive Action", desc: "Spray bio-insecticide like neem oil (10,000 ppm) during early morning." },
        { title: "Monitoring Schedule", desc: "Check terminal leaves every 3 days for pest buildup." }
      ]
    },
    "healthy-leaf": {
      name: "Healthy Tomato Leaf",
      pathogen: "No Pathogen Detected (Normal)",
      confidence: 96,
      simpleExplanation: "Vibrant green leaf tissue with robust leaf structure. No fungal spots, necrosis, or pest damage observed.",
      causes: "Optimal nutrient balance and good field aeration.",
      actions: [
        { title: "Immediate Action", desc: "No curative chemical or manual intervention required." },
        { title: "Field Management", desc: "Maintain regular weed management and scheduled drip irrigation." },
        { title: "Preventive Action", desc: "Keep field drainage clear in anticipation of upcoming rain." },
        { title: "Monitoring Schedule", desc: "Routine visual inspection twice a week." }
      ]
    }
  };

  // --- 3. VIEW SWITCHER & NAVIGATION ---
  function switchView(targetViewId) {
    state.activeView = targetViewId;
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });
    const targetSection = document.getElementById(targetViewId);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    document.querySelectorAll('.nav-tab').forEach(tab => {
      if (tab.getAttribute('data-target') === targetViewId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Trigger canvas renders if applicable
    if (targetViewId === 'view-scanner') {
      renderScannerCanvas();
    } else if (targetViewId === 'view-community') {
      renderCommunityMap();
    }
  }

  // Bind nav tab clicks
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      switchView(target);
    });
  });

  // Bind homepage hero & dashboard action buttons
  document.getElementById('brand-home-link').addEventListener('click', () => switchView('view-home'));
  document.getElementById('hero-btn-scan').addEventListener('click', () => switchView('view-scanner'));
  document.getElementById('hero-btn-farm').addEventListener('click', () => switchView('view-dashboard'));
  document.getElementById('btn-dash-scan-now')?.addEventListener('click', () => switchView('view-scanner'));
  document.getElementById('btn-re-onboard')?.addEventListener('click', () => switchView('view-onboarding'));

  // Language Selector Change Event Listener
  const langSelect = document.getElementById('lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      state.lang = e.target.value;
      speakText(`Language changed to ${e.target.options[e.target.selectedIndex].text}`);
    });
  }

  // --- 4. LANGUAGE & VOICE (TTS/STT) ENGINE ---
  const langVoiceMap = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'te': 'te-IN',
    'ta': 'ta-IN',
    'kn': 'kn-IN',
    'mr': 'mr-IN',
    'bn': 'bn-IN'
  };

  function speakText(text) {
    if (!('speechSynthesis' in window)) {
      alert("Voice playback: " + text);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langVoiceMap[state.lang] || 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  // Voice Recording STT Simulation / Web Speech API Integration
  const micBtn = document.getElementById('btn-mic-record');
  const micStatusLabel = document.getElementById('mic-status-label');
  const voiceWaves = document.getElementById('voice-waves-container');

  let isListening = false;
  let recognition = null;

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening = true;
      micBtn.classList.add('listening');
      micStatusLabel.innerText = "Listening... Speak now!";
      voiceWaves.style.visibility = 'visible';
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      processUserQuery(transcript);
    };

    recognition.onerror = () => {
      stopListening();
    };

    recognition.onend = () => {
      stopListening();
    };
  }

  function startListening() {
    if (recognition) {
      recognition.lang = langVoiceMap[state.lang] || 'en-US';
      try { recognition.start(); } catch(e) {}
    } else {
      // Fallback simulation for unsupported browsers
      isListening = true;
      micBtn.classList.add('listening');
      micStatusLabel.innerText = "Listening (Demo Simulation)...";
      voiceWaves.style.visibility = 'visible';
      setTimeout(() => {
        stopListening();
        processUserQuery("Should I water my tomato crop today?");
      }, 3000);
    }
  }

  function stopListening() {
    isListening = false;
    micBtn.classList.remove('listening');
    micStatusLabel.innerText = "Tap Mic to Speak";
    voiceWaves.style.visibility = 'hidden';
  }

  micBtn.addEventListener('click', () => {
    if (!isListening) {
      startListening();
    } else {
      if (recognition) recognition.stop();
      stopListening();
    }
  });

  // Handle Quick Voice Chips
  document.querySelectorAll('.prompt-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      processUserQuery(query);
    });
  });

  function processUserQuery(query) {
    const chatContainer = document.getElementById('chat-messages');
    
    // Append User Message
    const userMsgEl = document.createElement('div');
    userMsgEl.className = 'chat-bubble user';
    userMsgEl.innerText = query;
    chatContainer.appendChild(userMsgEl);

    // Compute AI Contextual Answer
    let answerText = "";
    const qLower = query.toLowerCase();

    if (qLower.includes("water") || qLower.includes("నీళ్లు") || qLower.includes("irrigate")) {
      answerText = "💧 Recommendation for Ravi (Tomato in Guntur): DO NOT WATER TODAY. Rain probability is 78% within 8 hours. Waiting will save ~14,000 Liters of water and protect root health.";
    } else if (qLower.includes("yellow") || qLower.includes("leaves") || qLower.includes("blight")) {
      answerText = "🍃 Yellowing leaves with dark concentric spots indicate Tomato Early Blight. Prune lower leaves and clear field drainage channels before the rain starts tonight.";
    } else if (qLower.includes("rain") || qLower.includes("weather")) {
      answerText = "🌧️ Heavy rain (78% probability) is expected in Guntur tonight within 8 hours. Wind speeds around 14 km/h. Inspect drainage ditches today!";
    } else {
      answerText = `🌾 Krishi AI Analysis for ${state.farmer.crop} in ${state.farmer.location}: Field humidity is currently ${state.weather.humidity}%. Maintain leaf dry periods and monitor for early fungal signs after tonight's rain.`;
    }

    setTimeout(() => {
      const botMsgEl = document.createElement('div');
      botMsgEl.className = 'chat-bubble bot';
      botMsgEl.innerHTML = `<strong>🌾 Krishi AI:</strong> ${answerText}`;
      chatContainer.appendChild(botMsgEl);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      // Speak response aloud
      speakText(answerText);
    }, 600);
  }

  // Chat send button handler
  document.getElementById('btn-send-chat').addEventListener('click', () => {
    const input = document.getElementById('chat-input-text');
    if (input.value.trim() !== '') {
      processUserQuery(input.value.trim());
      input.value = '';
    }
  });

  document.getElementById('chat-input-text').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('btn-send-chat').click();
    }
  });


  // --- 5. FARMER ONBOARDING WIZARD ---
  let currentStep = 1;

  function updateOnboardingStep(step) {
    currentStep = step;
    document.getElementById('onboard-step-num').innerText = step;
    
    [1, 2, 3].forEach(s => {
      const node = document.getElementById(`node-step-${s}`);
      const content = document.getElementById(`onboard-step-${s}-content`);
      if (s === step) {
        node.classList.add('active');
        content.style.display = 'block';
      } else {
        node.classList.remove('active');
        content.style.display = 'none';
      }
    });
  }

  document.getElementById('btn-step1-next').addEventListener('click', () => {
    state.farmer.name = document.getElementById('input-farmer-name').value || "Ravi Kumar";
    state.farmer.location = document.getElementById('input-farmer-location').value || "Guntur, AP";
    state.farmer.acreage = parseFloat(document.getElementById('input-farm-acreage').value) || 2.5;
    updateOnboardingStep(2);
  });

  document.getElementById('btn-step2-prev').addEventListener('click', () => updateOnboardingStep(1));

  // Crop Card Options
  document.querySelectorAll('.crop-card-option').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.crop-card-option').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.farmer.crop = card.getAttribute('data-crop');
      state.farmer.cropIcon = card.getAttribute('data-crop-icon');
    });
  });

  document.getElementById('btn-step2-next').addEventListener('click', () => updateOnboardingStep(3));
  document.getElementById('btn-step3-prev').addEventListener('click', () => updateOnboardingStep(2));

  document.getElementById('btn-finish-onboarding').addEventListener('click', () => {
    state.farmer.stage = document.getElementById('select-crop-stage').value;
    state.farmer.irrigationType = document.getElementById('select-irrigation-type').value;
    state.farmer.soilType = document.getElementById('select-soil-type').value;

    updateDashboardUI();
    switchView('view-dashboard');
  });

  // GPS Auto Detect Simulation
  document.getElementById('btn-detect-gps').addEventListener('click', () => {
    const locInput = document.getElementById('input-farmer-location');
    locInput.value = "Detecting GPS coordinates...";
    setTimeout(() => {
      locInput.value = "Guntur, Andhra Pradesh (16.3067° N, 80.4365° E)";
    }, 800);
  });


  // --- 6. MY FARM TODAY COMMAND CENTER UPDATE ---
  function updateDashboardUI() {
    document.getElementById('dash-farmer-name').innerText = state.farmer.name;
    document.getElementById('dash-farmer-location').innerText = state.farmer.location;
    document.getElementById('dash-farmer-crop').innerText = `${state.farmer.cropIcon} ${state.farmer.crop} (${state.farmer.stage} Stage)`;
    document.getElementById('dash-crop-display').innerText = `${state.farmer.cropIcon} ${state.farmer.crop} (${state.farmer.acreage} Acres)`;
    document.getElementById('dash-stage-display').innerText = `🌸 ${state.farmer.stage} Stage`;
    document.getElementById('dash-resilience-score').innerText = state.resilienceScore;

    // Irrigation banner logic
    const irrPill = document.getElementById('irrigation-decision-pill');
    const irrReasoning = document.getElementById('irrigation-reasoning-text');
    const waterSavedEst = document.getElementById('water-saved-est');

    if (state.weather.rainProb >= 60) {
      irrPill.innerText = "DONT WATER TODAY";
      irrPill.className = "decision-pill no-water";
      irrReasoning.innerHTML = `<strong>DO NOT WATER TODAY.</strong> Rain probability is ${state.weather.rainProb}% within 8 hours. Waiting saves water and prevents waterlogging.`;
      waterSavedEst.innerHTML = `Estimated Water Saved: <strong>~${Math.round(state.farmer.acreage * 5600)} Liters</strong>`;
    } else {
      irrPill.innerText = "WATER LIGHTLY TODAY";
      irrPill.className = "decision-pill water-now";
      irrReasoning.innerHTML = `<strong>WATER LIGHTLY TODAY.</strong> Low rain probability (${state.weather.rainProb}%). Irrigate in early morning to prevent evaporation loss.`;
      waterSavedEst.innerHTML = `Water Efficiency Gain: <strong>~${Math.round(state.farmer.acreage * 2200)} Liters saved</strong>`;
    }
  }


  // --- 7. AI CROP DISEASE DETECTOR ("SCAN MY CROP") ---
  function renderScannerCanvas() {
    const canvas = document.getElementById('scanner-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const wrapper = document.getElementById('scanner-wrapper');
    wrapper.classList.add('active');

    // Draw background leaf representation
    ctx.fillStyle = '#0f382c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Leaf outline
    ctx.beginPath();
    ctx.moveTo(200, 30);
    ctx.bezierCurveTo(340, 100, 320, 240, 200, 280);
    ctx.bezierCurveTo(80, 240, 60, 100, 200, 30);

    if (state.selectedPresetLeaf === 'healthy-leaf') {
      ctx.fillStyle = '#16a34a';
    } else {
      ctx.fillStyle = '#15803d';
    }
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3fc79b';
    ctx.stroke();

    // Central leaf vein
    ctx.beginPath();
    ctx.moveTo(200, 30);
    ctx.lineTo(200, 280);
    ctx.strokeStyle = '#74e2bd';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw spots if disease preset selected
    if (state.selectedPresetLeaf === 'tomato-early-blight') {
      // Concentric fungal spots
      drawSpot(ctx, 160, 120, 22, '#78350f', '#eab308');
      drawSpot(ctx, 230, 180, 28, '#78350f', '#ca8a04');
      drawSpot(ctx, 150, 210, 16, '#78350f', '#eab308');
    } else if (state.selectedPresetLeaf === 'paddy-blight') {
      // Bacterial leaf margin streak
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(100, 80, 20, 140);
    } else if (state.selectedPresetLeaf === 'cotton-curl') {
      // Leaf curling spots
      drawSpot(ctx, 190, 140, 35, '#a16207', '#d97706');
    }
  }

  function drawSpot(ctx, x, y, r, innerColor, outerColor) {
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    ctx.fillStyle = outerColor;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = innerColor;
    ctx.fill();
  }

  // Thumbnails selection listener
  document.querySelectorAll('.preset-thumbs .thumb-item').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.preset-thumbs .thumb-item').forEach(t => t.classList.remove('selected'));
      thumb.classList.add('selected');
      state.selectedPresetLeaf = thumb.getAttribute('data-preset');
      renderScannerCanvas();
    });
  });

  // Run AI Scan Execution
  document.getElementById('btn-run-ai-scan').addEventListener('click', runAiScan);

  function runAiScan() {
    const scanLine = document.getElementById('scan-line');
    scanLine.style.animationDuration = '0.6s';

    setTimeout(() => {
      scanLine.style.animationDuration = '2s';
      const diagData = diseaseDatabase[state.selectedPresetLeaf] || diseaseDatabase['tomato-early-blight'];

      document.getElementById('scan-confidence-badge').innerText = `${diagData.confidence}% CONFIDENCE`;
      document.getElementById('diag-disease-name').innerText = diagData.name;
      document.getElementById('diag-pathogen-type').innerText = diagData.pathogen;
      document.getElementById('diag-simple-text').innerText = diagData.simpleExplanation;

      const actionListEl = document.querySelector('.action-plan-list');
      actionListEl.innerHTML = '';
      diagData.actions.forEach((act, idx) => {
        const item = document.createElement('div');
        item.className = 'action-step-item';
        item.innerHTML = `
          <div class="action-step-num">${idx + 1}</div>
          <div>
            <strong style="color: #fff; font-size: 0.9rem;">${act.title}</strong>
            <p style="font-size: 0.85rem; color: var(--text-sub);">${act.desc}</p>
          </div>
        `;
        actionListEl.appendChild(item);
      });

      // Listen speech trigger
      document.getElementById('btn-audio-diag').onclick = () => {
        speakText(`Diagnosis result: ${diagData.name} with ${diagData.confidence}% confidence. ${diagData.simpleExplanation}`);
      };
    }, 1200);
  }

  // File Upload Dropzone & Camera Button listener
  const dropzone = document.getElementById('dropzone-area');
  const fileInput = document.getElementById('file-input-leaf');
  const btnCamera = document.getElementById('btn-camera-trigger');

  if (btnCamera) {
    btnCamera.addEventListener('click', () => fileInput.click());
  }

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      runAiScan();
    }
  });


  // --- 8. "WHAT-IF" CLIMATE STRESS SIMULATOR ---
  const sliderRain = document.getElementById('slider-rain');
  const sliderTemp = document.getElementById('slider-temp');
  const sliderDelay = document.getElementById('slider-delay');

  function updateSimulatorResults() {
    const rainVal = parseInt(sliderRain.value);
    const tempVal = parseFloat(sliderTemp.value);
    const delayVal = parseInt(sliderDelay.value);

    document.getElementById('sim-rain-val').innerText = `${rainVal > 0 ? '+' : ''}${rainVal}% ${rainVal < 0 ? '(Drought Risk)' : '(Flood Risk)'}`;
    document.getElementById('sim-temp-val').innerText = `+${tempVal.toFixed(1)}°C ${tempVal > 2 ? 'Heatwave' : 'Mild'}`;
    document.getElementById('sim-delay-val').innerText = `${delayVal} Days Delayed`;

    // Calculate Yield Impact
    let yieldLoss = Math.round(Math.abs(rainVal * 0.4) + (tempVal * 4.5) + (delayVal * 0.8));
    if (yieldLoss > 60) yieldLoss = 60;

    let waterDemand = Math.round((tempVal * 6) - (rainVal * 0.5));

    document.getElementById('sim-res-yield').innerText = `-${yieldLoss}% Yield Loss`;
    document.getElementById('sim-res-water').innerText = `${waterDemand > 0 ? '+' : ''}${waterDemand}% Demand`;

    // Dynamic Action Guidance
    const simActionEl = document.getElementById('sim-res-action');
    const simAltCropEl = document.getElementById('sim-res-alt-crop');

    if (rainVal < -15 && tempVal >= 2.5) {
      simActionEl.innerText = "Severe Heat & Water Stress: Switch to subsurface drip irrigation and apply organic straw mulch to retain root zone moisture.";
      simAltCropEl.innerText = "Switch next cycle to Pearl Millet (Bajra) or Sorghum, which require 40% less water under extreme heat stress.";
    } else if (rainVal > 20) {
      simActionEl.innerText = "Heavy Monsoon Surplus: Construct raised seedbeds and clear field perimeter drainage channels to prevent root rot waterlogging.";
      simAltCropEl.innerText = "Consider Rice (Paddy) or Paddy-cum-Fish farming resilient to heavy standing water.";
    } else {
      simActionEl.innerText = "Moderate Climate Shift: Maintain routine irrigation schedule and monitor leaf stomata transpiration twice weekly.";
      simAltCropEl.innerText = "Current Tomato variety remains suitable with scheduled bi-weekly field monitoring.";
    }
  }

  sliderRain.addEventListener('input', updateSimulatorResults);
  sliderTemp.addEventListener('input', updateSimulatorResults);
  sliderDelay.addEventListener('input', updateSimulatorResults);

  document.getElementById('btn-reset-sim').addEventListener('click', () => {
    sliderRain.value = -20;
    sliderTemp.value = 3.0;
    sliderDelay.value = 14;
    updateSimulatorResults();
  });


  // --- 9. LOW LITERACY & EMERGENCY MODES ---
  const lowLitBtn = document.getElementById('btn-low-literacy-toggle');
  lowLitBtn.addEventListener('click', () => {
    state.lowLiteracy = !state.lowLiteracy;
    if (state.lowLiteracy) {
      document.body.classList.add('low-literacy');
      lowLitBtn.innerText = "👁️ Standard Mode";
    } else {
      document.body.classList.remove('low-literacy');
      lowLitBtn.innerText = "👁️ Simple Mode";
    }
  });

  const emergencyBtn = document.getElementById('btn-emergency-toggle');
  const emergencyBanner = document.getElementById('emergency-banner');

  emergencyBtn.addEventListener('click', () => {
    state.emergencyMode = !state.emergencyMode;
    if (state.emergencyMode) {
      document.body.classList.add('emergency-mode');
      emergencyBanner.style.display = 'block';
      speakText("Warning! Extreme Weather Emergency Active. Heavy rainfall and flood risk expected. Clear field drainage channels immediately.");
    } else {
      document.body.classList.remove('emergency-mode');
      emergencyBanner.style.display = 'none';
    }
  });

  document.getElementById('btn-audio-emergency').addEventListener('click', () => {
    speakText("Emergency Field Protocol: 1. Clear drainage channels. 2. Move harvested produce to high elevation. 3. Stop all fertilizer applications.");
  });


  // --- 10. EXPERT ESCALATION MODAL ---
  const modalEscalation = document.getElementById('modal-escalation');
  document.getElementById('btn-escalate-expert').addEventListener('click', () => {
    modalEscalation.classList.add('active');
  });

  document.getElementById('btn-close-modal').addEventListener('click', () => {
    modalEscalation.classList.remove('active');
  });
  document.getElementById('btn-cancel-modal').addEventListener('click', () => {
    modalEscalation.classList.remove('active');
  });

  document.getElementById('btn-submit-escalate').addEventListener('click', () => {
    modalEscalation.classList.remove('active');
    alert("Escalation Ticket #KVK-893 successfully dispatched to Guntur Agricultural Extension Officer!");
  });


  // --- 11. COMMUNITY OUTBREAK MAP RENDERER ---
  function renderCommunityMap() {
    const canvas = document.getElementById('community-map-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Draw dark map grid background
    ctx.fillStyle = '#051610';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(63, 199, 155, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Guntur Center Region Circle
    ctx.beginPath();
    ctx.arc(350, 190, 140, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Farmer Nodes (Clusters)
    const farms = [
      { x: 350, y: 190, label: "Ravi's Field (You)", main: true, risk: "warning" },
      { x: 310, y: 160, label: "Farm #82 - Blight", risk: "critical" },
      { x: 390, y: 220, label: "Farm #14 - Spot", risk: "warning" },
      { x: 260, y: 210, label: "Farm #91 - Blight", risk: "critical" },
      { x: 420, y: 150, label: "Farm #05 - Healthy", risk: "safe" },
      { x: 440, y: 240, label: "Farm #33 - Blight", risk: "critical" },
      { x: 290, y: 270, label: "Farm #72 - Healthy", risk: "safe" }
    ];

    farms.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.main ? 10 : 7, 0, Math.PI * 2);
      if (f.risk === 'critical') ctx.fillStyle = '#ef4444';
      else if (f.risk === 'warning') ctx.fillStyle = '#f59e0b';
      else ctx.fillStyle = '#10b981';
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.font = f.main ? 'bold 12px sans-serif' : '10px sans-serif';
      ctx.fillText(f.label, f.x + 12, f.y + 4);
    });
  }


  // --- 12. HACKATHON 2-MINUTE WOW DEMO TOUR ENGINE ---
  const tourBanner = document.getElementById('tour-banner');
  const tourTitle = document.getElementById('tour-step-title');
  const tourDesc = document.getElementById('tour-step-desc');
  const tourNextBtn = document.getElementById('tour-btn-next');

  const tourSteps = [
    { title: "Step 1: Auto Onboarding", desc: "System auto-detects Ravi's location in Guntur and pre-loads Tomato flowering stage.", action: () => switchView('view-dashboard') },
    { title: "Step 2: Weather & Irrigation Check", desc: "Live Weather Engine detects 78% rain probability. Irrigation Advisor immediately instructs 'DON'T WATER TODAY'.", action: () => switchView('view-dashboard') },
    { title: "Step 3: Disease Scan Triggered", desc: "Transiting to 'Scan My Crop'. Selecting sample tomato leaf with suspected Early Blight spots.", action: () => { switchView('view-scanner'); renderScannerCanvas(); } },
    { title: "Step 4: AI Diagnostic Executed", desc: "AI Neural Scan calculates 87% confidence for Early Blight and generates 4-step field action plan.", action: () => runAiScan() },
    { title: "Step 5: Voice Assistant Readout", desc: "Voice Engine speaks localized diagnosis and immediate action steps aloud.", action: () => speakText("Tomato Early Blight identified with 87% confidence. Prune infected leaves before rain.") },
    { title: "Step 6: Climate Risk Radar", desc: "System updates Climate Radar indicating Critical Heavy Rain Risk within 8 hours.", action: () => switchView('view-dashboard') },
    { title: "Step 7: Climate Stress Simulator", desc: "Simulating -20% rainfall and +3°C heatwave to calculate yield loss and alternative crop options.", action: () => switchView('view-climate') },
    { title: "Step 8: Regional Outbreak Map", desc: "Community map reveals 7 nearby farms reporting similar leaf spots in Guntur.", action: () => switchView('view-community') },
    { title: "Step 9: Tour Complete!", desc: "KrishiRakshak AI successfully converted complex climate & leaf signals into immediate farming decisions!", action: () => switchView('view-home') }
  ];

  function runTourStep(stepIdx) {
    if (stepIdx >= tourSteps.length) {
      tourBanner.classList.remove('active');
      state.tourActive = false;
      return;
    }

    state.tourStep = stepIdx;
    state.tourActive = true;
    tourBanner.classList.add('active');

    const step = tourSteps[stepIdx];
    tourTitle.innerText = step.title;
    tourDesc.innerText = step.desc;

    step.action();
  }

  document.getElementById('btn-start-demo').addEventListener('click', () => runTourStep(0));
  document.getElementById('hero-btn-demo').addEventListener('click', () => runTourStep(0));

  tourNextBtn.addEventListener('click', () => {
    runTourStep(state.tourStep + 1);
  });

  // Initialize Default Dashboard Data
  updateDashboardUI();

});
