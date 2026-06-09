import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, X, Send, Activity, Sparkles, 
  HelpCircle, ChevronRight, Droplets, Scale, 
  Thermometer, AlertTriangle, AlertCircle, CheckCircle, Info
} from 'lucide-react';

const AquaBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'water' | 'diagnose'
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'bot', 
      text: "Hello! I am AquaBot, your smart aquaculture assistant. How can I help you manage your ponds today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Water Analyzer State
  const [waterParams, setWaterParams] = useState({
    ph: 7.8,
    salinity: 15,
    temp: 28,
    ammonia: 0.1
  });

  // Diagnoser State
  const [diagnoseStep, setDiagnoseStep] = useState(1);
  const [diagnoseSpecies, setDiagnoseSpecies] = useState('Shrimp');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const symptomsList = {
    Shrimp: [
      { id: 'whitespots', label: 'White spots on shell / carapace' },
      { id: 'reddish', label: 'Reddish discoloration of body/gills' },
      { id: 'lethargy', label: 'Lethargic swimming / gathering at pond edges' },
      { id: 'emptygut', label: 'Empty gut / feed refusal' },
      { id: 'blackgills', label: 'Black or brown gill discoloration' }
    ],
    Fish: [
      { id: 'redspots', label: 'Red spots or ulcers on skin' },
      { id: 'finrot', label: 'Frayed fins / tail rot' },
      { id: 'surfaceswim', label: 'Gasping for air at water surface' },
      { id: 'lossappetite', label: 'Sudden loss of appetite' },
      { id: 'whiteskin', label: 'White fuzzy growth (fungal patches)' }
    ]
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Process Bot response
    setTimeout(() => {
      let botResponse = "";
      const lower = text.toLowerCase();

      if (lower.includes('ammonia') || lower.includes('high ammonia')) {
        botResponse = "To reduce ammonia levels: \n1. Reduce feeding rate immediately (uneaten feed triggers ammonia spikes).\n2. Increase aeration (turn on all aerators/fan sets).\n3. Apply commercial pond probiotics/yucca extracts.\n4. Perform a 10-20% water exchange with clean water.\n\nYou can book a [Water Quality Consultation](/consultation) to have an expert diagnose your pond.";
      } else if (lower.includes('ph') || lower.includes('ideal ph') || lower.includes('acidic')) {
        botResponse = "The ideal pH for Vannamei shrimp is **7.5 to 8.5**. \n- If pH is low (< 7.2): Apply agricultural lime (calcium carbonate) or dolomite.\n- If pH is high (> 8.8): Apply molasses or fermented juice to stimulate acidic bacterial growth.\n\nTry adjusting the sliders in the **Water Diagnostics** tab above to see immediate recommendations.";
      } else if (lower.includes('feed') || lower.includes('dosage') || lower.includes('feeding')) {
        botResponse = "Feed management is critical to prevent water pollution. \n- Check out our interactive [Biomass & Feed Calculator](/tools) on the Smart Tools page.\n- It calculates recommended daily feed dosage based on pond size, stock count, and average body weight.\n- You can also shop high-quality feeds in the [Aqua Feed Market](/feed).";
      } else if (lower.includes('soil') || lower.includes('soil test')) {
        botResponse = "Soil testing helps detect black sludge, high acidity, and organic waste load before stocking. \n- You can request a Soil Test via the [Doctor Consultation](/consultation) module, and our expert field officers will visit your pond.";
      } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        botResponse = "Hello! How can I assist you with your fish or shrimp farm today? You can ask me about water parameters, feed management, or crop health diagnostics!";
      } else {
        botResponse = "That's an interesting question! For specific pond issues, you can:\n1. Check your water quality in the **Water Diagnostics** tab.\n2. Run a symptom check in the **Disease Diagnoser** tab.\n3. [Consult an expert doctor](/consultation) for a personalized diagnosis and treatment plan.";
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1000);
  };

  const getWaterDiagnosis = () => {
    const { ph, salinity, temp, ammonia } = waterParams;
    if (ammonia > 1.2) {
      return {
        status: 'critical',
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        icon: <AlertCircle className="w-5 h-5" />,
        msg: `Ammonia is critically high (${ammonia} ppm)!`,
        action: "Reduce feed by 50%, run all aerators 24/7, and apply gut probiotics."
      };
    }
    if (ph < 7.2) {
      return {
        status: 'warning',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        icon: <AlertTriangle className="w-5 h-5" />,
        msg: `pH is low (${ph}) - Water is acidic!`,
        action: "Add 100-150kg/acre of agricultural dolomite or limestone to boost alkalinity."
      };
    }
    if (ph > 8.8) {
      return {
        status: 'warning',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        icon: <AlertTriangle className="w-5 h-5" />,
        msg: `pH is high (${ph}) - Algal bloom risk!`,
        action: "Apply 20-30 liters of molasses/acre to encourage beneficial carbon bacteria."
      };
    }
    if (temp > 33 || temp < 22) {
      return {
        status: 'warning',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        icon: <AlertTriangle className="w-5 h-5" />,
        msg: `Temperature is stressful (${temp}°C)!`,
        action: "Ensure adequate water depth (minimum 1.2m) to buffer thermal shocks."
      };
    }
    return {
      status: 'optimal',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      icon: <CheckCircle className="w-5 h-5" />,
      msg: "All parameters are optimal!",
      action: "Pond health is excellent. Maintain current feeding and biological dosing schedules."
    };
  };

  const handleSymptomToggle = (symptomId) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  const getDiseaseDiagnosis = () => {
    if (diagnoseSpecies === 'Shrimp') {
      if (selectedSymptoms.includes('whitespots')) {
        return {
          title: "White Spot Syndrome Virus (WSSV)",
          severity: "CRITICAL",
          desc: "WSSV is a highly lethal viral infection affecting shrimp. Mortality can reach 100% within 3-10 days.",
          steps: [
            "Quarantine/isolate the affected pond immediately.",
            "Do NOT discharge water to avoid infecting neighboring farms.",
            "Run emergency aeration to support remaining biomass.",
            "Contact a verified aquatic veterinarian immediately."
          ],
          actionLink: "/consultation",
          actionText: "Book Urgent Doctor Consultation"
        };
      }
      if (selectedSymptoms.includes('reddish') || selectedSymptoms.includes('lethargy')) {
        return {
          title: "Vibrio Infection / Red Tail Disease",
          severity: "HIGH RISK",
          desc: "Bacterial infection usually caused by poor organic management and low dissolved oxygen levels.",
          steps: [
            "Apply pond sanitizers like BKC or Virkon to reduce bacterial count.",
            "Blend immunity boosters and gut probiotics with feed.",
            "Improve water quality: perform a 10% water exchange."
          ],
          actionLink: "/medicine",
          actionText: "Shop Sanitizers & Probiotics"
        };
      }
      if (selectedSymptoms.includes('emptygut')) {
        return {
          title: "White Feces Syndrome / Feed Refusal",
          severity: "MODERATE RISK",
          desc: "Often associated with microsporidian parasites (EHP) or high vibrio load in the water.",
          steps: [
            "Reduce feed ration by 30-50% to prevent pond bottom rot.",
            "Use gut-stabilizing probiotics and feed binders.",
            "Check soil condition; organic load may be too high."
          ],
          actionLink: "/feed",
          actionText: "Browse Premium Minerals & Feeds"
        };
      }
    } else {
      // Fish
      if (selectedSymptoms.includes('surfaceswim')) {
        return {
          title: "Dissolved Oxygen Deficient / Anoxia",
          severity: "CRITICAL",
          desc: "Fish are gasping at the surface, indicating severe lack of dissolved oxygen (DO < 2.0 ppm).",
          steps: [
            "Turn on all paddlewheel aerators immediately.",
            "Apply oxygen release tablets/powder directly to the pond.",
            "Stop feeding immediately until oxygen levels stabilize."
          ],
          actionLink: "/repair",
          actionText: "Request Emergency Generator/Aerator Repair"
        };
      }
      if (selectedSymptoms.includes('redspots') || selectedSymptoms.includes('finrot')) {
        return {
          title: "Epizootic Ulcerative Syndrome (EUS) / Fin Rot",
          severity: "HIGH RISK",
          desc: "Fungal and bacterial skin disease triggered by low water temperatures or acidic soil runoff.",
          steps: [
            "Apply agricultural lime to stabilize pH above 7.5.",
            "Use CIFAX or disinfectants to control fungal spreads.",
            "Avoid netting/handling fish to reduce body surface injuries."
          ],
          actionLink: "/medicine",
          actionText: "Browse Fish Medicines"
        };
      }
    }
    return {
      title: "General Stress / Water Quality Imbalance",
      severity: "LOW RISK",
      desc: "No major disease symptoms fully matched, but symptoms indicate environmental stress.",
      steps: [
        "Test complete water parameters (pH, Salinity, Ammonia).",
        "Add pond vitamin C and multi-minerals to boost immunity.",
        "Check feed intake rates."
      ],
      actionLink: "/consultation",
      actionText: "Request Water/Soil Testing Visit"
    };
  };

  const currentDiagnosis = getDiseaseDiagnosis();

  // Helper to render text with Markdown links
  const renderMessageText = (text) => {
    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <Link 
          key={match.index} 
          to={match[2]} 
          onClick={() => setIsOpen(false)}
          className="text-blue-600 font-bold underline hover:text-blue-800"
        >
          {match[1]}
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Bot Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-fade-in transition-all duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AquaBot Assistant</h3>
                <p className="text-[11px] text-cyan-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                  Online & Ready
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50 text-xs">
            <button 
              onClick={() => setActiveTab('chat')} 
              className={`flex-1 py-3 text-center font-bold border-b-2 transition-all ${activeTab === 'chat' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              💬 Chat
            </button>
            <button 
              onClick={() => setActiveTab('water')} 
              className={`flex-1 py-3 text-center font-bold border-b-2 transition-all ${activeTab === 'water' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              🧪 Water Test
            </button>
            <button 
              onClick={() => { setActiveTab('diagnose'); setDiagnoseStep(1); setSelectedSymptoms([]); }} 
              className={`flex-1 py-3 text-center font-bold border-b-2 transition-all ${activeTab === 'diagnose' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              🩺 Diagnoser
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* CHAT TAB */}
            {activeTab === 'chat' && (
              <>
                <div className="space-y-4 min-h-[350px]">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-line ${
                        msg.sender === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        {renderMessageText(msg.text)}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex items-center gap-1 bg-slate-100 px-4 py-2.5 rounded-2xl rounded-tl-none w-16 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {[
                    "High Ammonia?",
                    "Ideal pH level?",
                    "Feed dosage?",
                    "Test soil?"
                  ].map((q, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* WATER TAB */}
            {activeTab === 'water' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Real-time Diagnostic</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">Adjust sliders to check water health status.</p>
                </div>

                {/* Parameters */}
                <div className="space-y-4">
                  {/* pH */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-500" /> pH</span>
                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{waterParams.ph}</span>
                    </div>
                    <input 
                      type="range" min="5" max="10" step="0.1" 
                      value={waterParams.ph} 
                      onChange={(e) => setWaterParams({...waterParams, ph: parseFloat(e.target.value)})}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Ammonia */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Ammonia (ppm)</span>
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{waterParams.ammonia} ppm</span>
                    </div>
                    <input 
                      type="range" min="0" max="3" step="0.1" 
                      value={waterParams.ammonia} 
                      onChange={(e) => setWaterParams({...waterParams, ammonia: parseFloat(e.target.value)})}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
                    />
                  </div>

                  {/* Salinity */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-indigo-500" /> Salinity (ppt)</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{waterParams.salinity} ppt</span>
                    </div>
                    <input 
                      type="range" min="0" max="45" step="1" 
                      value={waterParams.salinity} 
                      onChange={(e) => setWaterParams({...waterParams, salinity: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Temperature */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp (°C)</span>
                      <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">{waterParams.temp}°C</span>
                    </div>
                    <input 
                      type="range" min="15" max="40" step="1" 
                      value={waterParams.temp} 
                      onChange={(e) => setWaterParams({...waterParams, temp: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>
                </div>

                {/* Analysis Card */}
                {(() => {
                  const diag = getWaterDiagnosis();
                  return (
                    <div className={`p-4 border rounded-2xl flex gap-3 ${diag.color} transition-all`}>
                      <div className="mt-0.5">{diag.icon}</div>
                      <div className="space-y-1">
                        <p className="font-bold text-sm">{diag.msg}</p>
                        <p className="text-xs leading-relaxed opacity-90">{diag.action}</p>
                      </div>
                    </div>
                  );
                })()}
                
                <Link 
                  to="/tools" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-center font-bold text-xs flex items-center justify-center gap-1 hover:bg-blue-600 transition-colors"
                >
                  View full trend analysis charts <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* DIAGNOSE TAB */}
            {activeTab === 'diagnose' && (
              <div className="space-y-4 animate-fade-in">
                {diagnoseStep === 1 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Step 1 of 3</p>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">Select Aquaculture Category</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {['Shrimp', 'Fish'].map(species => (
                        <button
                          key={species}
                          onClick={() => { setDiagnoseSpecies(species); setDiagnoseStep(2); }}
                          className={`p-6 border-2 rounded-2xl text-center font-bold text-base hover:border-blue-500 hover:bg-blue-50 transition-all ${diagnoseSpecies === species ? 'border-blue-600 bg-blue-50/50 text-blue-600' : 'border-slate-100'}`}
                        >
                          <span className="text-4xl block mb-2">{species === 'Shrimp' ? '🦐' : '🐟'}</span>
                          {species} Ponds
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {diagnoseStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Step 2 of 3</p>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">What symptoms do you observe?</h4>
                    </div>
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {symptomsList[diagnoseSpecies].map(sym => (
                        <label 
                          key={sym.id} 
                          className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors ${selectedSymptoms.includes(sym.id) ? 'border-blue-500 bg-blue-50/20' : 'border-slate-100'}`}
                        >
                          <input 
                            type="checkbox" 
                            checked={selectedSymptoms.includes(sym.id)}
                            onChange={() => handleSymptomToggle(sym.id)}
                            className="mt-1 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <span className="text-xs text-slate-700 font-semibold">{sym.label}</span>
                        </label>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setDiagnoseStep(1)} 
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => setDiagnoseStep(3)} 
                        disabled={selectedSymptoms.length === 0}
                        className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                      >
                        Analyze Symptoms
                      </button>
                    </div>
                  </div>
                )}

                {diagnoseStep === 3 && (
                  <div className="space-y-4 animate-scale-in">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Step 3 of 3</p>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">Diagnostic Report</h4>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">{currentDiagnosis.severity}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{diagnoseSpecies} Pond</span>
                        </div>
                        <h5 className="font-black text-slate-900 text-sm mt-1">{currentDiagnosis.title}</h5>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{currentDiagnosis.desc}</p>
                      </div>

                      <div className="border-t border-slate-200/50 pt-2.5 space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-700 uppercase">Recommended Actions:</p>
                        <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1 pl-1">
                          {currentDiagnosis.steps.map((stepStr, idx) => (
                            <li key={idx} className="leading-relaxed">{stepStr}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => setDiagnoseStep(2)} 
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Re-evaluate
                      </button>
                      <Link 
                        to={currentDiagnosis.actionLink} 
                        onClick={() => setIsOpen(false)}
                        className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center"
                      >
                        {currentDiagnosis.actionText}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Input */}
          {activeTab === 'chat' && (
            <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
              <input 
                type="text" 
                placeholder="Ask about high ammonia, feed, pH..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 bg-slate-50"
              />
              <button 
                onClick={() => handleSend()}
                className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* Floating Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 group relative"
        title="Open AquaBot Smart Assistant"
      >
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        {isOpen ? (
          <X className="w-6 h-6 animate-rotate-in" />
        ) : (
          <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        )}
      </button>
    </div>
  );
};

export default AquaBot;
