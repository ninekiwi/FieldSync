import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, AlertTriangle, FileText, ChevronRight,
  Plus, MapPin, Cloud, HardHat,
  FileDown, RefreshCw,
  Bold, Italic, List, ShieldCheck, Zap,
  Camera, X, Loader2
} from 'lucide-react';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

const FORM_SCHEMA = {
  header: {
    job_number: "",
    prepared_by: "",
    responsible_party: "",
    location: "",
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
    weather: "",
    inspection_type: "Comprehensive Safety & Quality"
  },
  sections: [
    {
      id: "general",
      title: "Safety Overview & Daily Conditions",
      questions: [
        { id: "gen_1", text: "Any accidents on site today?", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "Yes" },
        { id: "gen_2", text: "Any schedule delays occur?", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "Yes" },
        { id: "gen_3", text: "Did weather cause any delays?", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "Yes" },
        { id: "gen_4", text: "Any visitors on site?", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "Yes" },
        { id: "gen_5", text: "Any areas blocked or restricted?", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "Yes" }
      ]
    },
    {
      id: "exterior",
      title: "1.0 Exterior & Site Conditions",
      questions: [
        { id: "ext_1", text: "Are all fences installed safely and supported properly?", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "No", defaultVal: "Yes" },
        { id: "ext_2", text: "Loading dock area clear and safe?", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "No", defaultVal: "Yes" },
        { id: "ext_3", text: "All trenching is being barricaded and workers are using shoring.", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "No", defaultVal: "Yes" },
        { id: "ext_notes", text: "Site Condition Notes", type: "textarea" }
      ]
    },
    {
      id: "quality",
      title: "2.0 Quality Assurance",
      questions: [
        { id: "qa_1", text: "Work installed matches approved drawings & specs?", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "No", defaultVal: "Yes" },
        { id: "qa_2", text: "Materials delivered conform to project requirements?", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "No", defaultVal: "Yes" },
        { id: "qa_3", text: "Required testing/inspections performed today?", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "No", defaultVal: "Yes" },
        { id: "qa_notes", text: "Quality Deficiencies or Notes", type: "textarea" }
      ]
    },
    {
      id: "housekeeping",
      title: "3.0 Housekeeping & Safety",
      questions: [
        { id: "house_1", text: "Areas clean and free of debris?", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "No", defaultVal: "Yes" },
        { id: "house_2", text: "Adequate fire extinguishers available and accessible?", type: "toggle", options: ["Yes", "No", "N/A"], triggerOn: "No", defaultVal: "Yes" },
        { id: "house_notes", text: "Safety & Housekeeping Notes", type: "textarea" }
      ]
    },
    {
      id: "signoff",
      title: "4.0 Final Verification & Sign-Off",
      questions: [
        { id: "subcontractors", text: "Subcontractors present on site today", type: "text" },
        { id: "headcount", text: "Estimated total headcount", type: "number" },
        { id: "signature", text: "Inspector Digital Signature (Type full name)", type: "signature" }
      ]
    }
  ]
};

const fetchRealLocationAndWeather = (onLocUpdate, onWxUpdate, onError) => {
  if (!navigator.geolocation) {
    onError("Geolocation is not supported by your browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const geoData = await geoRes.json();
        const address = geoData.address;
        const conciseAddress = address ?
          `${address.road || address.suburb || ''}, ${address.city || address.town || address.county || ''}`.replace(/^, | ,/g, '').trim()
          : geoData.display_name;
        onLocUpdate(conciseAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      } catch (err) {
        onLocUpdate(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
      try {
        const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const wxData = await wxRes.json();
        const cw = wxData.current_weather;
        const weatherDesc = cw.weathercode <= 3 ? "Clear/Partly Cloudy" : cw.weathercode <= 49 ? "Fog/Overcast" : "Rain/Snow/Severe";
        onWxUpdate(`${weatherDesc}, ${cw.temperature}°C, Wind: ${cw.windspeed} km/h`);
      } catch (err) {
        onWxUpdate("Data unavailable");
      }
    },
    (error) => onError(error.message),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
};

// Universal Hard Page Break that satisfies both html2pdf and MS Word
const PAGE_BREAK = `
  <div class="html2pdf__page-break" style="page-break-before: always; border: 0; margin: 0; padding: 0; height: 0;"></div>
  <br clear="all" style="mso-break-type:page-break; page-break-before:always; margin: 0; padding: 0;" />
`;

const generateReportData = async (formData, reportType = 'full') => {
  let negCount = 0;
  const cleanFormData = JSON.parse(JSON.stringify(formData));

  const renderPhotos = (photos) => {
    if (!photos || photos.length === 0) return '';
    let html = `<div class="avoid-break" style="margin-top: 10px;">`;
    photos.forEach(p => {
      html += `<img src="${p}" style="height: 180px; width: auto; object-fit: cover; border: 1px solid #94a3b8; margin-right: 10px; margin-bottom: 10px; display: inline-block;" alt="Site Photo" />`;
    });
    html += `</div>`;
    return html;
  };

  // ==========================================
  // 1. EXECUTIVE SUMMARY
  // ==========================================
  let executiveSummaryHtml = `
    ${PAGE_BREAK}
    <div style="padding-top: 20px;">
      <h2 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 20px; font-weight: bold; color: #000; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 20px; text-transform: uppercase;">
        Executive Summary
      </h2>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #000; margin-bottom: 20px; text-align: justify;">
        This document provides a formal narrative of the site conditions, compliance metrics, and operational status as evaluated on <strong>${formData.header.date}</strong>. The inspection was conducted at <strong>${formData.header.location || 'the designated project site'}</strong>, with weather conditions recorded as <strong>${formData.header.weather || 'standard'}</strong>.
      </p>
  `;

  cleanFormData.sections.forEach(sec => {
    let flaggedItems = [];
    let checkedItems = 0;
    sec.questions.forEach(q => {
      if (q.type !== 'toggle') return;
      const ans = formData.answers[q.id];
      const val = ans ? ans.value : "Not Checked";
      if (val === q.triggerOn) {
        flaggedItems.push(q.text.replace('?', '').toLowerCase());
        negCount++;
      }
      if (val !== "Not Checked" && val !== "N/A") checkedItems++;
    });

    if (checkedItems > 0 || flaggedItems.length > 0) {
      executiveSummaryHtml += `<h3 style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; color: #000; margin-top: 15px; margin-bottom: 5px; text-decoration: underline;">Review of ${sec.title.replace(/^[0-9.]+\s/, '')}</h3>`;
      
      if (flaggedItems.length === 0) {
        executiveSummaryHtml += `<p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; margin-bottom: 15px; text-align: justify;">
          No critical deviations or negative conditions were observed in this area. Documented structural states and processes align with established safety and quality protocols.
        </p>`;
      } else {
        executiveSummaryHtml += `<p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #991b1b; margin-bottom: 15px; text-align: justify;">
          <strong>ACTION REQUIRED:</strong> Conditions deviating from standard requirements were flagged regarding: <em>${flaggedItems.join('; ')}</em>. Refer to the detailed section for inspector notes.
        </p>`;
      }
    }
  });
  executiveSummaryHtml += `</div>`;

  // ==========================================
  // 2. NARRATIVE DETAILED SECTIONS
  // ==========================================
  let detailedSectionsHtml = ``;

  cleanFormData.sections.forEach(sec => {
    let compliantItems = [];
    let flaggedItems = [];
    let naItems = [];
    let textFields = [];
    let signatureFields = [];

    sec.questions.forEach(q => {
      const ans = formData.answers[q.id];
      const val = ans ? (ans.value || "Not Checked") : "Not Checked";
      const desc = ans?.desc || "";
      const photos = ans?.photos || [];

      if (q.type === 'toggle') {
        const itemData = { text: q.text, val, desc, photos };
        if (val === q.triggerOn) flaggedItems.push(itemData);
        else if (val === 'N/A' || val === 'Not Checked') naItems.push(itemData);
        else compliantItems.push(itemData);
      } else if (q.type === 'signature') signatureFields.push({ text: q.text, val });
      else textFields.push({ text: q.text, val });
    });

    let sectionHtml = `
      ${PAGE_BREAK}
      <div style="padding-top: 20px;">
        <h2 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 18px; font-weight: bold; color: #000; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 20px; text-transform: uppercase;">
          ${sec.title}
        </h2>
    `;

    if (compliantItems.length > 0) {
      sectionHtml += `
        <h3 style="font-family: Arial, sans-serif; font-size: 14px; color: #000; margin-bottom: 10px;">2.1 Verified Conditions</h3>
        <p style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6; margin-bottom: 10px;">
          The following elements were inspected and confirmed to be in compliance:
        </p>
        <ul style="font-family: Arial, sans-serif; font-size: 14px; color: #333; margin-bottom: 20px; line-height: 1.6;">
          ${compliantItems.map(i => `<li>${i.text.replace(/\?$/, '')}</li>`).join('')}
        </ul>
      `;
      compliantItems.forEach(item => {
         if (item.desc || item.photos.length > 0) {
           sectionHtml += `
            <div class="avoid-break" style="margin-bottom: 20px; padding-left: 15px; border-left: 2px solid #ccc;">
             <strong style="font-family: Arial, sans-serif; font-size: 13px; color: #555;">Ref: ${item.text}</strong>
             ${item.desc ? `<p style="font-family: Arial, sans-serif; font-size: 14px; margin: 5px 0; color: #000;">${item.desc}</p>` : ''}
             ${renderPhotos(item.photos)}
            </div>`;
         }
      });
    }

    if (flaggedItems.length > 0) {
       sectionHtml += `<h3 style="font-family: Arial, sans-serif; font-size: 14px; color: #991b1b; margin-top: 30px; margin-bottom: 10px;">2.2 Action Items & Deviations</h3>`;
       flaggedItems.forEach(item => {
          sectionHtml += `
            <table class="avoid-break" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #000;">
              <tr>
                <td style="padding: 10px; background-color: #f8f8f8; border-bottom: 1px solid #000;">
                  <strong style="font-family: Arial, sans-serif; font-size: 14px; color: #991b1b;">ISSUE: ${item.text}</strong>
                  <span style="float: right; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; border: 1px solid #991b1b; padding: 2px 6px;">Reported: ${item.val}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px;">
                  ${item.desc ? `<p style="font-family: Arial, sans-serif; font-size: 14px; color: #000; margin: 0 0 10px 0;"><strong>Remarks:</strong> ${item.desc}</p>` : '<p style="font-family: Arial, sans-serif; font-size: 14px; color: #777; margin: 0 0 10px 0;">No remarks provided.</p>'}
                  ${renderPhotos(item.photos)}
                </td>
              </tr>
            </table>
          `;
       });
    }

    if (naItems.length > 0) {
      sectionHtml += `
        <p style="font-family: Arial, sans-serif; font-size: 12px; color: #666; margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px;">
          <em>Items not applicable/checked: ${naItems.map(i => i.text.replace(/\?$/, '')).join(', ')}.</em>
        </p>
      `;
    }

    if (textFields.length > 0) {
      textFields.forEach(tf => {
        if (tf.val) {
          sectionHtml += `
            <div class="avoid-break" style="margin-top: 20px;">
              <h3 style="font-family: Arial, sans-serif; font-size: 13px; color: #555; text-transform: uppercase; margin-bottom: 5px;">${tf.text}</h3>
              <p style="font-family: Arial, sans-serif; font-size: 14px; color: #000; white-space: pre-wrap; margin: 0; padding: 10px; border: 1px solid #ccc;">${tf.val}</p>
            </div>
          `;
        }
      });
    }

    if (signatureFields.length > 0) {
       signatureFields.forEach(sf => {
         if (sf.val) {
           sectionHtml += `
            <table class="avoid-break" style="margin-top: 50px; width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 300px; border-bottom: 1px solid #000; padding-bottom: 5px;">
                  <span style="font-size: 28px; color: #000; font-family: 'Brush Script MT', cursive;">${sf.val}</span>
                </td>
                <td></td>
              </tr>
              <tr>
                <td style="padding-top: 5px;">
                  <strong style="font-family: Arial, sans-serif; font-size: 12px; color: #000; text-transform: uppercase;">${sf.text}</strong><br/>
                  <span style="font-family: Arial, sans-serif; font-size: 11px; color: #666;">Date: ${new Date().toLocaleString()}</span>
                </td>
                <td></td>
              </tr>
            </table>
           `;
         }
       });
    }

    sectionHtml += `</div>`;
    detailedSectionsHtml += sectionHtml;
  });

  // ==========================================
  // 3. PRINT-FRIENDLY COVER PAGE
  // ==========================================
  let finalHtml = `
    <div style="font-family: Arial, sans-serif; color: #000; max-width: 800px; margin: 0 auto; background: white;">
      
      <!-- COVER PAGE -->
      <table style="width: 100%; height: 800px; border-collapse: collapse; text-align: center;">
        <tr><td style="height: 100px;"></td></tr>
        <tr>
          <td style="vertical-align: middle;">
            <div style="border-top: 4px solid #0f172a; border-bottom: 4px solid #0f172a; padding: 60px 20px;">
              <p style="font-family: Arial, sans-serif; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: #555; margin-bottom: 20px; font-weight: bold;">
                Official Document
              </p>
              
              <h1 style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 46px; font-weight: 900; color: #0f172a; margin: 0 0 20px 0; text-transform: uppercase;">
                Inspection Report
              </h1>
              
              <h2 style="font-family: Arial, sans-serif; font-size: 22px; color: #333; margin: 0 0 40px 0; font-weight: normal;">
                ${formData.header.job_number || 'Project Reference: Unnamed'}
              </h2>
              
              <table style="width: 80%; margin: 0 auto; border-collapse: collapse; text-align: left;">
                <tr>
                  <td style="padding: 15px; border-bottom: 1px solid #ccc; width: 40%; color: #555; font-weight: bold; text-transform: uppercase; font-size: 12px;">Date of Survey</td>
                  <td style="padding: 15px; border-bottom: 1px solid #ccc; color: #000; font-size: 14px; font-weight: bold;">${formData.header.date}</td>
                </tr>
                <tr>
                  <td style="padding: 15px; border-bottom: 1px solid #ccc; color: #555; font-weight: bold; text-transform: uppercase; font-size: 12px;">Location</td>
                  <td style="padding: 15px; border-bottom: 1px solid #ccc; color: #000; font-size: 14px; font-weight: bold;">${formData.header.location || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 15px; border-bottom: 1px solid #ccc; color: #555; font-weight: bold; text-transform: uppercase; font-size: 12px;">Inspection Type</td>
                  <td style="padding: 15px; border-bottom: 1px solid #ccc; color: #000; font-size: 14px; font-weight: bold;">${formData.header.inspection_type}</td>
                </tr>
                <tr>
                  <td style="padding: 15px; color: #555; font-weight: bold; text-transform: uppercase; font-size: 12px;">Prepared By</td>
                  <td style="padding: 15px; color: #000; font-size: 14px; font-weight: bold;">${formData.header.prepared_by || 'N/A'}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
        <tr><td style="height: 100px;"></td></tr>
      </table>

      <!-- INJECT EXECUTIVE SUMMARY -->
      ${executiveSummaryHtml}

      <!-- INJECT DETAILED SECTIONS -->
      ${detailedSectionsHtml}
      
    </div>
  `;

  return { html: finalHtml, negCount };
};

export default function FieldSyncApp() {
  const [view, setView] = useState('dashboard');
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem('fieldsync_reports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    header: { ...FORM_SCHEMA.header },
    answers: {},
    sections: FORM_SCHEMA.sections
  });
  const [currentStep, setCurrentStep] = useState(0);

  const [isFetchingGeo, setIsFetchingGeo] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const [editorContent, setEditorContent] = useState("");
  const [negCounter, setNegCounter] = useState(0);

  const [editorSourceData, setEditorSourceData] = useState(null);
  const [editorReportType, setEditorReportType] = useState('full');
  const [savedReportId, setSavedReportId] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('fieldsync_reports', JSON.stringify(reports));
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        if (reports.length > 3) {
          const trimmedReports = reports.slice(0, 3);
          localStorage.setItem('fieldsync_reports', JSON.stringify(trimmedReports));
          setToast({ message: "Storage full. Older reports were removed.", type: "error" });
        } else {
          setToast({ message: "Storage full. Photos are too large to save.", type: "error" });
        }
      }
    }
  }, [reports]);

  useEffect(() => {
    if (view === 'wizard' && !formData.header.location && !formData.header.weather) {
      setIsFetchingGeo(true);
      setGeoError(null);
      fetchRealLocationAndWeather(
        (loc) => {
          setFormData(prev => ({...prev, header: {...prev.header, location: loc}}));
          setIsFetchingGeo(false);
        },
        (wx) => {
          setFormData(prev => ({...prev, header: {...prev.header, weather: wx}}));
        },
        (err) => {
          setGeoError(err);
          setIsFetchingGeo(false);
          setFormData(prev => ({
            ...prev,
            header: {
              ...prev.header,
              location: "Manual entry required",
              weather: "Manual entry required"
            }
          }));
        }
      );
    }
  }, [view]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const renderDashboard = () => (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500 p-2 rounded-lg shadow-lg shadow-sky-500/20"><HardHat size={24} className="text-white"/></div>
            <span className="font-bold text-2xl tracking-tight text-white">FieldSync <span className="font-normal text-sky-400 text-sm ml-1">Enterprise</span></span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 mt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Survey Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage and export your professional inspection logs.</p>
          </div>
          <button
            onClick={() => {
              setFormData({ header: {...FORM_SCHEMA.header}, answers: {}, sections: FORM_SCHEMA.sections });
              setCurrentStep(0);
              setView('wizard');
            }}
            className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-sky-600/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus size={20}/> New Survey
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-16 text-center">
            <div className="mx-auto w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mb-6">
              <FileText size={40} className="text-sky-500"/>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">No surveys recorded yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto text-lg">Get started by creating your first highly detailed, Word and PDF compatible report.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-sky-400 to-sky-600"></div>
                <div className="flex justify-between items-start mb-5">
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">#{r.job_number || 'N/A'}</span>
                  {r.issues > 0 ?
                    <span className="flex items-center gap-1.5 text-amber-700 text-xs font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shadow-sm"><AlertTriangle size={14}/> {r.issues} Issues</span> :
                    <span className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-sm"><CheckCircle2 size={14}/> Clear</span>
                  }
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">{r.date}</h3>
                <p className="text-slate-500 text-sm flex items-center gap-2 line-clamp-1 mb-1"><MapPin size={16} className="shrink-0 text-slate-400"/> {r.location}</p>
                <button
                  onClick={() => {
                    setEditorContent(r.content || '');
                    setNegCounter(r.issues);
                    setEditorReportType(r.reportType || 'full');
                    if (r.formData) {
                      setEditorSourceData(JSON.parse(r.formData));
                    } else {
                      setEditorSourceData(null);
                    }
                    setSavedReportId(r.id);
                    setView('editor');
                  }}
                  className="mt-6 w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 group-hover:bg-sky-50 group-hover:text-sky-700 group-hover:border-sky-200 transition-all"
                >
                  View & Export Document
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );

  const handleToggle = (qId, val, triggerOn) => {
    setFormData(prev => {
      const currentAns = prev.answers[qId] || {};
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [qId]: { ...currentAns, value: val, desc: currentAns.desc || "" }
        }
      };
    });
  };

  const handleInputChange = (qId, value) => {
    setFormData(prev => ({
      ...prev, answers: { ...prev.answers, [qId]: { ...(prev.answers[qId] || {}), value } }
    }));
  };

  const handleDescChange = (qId, desc) => {
    setFormData(prev => ({
      ...prev, answers: { ...prev.answers, [qId]: { ...(prev.answers[qId] || {}), desc } }
    }));
  };

  const handleHeaderChange = (field, val) => {
    setFormData(prev => ({
      ...prev, header: { ...prev.header, [field]: val }
    }));
  };

  const handlePhotoUpload = (qId, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast("Only image files are allowed", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => {
          const currentAns = prev.answers[qId] || {};
          const currentPhotos = currentAns.photos || [];
          return {
            ...prev,
            answers: { ...prev.answers, [qId]: { ...currentAns, photos: [...currentPhotos, reader.result] } }
          };
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const removePhoto = (qId, indexToRemove) => {
    setFormData(prev => {
      const currentAns = prev.answers[qId];
      if (!currentAns || !currentAns.photos) return prev;
      const updatedPhotos = currentAns.photos.filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        answers: { ...prev.answers, [qId]: { ...currentAns, photos: updatedPhotos } }
      };
    });
  };

  const handleGenerateDocument = async (type) => {
    setView('generating');
    try {
      const { html, negCount } = await generateReportData(formData, type);
      setEditorContent(html);
      setNegCounter(negCount);
      setEditorReportType(type);
      setEditorSourceData(JSON.parse(JSON.stringify(formData)));
      setSavedReportId(null);
      setView('editor');
    } catch (error) {
      console.error("Document generation failed", error);
      showToast("Failed to generate report.", "error");
      setView('wizard');
    }
  };

  const renderWizardHeader = () => (
    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-6">
      <h2 className="font-bold text-2xl text-slate-900 border-b border-slate-100 pb-5 flex justify-between items-center">
        Project Details
        {isFetchingGeo && <span className="flex items-center gap-2 text-sm text-sky-600 font-normal bg-sky-50 px-3 py-1 rounded-full"><Loader2 size={16} className="animate-spin"/> Auto-detecting...</span>}
      </h2>
      {geoError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-center gap-2 border border-red-200">
          <AlertTriangle size={18}/> {geoError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Project / Job Number</label>
          <input type="text" placeholder="e.g. PRJ-2024-001" value={formData.header.job_number} onChange={e => handleHeaderChange('job_number', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Prepared By</label>
          <input type="text" placeholder="Surveyor Name" value={formData.header.prepared_by} onChange={e => handleHeaderChange('prepared_by', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Responsible Party</label>
          <input type="text" placeholder="e.g. Lead Engineer" value={formData.header.responsible_party} onChange={e => handleHeaderChange('responsible_party', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 text-slate-400" size={20}/>
            <input type="text" placeholder="Fetching coordinates..." value={formData.header.location} onChange={e => handleHeaderChange('location', e.target.value)} className="w-full pl-11 p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Weather Context</label>
          <div className="relative">
            <Cloud className="absolute left-3.5 top-3.5 text-slate-400" size={20}/>
            <input type="text" placeholder="Fetching local weather..." value={formData.header.weather} onChange={e => handleHeaderChange('weather', e.target.value)} className="w-full pl-11 p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Inspection Type</label>
          <input type="text" value={formData.header.inspection_type} onChange={e => handleHeaderChange('inspection_type', e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all" />
        </div>
      </div>
    </div>
  );

  const renderWizard = () => (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-white border-b border-slate-200 p-5 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={() => setView('dashboard')} className="text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
          <div className="font-bold text-slate-800 bg-slate-100 px-4 py-1.5 rounded-full text-sm border border-slate-200">
            Step {currentStep + 1} of {formData.sections.length + 1}
          </div>
          <div className="flex items-center gap-3">
            {currentStep === formData.sections.length ? (
              <button onClick={() => handleGenerateDocument('full')} className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-sky-600/30 flex items-center gap-2 transform hover:-translate-y-0.5 text-sm md:text-base">
                <FileText size={18}/> Generate Final Report
              </button>
            ) : (
              <button onClick={() => { setCurrentStep(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
                Next <ChevronRight size={18}/>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 mt-6">
        {currentStep === 0 && renderWizardHeader()}

        {currentStep > 0 && currentStep <= formData.sections.length && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-2xl text-slate-900 mb-8 border-b border-slate-100 pb-4">{formData.sections[currentStep-1].title}</h2>
            <div className="space-y-10">
              {formData.sections[currentStep-1].questions.map(q => {
                const ans = formData.answers[q.id] || {};
                if (q.type === 'toggle') {
                  const isTriggered = ans.value === q.triggerOn;
                  const hasPhotos = ans.photos && ans.photos.length > 0;
                  return (
                    <div key={q.id} className="border-b border-slate-100 pb-8 last:border-0 last:pb-0">
                      <p className="font-medium text-slate-800 mb-4 text-lg">{q.text}</p>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {q.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleToggle(q.id, opt, q.triggerOn)}
                            className={`flex-1 py-3 px-5 rounded-xl font-bold border-2 transition-all ${
                              ans.value === opt
                                ? (opt === q.triggerOn ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-md' : 'bg-sky-50 border-sky-500 text-sky-700 shadow-md')
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                      {(isTriggered || ans.desc || hasPhotos) ? (
                        <div className={`mt-5 p-5 rounded-xl border-2 ${isTriggered ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                          {isTriggered && (
                            <label className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-3 bg-amber-100/50 p-2 rounded-lg inline-flex">
                              <AlertTriangle size={18}/> Documentation Required
                            </label>
                          )}
                          <textarea
                            value={ans.desc || ""}
                            onChange={(e) => handleDescChange(q.id, e.target.value)}
                            placeholder="Provide detailed observations..."
                            className={`w-full p-4 border rounded-xl focus:ring-2 focus:outline-none min-h-[100px] bg-white text-slate-700 ${isTriggered ? 'border-amber-300 focus:ring-amber-500' : 'border-slate-300 focus:ring-sky-500'}`}
                          ></textarea>
                          <div className="mt-4 flex flex-wrap gap-4 items-start">
                            {ans.photos?.map((photoUrl, i) => (
                              <div key={i} className="relative w-24 h-24 group">
                                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover rounded-xl border border-slate-300 shadow-sm" />
                                <button onClick={() => removePhoto(q.id, i)} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-md" title="Remove photo">
                                  <X size={14}/>
                                </button>
                              </div>
                            ))}
                            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 bg-white rounded-xl text-slate-500 hover:text-sky-600 hover:border-sky-500 hover:bg-sky-50 cursor-pointer transition-all">
                              <Camera size={24} className="mb-1"/>
                              <span className="text-[11px] font-bold text-center leading-tight">Add Photo</span>
                              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoUpload(q.id, e)} />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-600 cursor-pointer transition-colors px-3 py-2 -ml-3 rounded-lg hover:bg-slate-100">
                            <Camera size={16}/> Add Photo & Note
                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoUpload(q.id, e)} />
                          </label>
                        </div>
                      )}
                    </div>
                  );
                } else if (q.type === 'textarea') {
                  return (
                    <div key={q.id} className="border-b border-slate-100 pb-8 last:border-0 last:pb-0">
                      <p className="font-medium text-slate-800 mb-4 text-lg">{q.text}</p>
                      <textarea
                        value={ans.value || ""}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        placeholder="Enter comprehensive details..."
                        className="w-full p-4 border border-slate-300 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none min-h-[120px]"
                      ></textarea>
                    </div>
                  );
                } else if (q.type === 'text' || q.type === 'number') {
                  return (
                    <div key={q.id} className="border-b border-slate-100 pb-8 last:border-0 last:pb-0">
                      <p className="font-medium text-slate-800 mb-4 text-lg">{q.text}</p>
                      <input
                        type={q.type === 'number' ? 'number' : 'text'}
                        value={ans.value || ""}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        placeholder="Enter value"
                        className="w-full p-4 border border-slate-300 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>
                  );
                } else if (q.type === 'signature') {
                  return (
                    <div key={q.id} className="border-b border-slate-100 pb-8 last:border-0 last:pb-0">
                      <p className="font-medium text-slate-800 mb-4 text-lg">{q.text}</p>
                      <input
                        type="text"
                        value={ans.value || ""}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        placeholder="Type Full Name to Sign"
                        className="w-full p-4 border border-slate-300 bg-slate-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium text-lg"
                      />
                      <p className="text-sm font-medium text-slate-400 mt-3 flex items-center gap-1.5"><ShieldCheck size={16}/> Legally binding timestamp will be automatically generated upon export.</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderGenerating = () => (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm">
        <RefreshCw size={56} className="text-sky-400 animate-spin mx-auto"/>
        <h2 className="text-3xl font-bold text-white tracking-tight">Compiling Report</h2>
        <p className="text-slate-400 text-lg">Synthesizing narrative summary, formatting page breaks, and rendering PDF/Word document layouts...</p>
        <div className="w-full h-2 bg-slate-800 rounded-full mx-auto overflow-hidden mt-8">
          <div className="h-full bg-gradient-to-r from-sky-600 to-sky-400 w-2/3 animate-pulse rounded-full"></div>
        </div>
      </div>
    </div>
  );

  const editorRef = useRef(null);

  const execCmd = (cmd) => {
    document.execCommand(cmd, false, null);
    if (editorRef.current) editorRef.current.focus();
  };

  const handleExport = async (type) => {
    const content = editorRef.current?.innerHTML || editorContent;

    if (type === 'pdf') {
      const element = editorRef.current;
      if (!element) {
        showToast("Editor content not ready.", "error");
        return;
      }

      const originalOverflow = element.style.overflow;
      const originalHeight = element.style.height;
      element.style.overflow = 'visible';
      element.style.height = 'auto';

      const opt = {
        margin:       [0.5, 0.5, 0.5, 0.5], 
        filename:     `Inspection_Report_${formData.header.job_number || 'survey'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['css', 'legacy'], avoid: '.avoid-break' }
      };

      try {
        await html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();
          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text(
              `Page ${i} of ${totalPages}`, 
              pdf.internal.pageSize.getWidth() - 1.0, 
              pdf.internal.pageSize.getHeight() - 0.3
            );
          }
        }).save();
        showToast("Professional PDF generated with page numbers.");
      } catch (error) {
        console.error("PDF export failed", error);
        showToast("PDF export failed.", "error");
      } finally {
        element.style.overflow = originalOverflow;
        element.style.height = originalHeight;
      }

    } else if (type === 'docx') {
      const wordDocumentHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' 
              xmlns:w='urn:schemas-microsoft-com:office:word' 
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>Inspection Report</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page WordSection1 {
                size: 8.5in 11.0in;
                margin: 1.0in 1.0in 1.0in 1.0in;
                mso-header-margin: 0.5in;
                mso-footer-margin: 0.5in;
                mso-footer: f1;
            }
            div.WordSection1 { page: WordSection1; }
            p.MsoFooter { margin: 0in; font-size: 10.0pt; font-family: "Arial", sans-serif; color: #64748b; text-align: right; }
            body { font-family: 'Arial', sans-serif; color: #000; margin: 0; }
            img { max-width: 100%; height: auto; }
            table { border-collapse: collapse; }
          </style>
        </head>
        <body>
          <div class="WordSection1">
            ${content}
            
            <table id="hrdftrtbl" border="0" cellspacing="0" cellpadding="0" style="display:none;">
              <tr>
                <td>
                  <div style="mso-element:footer" id="f1">
                    <p class="MsoFooter">
                      Page <span style="mso-field-code: PAGE "></span> of <span style="mso-field-code: NUMPAGES "></span>
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([wordDocumentHtml], { type: 'application/msword' });
      saveAs(blob, `Inspection_Report_${formData.header.job_number || 'survey'}.doc`);
      showToast("Word Document generated with native pagination.");
    }

    const newReport = {
      id: Date.now(),
      job_number: formData.header.job_number || 'N/A',
      date: formData.header.date,
      location: formData.header.location || 'N/A',
      issues: negCounter,
      content: content,
      reportType: editorReportType,
      formData: JSON.stringify(editorSourceData || formData)
    };
    
    if (!savedReportId) {
       setReports(prev => [newReport, ...prev]);
    }
  };

  const renderEditor = () => (
    <div className="min-h-screen bg-[#e2e8f0] flex flex-col">
      <div className="bg-white border-b border-slate-200 p-3 sticky top-0 z-50 shadow-md flex flex-wrap items-center justify-between px-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (savedReportId) {
                setView('dashboard');
                setSavedReportId(null);
              } else {
                setView('wizard');
              }
            }}
            className="text-slate-500 hover:text-slate-800 bg-slate-100 p-2 rounded-lg transition-colors border border-slate-200"
          >
            <ChevronRight className="rotate-180"/>
          </button>
          <div className="flex items-center gap-1 border-r border-slate-200 pr-4">
            <button onClick={() => execCmd('bold')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Bold"><Bold size={20}/></button>
            <button onClick={() => execCmd('italic')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Italic"><Italic size={20}/></button>
            <button onClick={() => execCmd('insertUnorderedList')} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" title="Bullet List"><List size={20}/></button>
          </div>
          <span className="hidden md:flex text-sm font-bold text-slate-600 px-3 py-1.5 bg-slate-100 rounded-full items-center gap-2 border border-slate-200">
            <ShieldCheck size={16} className="text-emerald-500"/> Formal Report Layout
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => handleExport('docx')} className="px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 flex items-center gap-2 transition-all">
            <FileText size={18}/> <span className="hidden sm:inline">Export to Word</span>
          </button>
          <button onClick={() => handleExport('pdf')} className="px-5 py-2.5 text-sm font-bold text-white bg-sky-600 rounded-xl hover:bg-sky-500 flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all transform hover:-translate-y-0.5">
            <FileDown size={18}/> <span className="hidden sm:inline">Export to PDF</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-10 px-4 sm:py-12">
        <div
          ref={editorRef}
          className="mx-auto bg-white shadow-2xl focus:outline-none ring-1 ring-slate-200 print-wrapper"
          style={{
            width: '100%',
            maxWidth: '816px',
            minHeight: '1056px',
            fontFamily: '"Arial", sans-serif',
            color: '#000'
          }}
          contentEditable={true}
          suppressContentEditableWarning={true}
          dangerouslySetInnerHTML={{ __html: editorContent }}
        />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-4 fade-in">
          <div className={`px-5 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
          }`}>
            {toast.type === 'error' ? <AlertTriangle size={20}/> : <CheckCircle2 size={20} className="text-sky-400"/>}
            {toast.message}
          </div>
        </div>
      )}

      {view === 'dashboard' && renderDashboard()}
      {view === 'wizard' && renderWizard()}
      {view === 'generating' && renderGenerating()}
      {view === 'editor' && renderEditor()}
    </div>
  );
}