import { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, HelpCircle, AlertTriangle, CheckCircle, 
  Plus, Trash2, Printer, Compass, ArrowRight, ShieldCheck, 
  Sliders, TrendingUp, BookOpen 
} from 'lucide-react';
import toast from 'react-hot-toast';

// Initial Mock Data for parameters
const initialLogs = [
  { day: 'Day 54', pH: 7.8, ammonia: 0.1, temp: 28, do: 6.2 },
  { day: 'Day 55', pH: 7.9, ammonia: 0.15, temp: 29, do: 6.0 },
  { day: 'Day 56', pH: 7.7, ammonia: 0.2, temp: 28.5, do: 5.8 },
  { day: 'Day 57', pH: 7.5, ammonia: 0.3, temp: 27.8, do: 5.5 },
  { day: 'Day 58', pH: 7.4, ammonia: 0.5, temp: 28.2, do: 5.1 },
  { day: 'Day 59', pH: 7.2, ammonia: 0.8, temp: 29.0, do: 4.8 },
  { day: 'Day 60', pH: 7.3, ammonia: 0.7, temp: 28.8, do: 5.0 },
];

const SmartTools = () => {
  const [logs, setLogs] = useState(initialLogs);
  const [activeSubTab, setActiveSubTab] = useState('water'); // 'water' | 'feed' | 'risk'

  // Input states for new logs
  const [newLog, setNewLog] = useState({
    day: 'Day 61',
    pH: 7.5,
    ammonia: 0.2,
    temp: 28,
    do: 5.5
  });

  // Input states for Feed Calculator
  const [feedInputs, setFeedInputs] = useState({
    species: 'Shrimp',
    pondSize: 1.5, // acres
    stockDensity: 50, // per sqm
    survivalRate: 85, // %
    avgWeight: 14, // grams
    dayOfCulture: 60
  });

  // Calculate Feed Results
  const calculateFeed = () => {
    const { species, pondSize, stockDensity, survivalRate, avgWeight } = feedInputs;
    
    // 1 acre = 4047 square meters
    const totalAreaSqm = pondSize * 4047;
    const totalAnimals = totalAreaSqm * stockDensity * (survivalRate / 100);
    const biomassKg = (totalAnimals * avgWeight) / 1000;

    // Estimate Feed rate based on average weight
    let feedRatePercent = 2.5; // default
    if (species === 'Shrimp') {
      if (avgWeight < 2) feedRatePercent = 8.0;
      else if (avgWeight < 5) feedRatePercent = 5.0;
      else if (avgWeight < 10) feedRatePercent = 3.5;
      else if (avgWeight < 15) feedRatePercent = 2.8;
      else feedRatePercent = 2.2;
    } else {
      // Fish
      if (avgWeight < 50) feedRatePercent = 4.0;
      else if (avgWeight < 200) feedRatePercent = 2.5;
      else feedRatePercent = 1.8;
    }

    const dailyFeedKg = (biomassKg * feedRatePercent) / 100;

    return {
      biomass: Math.round(biomassKg),
      totalCount: Math.round(totalAnimals),
      dailyFeed: dailyFeedKg.toFixed(1),
      feedRatePercent,
      schedule: [
        { meal: 'Meal 1 (06:00 AM)', pct: '30%', amount: (dailyFeedKg * 0.3).toFixed(1) },
        { meal: 'Meal 2 (11:00 AM)', pct: '20%', amount: (dailyFeedKg * 0.2).toFixed(1) },
        { meal: 'Meal 3 (04:00 PM)', pct: '25%', amount: (dailyFeedKg * 0.25).toFixed(1) },
        { meal: 'Meal 4 (09:00 PM)', pct: '25%', amount: (dailyFeedKg * 0.25).toFixed(1) }
      ]
    };
  };

  const feedResults = calculateFeed();

  // Add Log Entry Handler
  const handleAddLog = (e) => {
    e.preventDefault();
    setLogs(prev => [...prev, newLog]);
    
    // Auto increment day
    const match = newLog.day.match(/\d+/);
    const nextDayNum = match ? parseInt(match[0]) + 1 : logs.length + 1;
    setNewLog({
      day: `Day ${nextDayNum}`,
      pH: 7.5,
      ammonia: 0.2,
      temp: 28,
      do: 5.5
    });

    toast.success('Log entry added successfully!');
  };

  // Delete log entry
  const handleDeleteLog = (index) => {
    setLogs(prev => prev.filter((_, i) => i !== index));
    toast.success('Log entry deleted.');
  };

  // Get current risk level based on last log entry
  const getPondRiskStatus = () => {
    if (logs.length === 0) return { score: 0, status: 'Unknown', color: 'text-slate-500', bg: 'bg-slate-50', desc: 'No logs recorded.' };
    
    const last = logs[logs.length - 1];
    let score = 10; // base score

    const warnings = [];
    if (last.ammonia > 0.8) {
      score += 40;
      warnings.push("High toxic ammonia detected (> 0.8 ppm).");
    } else if (last.ammonia > 0.3) {
      score += 15;
      warnings.push("Moderate ammonia levels.");
    }

    if (last.pH < 7.2) {
      score += 20;
      warnings.push("Acidic pH conditions (< 7.2).");
    } else if (last.pH > 8.8) {
      score += 20;
      warnings.push("High alkaline pH conditions (> 8.8).");
    }

    if (last.do < 4.5) {
      score += 30;
      warnings.push("Critical lack of Dissolved Oxygen (< 4.5 ppm).");
    }

    if (last.temp > 33 || last.temp < 22) {
      score += 10;
      warnings.push("Stressful water temperatures.");
    }

    score = Math.min(score, 100);

    let status = 'Good';
    let color = 'text-green-600 bg-green-50 border-green-200';
    let labelBg = 'bg-green-600';
    let desc = 'Your pond conditions are excellent. Maintain your normal daily schedules.';

    if (score > 60) {
      status = 'Danger';
      color = 'text-rose-600 bg-rose-50 border-rose-200';
      labelBg = 'bg-rose-600';
      desc = 'Pond environment is highly critical. Take immediate corrective measures.';
    } else if (score > 25) {
      status = 'Warning';
      color = 'text-amber-600 bg-amber-50 border-amber-200';
      labelBg = 'bg-amber-600';
      desc = 'Pond parameters show sign of imbalance. Closely monitor feed inputs and aeration.';
    }

    return { score, status, color, labelBg, desc, warnings };
  };

  const riskStatus = getPondRiskStatus();

  return (
    <div className="space-y-8 pb-16">
      {/* Title Header */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Interactive Dashboard
          </span>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 mt-2">
            🎛️ AquaSmart Calculators & Analytics
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Simulate water parameters, calculate bio-feed cycles, and analyze pond environmental risks instantly.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto self-stretch md:self-center">
          <button
            onClick={() => setActiveSubTab('water')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'water' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            🧪 Water Quality Logs
          </button>
          <button
            onClick={() => setActiveSubTab('feed')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'feed' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            🧮 Feed Calculator
          </button>
          <button
            onClick={() => setActiveSubTab('risk')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'risk' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            ⚠️ Pond Risk Index
          </button>
        </div>
      </div>

      {/* WATER QUALITY LOGS TAB */}
      {activeSubTab === 'water' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" /> Parameter Trends
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Plotting pH, Dissolved Oxygen (DO), and Ammonia levels</p>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> pH
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> DO (ppm)
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span> Ammonia (ppm)
                </span>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={logs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: '16px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="pH" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="do" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="ammonia" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Simulated preset logs loader */}
            <div className="flex gap-4 pt-4 border-t border-slate-100 justify-end">
              <button 
                onClick={() => {
                  setLogs(initialLogs);
                  toast.success('Pond A preset logs loaded.');
                }}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Pond A Presets
              </button>
              <button 
                onClick={() => {
                  setLogs([
                    { day: 'Day 30', pH: 8.2, ammonia: 0.1, temp: 26, do: 6.8 },
                    { day: 'Day 31', pH: 8.1, ammonia: 0.1, temp: 26.5, do: 6.7 },
                    { day: 'Day 32', pH: 8.3, ammonia: 0.2, temp: 27, do: 6.5 },
                    { day: 'Day 33', pH: 8.0, ammonia: 0.3, temp: 27.5, do: 6.1 },
                    { day: 'Day 34', pH: 7.9, ammonia: 0.2, temp: 27.2, do: 5.9 }
                  ]);
                  toast.success('Pond B preset logs loaded.');
                }}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
              >
                Pond B Presets
              </button>
            </div>
          </div>

          {/* New log entry form */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Log Water Reading
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Add current daily parameters to the dashboard</p>
            </div>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Culture Day</label>
                <input 
                  type="text" 
                  value={newLog.day} 
                  onChange={(e) => setNewLog({...newLog, day: e.target.value})}
                  className="input-field text-sm py-2 px-3"
                  placeholder="e.g. Day 61"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">pH</label>
                  <input 
                    type="number" step="0.1" min="0" max="14"
                    value={newLog.pH} 
                    onChange={(e) => setNewLog({...newLog, pH: parseFloat(e.target.value) || 0})}
                    className="input-field text-sm py-2 px-3"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Ammonia (ppm)</label>
                  <input 
                    type="number" step="0.01" min="0" max="10"
                    value={newLog.ammonia} 
                    onChange={(e) => setNewLog({...newLog, ammonia: parseFloat(e.target.value) || 0})}
                    className="input-field text-sm py-2 px-3"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">Temp (°C)</label>
                  <input 
                    type="number" step="1" min="0" max="50"
                    value={newLog.temp} 
                    onChange={(e) => setNewLog({...newLog, temp: parseInt(e.target.value) || 0})}
                    className="input-field text-sm py-2 px-3"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">DO (ppm)</label>
                  <input 
                    type="number" step="0.1" min="0" max="20"
                    value={newLog.do} 
                    onChange={(e) => setNewLog({...newLog, do: parseFloat(e.target.value) || 0})}
                    className="input-field text-sm py-2 px-3"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-1 shadow-md"
              >
                Add Entry & Replot
              </button>
            </form>
          </div>

          {/* Parameters Logs History List */}
          <div className="lg:col-span-3 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Pond History Table</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold">
                    <th className="pb-3 pl-4">Day</th>
                    <th className="pb-3">pH Value</th>
                    <th className="pb-3">Ammonia (ppm)</th>
                    <th className="pb-3">Temperature (°C)</th>
                    <th className="pb-3">Dissolved Oxygen (ppm)</th>
                    <th className="pb-3 text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-4 font-black text-slate-900">{log.day}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${log.pH < 7.2 || log.pH > 8.8 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {log.pH}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${log.ammonia > 0.5 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                          {log.ammonia} ppm
                        </span>
                      </td>
                      <td className="py-4 font-semibold text-slate-700">{log.temp}°C</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${log.do < 5.0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {log.do} ppm
                        </span>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <button 
                          onClick={() => handleDeleteLog(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FEED CALCULATOR TAB */}
      {activeSubTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" /> Biomass Inputs
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Parameters to compute crop biomass and feeding charts</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Species</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Shrimp', 'Fish'].map(sp => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setFeedInputs({...feedInputs, species: sp})}
                      className={`py-3 rounded-xl border text-sm font-bold transition-all ${feedInputs.species === sp ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {sp === 'Shrimp' ? '🦐 Shrimp' : '🐟 Fish'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Pond Area Size (Acres)</label>
                <input 
                  type="number" step="0.1" 
                  value={feedInputs.pondSize}
                  onChange={(e) => setFeedInputs({...feedInputs, pondSize: parseFloat(e.target.value) || 0})}
                  className="input-field text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Stocking Density (animals / m²)</label>
                <input 
                  type="number" 
                  value={feedInputs.stockDensity}
                  onChange={(e) => setFeedInputs({...feedInputs, stockDensity: parseInt(e.target.value) || 0})}
                  className="input-field text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Estimated Survival Rate (%)</label>
                <input 
                  type="number" min="0" max="100"
                  value={feedInputs.survivalRate}
                  onChange={(e) => setFeedInputs({...feedInputs, survivalRate: parseInt(e.target.value) || 0})}
                  className="input-field text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Average Body Weight (g)</label>
                <input 
                  type="number" step="0.1" 
                  value={feedInputs.avgWeight}
                  onChange={(e) => setFeedInputs({...feedInputs, avgWeight: parseFloat(e.target.value) || 0})}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Feeding Recommendation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculated daily biomass and feeding schedules</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Pond Stock</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{feedResults.totalCount.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">animals total</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Biomass</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{feedResults.biomass.toLocaleString()} kg</p>
                <p className="text-[10px] text-slate-400 mt-0.5">total weight</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Feed Ratio</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{feedResults.feedRatePercent}%</p>
                <p className="text-[10px] text-slate-400 mt-0.5">of body weight / day</p>
              </div>
            </div>

            {/* Daily schedule */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-sm">Recommended 4-Meal Plan</h4>
                <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Total: {feedResults.dailyFeed} kg/day
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-100 rounded-3xl overflow-hidden bg-white">
                {feedResults.schedule.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center px-6 py-4 hover:bg-slate-50/50 transition-all">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-800">{item.meal}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400 font-semibold">{item.pct} portion</span>
                      <span className="text-base font-black text-slate-900">{item.amount} kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                onClick={() => {
                  toast.success('Feeding schedule printed. Check your logs!');
                  window.print();
                }}
                className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
              >
                <Printer className="w-4 h-4" /> Print feeding chart
              </button>
              
              <button 
                onClick={() => {
                  toast.success('Pond log updated with feed record!');
                }}
                className="flex-1 btn-primary py-3 text-xs font-bold flex items-center justify-center gap-1"
              >
                Log daily feeding rate <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POND RISK INDEX TAB */}
      {activeSubTab === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Index Gauge */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Pond Health Risk</h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculated using water parameters, ammonia and DO trends</p>
            </div>

            {/* Visual dial */}
            <div className="relative w-44 h-44 flex items-center justify-center rounded-full border-8 border-slate-50 bg-slate-50/50 shadow-inner">
              {/* Colored Indicator Circle ring outline */}
              <div className="absolute inset-2 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Risk Score</p>
                <p className="text-4xl font-black text-slate-900 mt-1">{riskStatus.score}%</p>
                <span className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black text-white ${riskStatus.labelBg}`}>
                  {riskStatus.status}
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-500 max-w-xs leading-relaxed">
              {riskStatus.desc}
            </p>
          </div>

          {/* Checklist & Banners */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> Parameter Warnings
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Detected stressors inside current pond metrics</p>
            </div>

            {riskStatus.warnings.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-emerald-100 bg-emerald-50/20 text-emerald-700 rounded-3xl flex flex-col items-center justify-center text-center gap-3">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
                <p className="font-bold">No parameter stress detected!</p>
                <p className="text-xs text-emerald-600 max-w-sm">
                  Your water, oxygen levels, and temperature values are within standard healthy aquaculture margins.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {riskStatus.warnings.map((warn, i) => (
                  <div key={i} className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <span className="text-xs font-semibold">{warn}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Recommendations */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-blue-500" /> Bio-Corrective Steps
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-600">1. Aeration Control</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    If risk is warning or danger, run aerators during early morning (02:00 AM - 06:00 AM) when dissolved oxygen is lowest.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-600">2. Probiotic Blends</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Apply Bacillus spores or nitrifying bacteria cultures to eliminate accumulated organic waste sludge at the pond bottom.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-600">3. Feeding adjustment</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Always consult the Feed dosage table. Overfeeding triggers immediate oxygen crashes and massive ammonia spikes.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                  <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-600">4. Consulting Visits</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    For unexplained stress or disease indicators, book an expert water/soil analysis doctor. Avoid self-treatment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartTools;
