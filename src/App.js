import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2, AlertTriangle, FileText, ChevronRight, ChevronLeft,
  Plus, MapPin, Cloud, HardHat, FileDown, RefreshCw,
  Bold, Italic, List, ShieldCheck, Camera, X, Loader2,
  SlidersHorizontal, Trash2, Eye, CheckCheck, Search,
  Calendar, Award, FileSpreadsheet, Printer, CheckSquare
} from 'lucide-react';

// ============================================================================
// 1. PRODUCTION INSPECTION SCHEMA & CDR NARRATIVE CLAUSES
// ============================================================================
const getFormattedToday = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

const FORM_SCHEMA = {
  header: {
    job_number: "",
    project_name: "",
    date: getFormattedToday(),
    inspection_type: "Comprehensive Safety & Quality",
    prepared_by: "",
    responsible_party: "",
    location: "",
    gps_coords: "",
    weather: "",
    layout_mode: "standard", // 'standard' | 'cover'
    narrative_style: "standard" // 'standard' | 'formal' | 'concise'
  },
  sections: [
    {
      id: "general",
      code: "0.0",
      title: "Safety Overview & Daily Conditions",
      subtitle: "Incident log, schedule disruptions, weather impact, PPE & site access control",
      narrativeLead: "Daily site safety surveillance, workforce readiness checks, and schedule impact assessments were conducted across active work zones.",
      questions: [
        {
          id: "gen_1",
          code: "0.1",
          shortLabel: "Site Accidents / Incidents",
          text: "Any accidents on site today?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "Yes",
          compliantVal: "No",
          priority: "CRITICAL",
          prosePass: "zero recordable safety accidents, first-aid incidents, or near-misses occurred on site during the shift",
          proseFail: "a site safety accident or incident was recorded during today's shift requiring immediate HSE intervention",
          capaAction: "Conduct formal root-cause HSE investigation, file incident report, and hold mandatory crew safety stand-down."
        },
        {
          id: "gen_2",
          code: "0.2",
          shortLabel: "Schedule Delays",
          text: "Any schedule delays occur?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "Yes",
          compliantVal: "No",
          priority: "HIGH",
          prosePass: "critical-path construction activities progressed in accordance with the baseline schedule without operational delays",
          proseFail: "project operations experienced schedule delays impacting planned daily milestone activities",
          capaAction: "Log delay notice with project controls and coordinate recovery sequencing with affected trade subcontractors."
        },
        {
          id: "gen_3",
          code: "0.3",
          shortLabel: "Weather-Related Delays",
          text: "Did weather cause any delays?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "Yes",
          compliantVal: "No",
          priority: "MEDIUM",
          prosePass: "ambient weather conditions remained suitable for exterior and structural operations with zero weather-induced downtime",
          proseFail: "adverse weather conditions caused work stoppages and impacted exterior construction productivity",
          capaAction: "Record weather delay hours in the daily contract log and verify protection of exposed work elements."
        },
        {
          id: "gen_4",
          code: "0.4",
          shortLabel: "Site Visitors Log",
          text: "Any visitors on site?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: null,
          infoPromptOn: "Yes",
          compliantVal: "No",
          priority: "INFO",
          prosePass: "no external visitors or third-party inspectors entered the project perimeter during the shift",
          proseInfo: "authorized project visitors were logged at security control and escorted in accordance with site access protocols",
          capaAction: "Maintain visitor sign-in register and mandatory PPE escort."
        },
        {
          id: "gen_5",
          code: "0.5",
          shortLabel: "Blocked / Restricted Areas",
          text: "Any areas blocked or restricted?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "Yes",
          compliantVal: "No",
          priority: "HIGH",
          prosePass: "all primary site circulation routes and work zones remained unobstructed and accessible to active crews",
          proseFail: "specific work zones or access routes were cordoned off and restricted due to active hazard controls",
          capaAction: "Maintain high-visibility exclusion barricades, safety spotters, and detour signage until hazard clearance."
        },
        {
          id: "gen_6",
          code: "0.6",
          shortLabel: "Daily Safety Briefing",
          text: "Daily safety briefing / toolbox talk conducted with active crews?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "HIGH",
          prosePass: "pre-shift safety briefings and toolbox talks were conducted with active trade crews prior to work commencement",
          proseFail: "daily pre-shift safety briefings were not documented for all active crews on site",
          capaAction: "Convene immediate supervisor toolbox briefing and collect signed crew attendance records."
        },
        {
          id: "gen_7",
          code: "0.7",
          shortLabel: "Mandatory PPE Compliance",
          text: "All personnel wearing mandatory PPE (hard hats, high-vis vests, safety footwear)?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "HIGH",
          prosePass: "full workforce compliance with mandatory Personal Protective Equipment (hard hats, high-visibility vests, and safety footwear) was verified",
          proseFail: "non-compliance with mandatory site PPE standards was observed among field personnel",
          capaAction: "Enforce immediate PPE compliance prior to work continuation and issue formal notice to trade supervision."
        }
      ]
    },
    {
      id: "exterior",
      code: "1.0",
      title: "1.0 Exterior & Site Conditions",
      subtitle: "Perimeter security, loading zones, excavation shoring, access routes & drainage controls",
      narrativeLead: "A comprehensive perimeter and civil site condition inspection was performed across exterior laydown, loading, and excavation sectors.",
      questions: [
        {
          id: "ext_1",
          code: "1.1",
          shortLabel: "Perimeter Fencing & Support",
          text: "Are all fences installed safely and supported properly?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "HIGH",
          prosePass: "perimeter security fencing and hoarding panels were verified to be structurally plumb, braced, and securely anchored",
          proseFail: "sections of perimeter fencing exhibited inadequate bracing or instability requiring reinforcement",
          capaAction: "Re-anchor and brace unstable perimeter fencing panels immediately to secure the site boundary."
        },
        {
          id: "ext_2",
          code: "1.2",
          shortLabel: "Loading Dock Safety",
          text: "Loading dock area clear and safe?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "MEDIUM",
          prosePass: "the material loading dock and staging apron remained clear of obstructions and safe for logistics operations",
          proseFail: "the loading dock and staging area presented congestion or housekeeping hazards",
          capaAction: "Clear loading bay obstructions and re-establish designated material staging lanes."
        },
        {
          id: "ext_3",
          code: "1.3",
          shortLabel: "Trench Barricades & Shoring",
          text: "All trenching is being barricaded and workers are using shoring.",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "CRITICAL",
          prosePass: "all active excavations and utility trenches were protected by rigid barricades with engineered shoring systems utilized by crews",
          proseFail: "excavation or trenching zones lacked continuous rigid barricading or compliant trench shoring protection",
          capaAction: "Suspend work in unshored trenches immediately; install engineered shoring and rigid edge protection."
        },
        {
          id: "ext_4",
          code: "1.4",
          shortLabel: "Access Routes & Walkways",
          text: "Site access routes, signage, and pedestrian walkways clearly separated?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "HIGH",
          prosePass: "vehicular haul routes and dedicated pedestrian walkways were clearly separated with directional signage and physical barriers",
          proseFail: "separation between heavy equipment haul lanes and pedestrian walkways was inadequate or lacked signage",
          capaAction: "Restore physical barriers and high-visibility pedestrian walkway signage along site access routes."
        },
        {
          id: "ext_5",
          code: "1.5",
          shortLabel: "Erosion & Drainage Controls",
          text: "Perimeter erosion, sediment, and stormwater drainage controls intact?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "MEDIUM",
          prosePass: "perimeter erosion controls, sediment barriers, and stormwater drainage pathways were intact and functioning properly",
          proseFail: "deficiencies or sediment buildup were observed in perimeter erosion and stormwater drainage controls",
          capaAction: "Repair damaged silt fencing and clear stormwater drainage inlets to maintain environmental compliance."
        },
        {
          id: "ext_notes",
          code: "1.N",
          shortLabel: "Site Condition Notes",
          text: "Site Condition Notes",
          type: "textarea"
        }
      ]
    },
    {
      id: "quality",
      code: "2.0",
      title: "2.0 Quality Assurance",
      subtitle: "Drawing conformance, material verification, field testing, structural & MEP rough-in checks",
      narrativeLead: "Quality Assurance (QA/QC) surveillance was conducted to verify structural, architectural, and MEP conformance against approved project specifications.",
      questions: [
        {
          id: "qa_1",
          code: "2.1",
          shortLabel: "Drawing & Spec Conformance",
          text: "Work installed matches approved drawings & specs?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "CRITICAL",
          prosePass: "in-place construction work inspected today conformed to approved Issued for Construction (IFC) drawings and technical specifications",
          proseFail: "deviations between installed field work and approved drawings or specifications were identified during QA inspection",
          capaAction: "Issue Non-Conformance Report (NCR), place hold on affected work, and request design engineer disposition."
        },
        {
          id: "qa_2",
          code: "2.2",
          shortLabel: "Material Conformance",
          text: "Materials delivered conform to project requirements?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "HIGH",
          prosePass: "materials delivered to site were verified against approved material submittals, certifications, and project requirements",
          proseFail: "delivered materials failed to match approved submittal specifications or lacked required quality documentation",
          capaAction: "Segregate non-conforming material lot in quarantine laydown area and notify procurement for replacement."
        },
        {
          id: "qa_3",
          code: "2.3",
          shortLabel: "Testing & Inspections",
          text: "Required testing/inspections performed today?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "HIGH",
          prosePass: "scheduled QA/QC field testing and required hold-point inspections were executed and documented on schedule",
          proseFail: "required QA/QC field tests or hold-point inspections were missed or did not meet specification thresholds",
          capaAction: "Reschedule testing laboratory inspection and hold subsequent concealment or pour until formal sign-off."
        },
        {
          id: "qa_4",
          code: "2.4",
          shortLabel: "Structural & Formwork Verification",
          text: "Structural alignments, formwork, and installations verified prior to cover/pour?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "CRITICAL",
          prosePass: "structural alignments, reinforcement placement, and formwork stability were verified prior to concrete placement or enclosure",
          proseFail: "deficiencies in structural alignment, reinforcement spacing, or formwork bracing were observed during pre-pour inspection",
          capaAction: "Rectify structural alignment and formwork bracing deficiencies and re-verify prior to pour release."
        },
        {
          id: "qa_5",
          code: "2.5",
          shortLabel: "MEP Rough-In Inspection",
          text: "MEP (Mechanical, Electrical, Plumbing) rough-ins inspected against approved shop drawings?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "HIGH",
          prosePass: "Mechanical, Electrical, and Plumbing (MEP) rough-ins, sleeves, and conduit routing were verified against approved shop drawings",
          proseFail: "MEP rough-in installations or sleeve penetrations exhibited discrepancies against approved shop drawings",
          capaAction: "Coordinate with MEP subcontractor to adjust rough-in routing per approved coordination drawings."
        },
        {
          id: "qa_notes",
          code: "2.N",
          shortLabel: "Quality Deficiencies or Notes",
          text: "Quality Deficiencies or Notes",
          type: "textarea"
        }
      ]
    },
    {
      id: "housekeeping",
      code: "3.0",
      title: "3.0 Housekeeping & Safety",
      subtitle: "Debris management, fire protection readiness, fall protection & hazardous material storage",
      narrativeLead: "Site-wide housekeeping, fire protection readiness, elevated work fall controls, and hazardous material containment were audited.",
      questions: [
        {
          id: "house_1",
          code: "3.1",
          shortLabel: "Work Areas Clean & Debris-Free",
          text: "Areas clean and free of debris?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "MEDIUM",
          prosePass: "general housekeeping across active work zones and access corridors was maintained in a clean, debris-free condition",
          proseFail: "accumulated construction debris and potential tripping hazards were observed in active work areas",
          capaAction: "Assign cleanup crew to remove construction debris into designated waste skips immediately."
        },
        {
          id: "house_2",
          code: "3.2",
          shortLabel: "Fire Extinguishers Accessible",
          text: "Adequate fire extinguishers available and accessible?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "HIGH",
          prosePass: "charged and inspected fire extinguishers were stationed at required locations with unobstructed access",
          proseFail: "fire extinguishers were missing, obstructed, or lacked current inspection tags in active work zones",
          capaAction: "Replace or service fire extinguishers immediately and restore unobstructed access to fire points."
        },
        {
          id: "house_3",
          code: "3.3",
          shortLabel: "Scaffolding & Fall Protection",
          text: "Scaffolding, guardrails, and fall protection systems inspected and tagged?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "CRITICAL",
          prosePass: "scaffolding systems, perimeter guardrails, and fall protection equipment were inspected and carried valid safety tags",
          proseFail: "incomplete guardrails, untagged scaffolding, or fall protection deficiencies were identified at elevated work areas",
          capaAction: "Restrict access to non-compliant scaffolding immediately and install required guardrails and toe-boards."
        },
        {
          id: "house_4",
          code: "3.4",
          shortLabel: "Hazardous Material Storage",
          text: "Flammable liquids and hazardous materials properly stored in designated containment?",
          type: "toggle",
          options: ["Yes", "No", "N/A"],
          triggerOn: "No",
          compliantVal: "Yes",
          priority: "HIGH",
          prosePass: "flammable liquids, compressed gas cylinders, and hazardous materials were properly stored in designated containment areas",
          proseFail: "flammable liquids or hazardous materials were found stored outside designated secondary containment",
          capaAction: "Relocate all flammable and hazardous materials to locked containment cages with posted SDS documentation."
        },
        {
          id: "house_notes",
          code: "3.N",
          shortLabel: "Safety & Housekeeping Notes",
          text: "Safety & Housekeeping Notes",
          type: "textarea"
        }
      ]
    },
    {
      id: "signoff",
      code: "4.0",
      title: "4.0 Final Verification & Sign-Off",
      subtitle: "Subcontractor log, workforce headcount, and inspector digital attestation",
      questions: [
        {
          id: "subcontractors",
          code: "4.1",
          shortLabel: "Subcontractors Present",
          text: "Subcontractors present on site today",
          type: "text"
        },
        {
          id: "headcount",
          code: "4.2",
          shortLabel: "Estimated Total Headcount",
          text: "Estimated total headcount",
          type: "number"
        },
        {
          id: "signature",
          code: "4.3",
          shortLabel: "Inspector Digital Signature",
          text: "Inspector Digital Signature (Type full name)",
          type: "signature"
        }
      ]
    }
  ]
};

// Build clean, unselected initial answer state
const buildBlankAnswers = (sections) => {
  const initial = {};
  sections.forEach((sec) => {
    sec.questions.forEach((q) => {
      initial[q.id] = {
        value: "",
        desc: "",
        photos: [],
        drawerOpen: false
      };
    });
  });
  return initial;
};

// Dependency-free file download utility
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
};

// Load jsPDF library from CDN for crisp document generation
const ensureJsPdfLoaded = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.jspdf && window.jspdf.jsPDF) {
      resolve(window.jspdf.jsPDF);
      return;
    }
    const existing = document.getElementById('jspdf-cdn-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.jspdf?.jsPDF));
      return;
    }
    const script = document.createElement('script');
    script.id = 'jspdf-cdn-script';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    script.onload = () => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve(window.jspdf.jsPDF);
      } else {
        reject(new Error('PDF engine initialization failed.'));
      }
    };
    script.onerror = () => reject(new Error('Unable to load PDF engine.'));
    document.head.appendChild(script);
  });
};

// ============================================================================
// 2. LIVE GPS GEOLOCATION & WEATHER DETECTION
// ============================================================================
const fetchRealLocationAndWeather = (onLocUpdate, onCoordUpdate, onWxUpdate, onError) => {
  if (!navigator.geolocation) {
    onError("Geolocation is not supported by your browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const latDir = latitude >= 0 ? 'N' : 'S';
      const lonDir = longitude >= 0 ? 'E' : 'W';
      const coordStr = `${Math.abs(latitude).toFixed(4)}° ${latDir}, ${Math.abs(longitude).toFixed(4)}° ${lonDir}`;
      onCoordUpdate(coordStr);

      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const geoData = await geoRes.json();
        const address = geoData.address;
        const conciseAddress = address
          ? [
              address.road || address.suburb || address.neighbourhood || address.industrial,
              address.city || address.town || address.county || address.state
            ]
              .filter(Boolean)
              .join(', ')
          : geoData.display_name;
        onLocUpdate(conciseAddress || coordStr);
      } catch {
        onLocUpdate(coordStr);
      }

      try {
        const wxRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const wxData = await wxRes.json();
        const cw = wxData.current_weather;
        const weatherDesc =
          cw.weathercode === 0
            ? "Clear Sky"
            : cw.weathercode <= 3
              ? "Partly Cloudy"
              : cw.weathercode <= 49
                ? "Overcast / Mist"
                : cw.weathercode <= 69
                  ? "Rain Showers"
                  : "Storm / Severe Weather";
        onWxUpdate(`${weatherDesc}, ${cw.temperature}°C, Wind: ${cw.windspeed} km/h`);
      } catch {
        onWxUpdate("");
      }
    },
    (error) => onError(error.message),
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
  );
};

// ============================================================================
// 3. PHOTO TIMESTAMP & LOCATION WATERMARKING
// ============================================================================
const watermarkUploadedPhoto = (rawDataUrl, meta) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const W = 800;
      const H = 500;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      const scale = Math.max(W / img.width, H / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const dx = (W - sw) / 2;
      const dy = (H - sh) / 2;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, dx, dy, sw, sh);

      // Top-right item badge
      const badgeText = `ITEM ${meta.code || 'SITE'}`;
      ctx.font = 'bold 12px Arial, sans-serif';
      const badgeWidth = Math.max(110, ctx.measureText(badgeText).width + 28);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(W - badgeWidth - 14, 14, badgeWidth, 28);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(W - badgeWidth - 14, 14, badgeWidth, 28);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(badgeText, W - badgeWidth - 2, 32);

      // Bottom metadata bar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(0, H - 54, W, 54);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, H - 54, W, 3);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`TIMESTAMP: ${meta.timestamp}`, 16, H - 31);

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '12px monospace';
      const locLine = [meta.gps_coords, meta.location].filter(Boolean).join(' • ') || 'Location not specified';
      ctx.fillText(`LOCATION : ${locLine.slice(0, 70)}`, 16, H - 12);

      resolve({
        id: 'ph-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        dataUrl: canvas.toDataURL('image/jpeg', 0.88),
        timestamp: meta.timestamp,
        location: locLine,
        caption: meta.caption || `Item ${meta.code} — ${meta.shortLabel}`
      });
    };
    img.src = rawDataUrl;
  });
};

// ============================================================================
// 4. REPORT STYLING (USED FOR PREVIEW, PRINT & MICROSOFT WORD EXPORT)
// ============================================================================
const REPORT_CSS = `
  .report-document {
    box-sizing: border-box;
    width: 100%;
    max-width: 680px;
    margin: 0 auto;
    padding: 0;
    background: #ffffff;
    color: #0f172a;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9.8pt;
    line-height: 1.48;
  }

  .report-document * {
    box-sizing: border-box;
  }

  .report-document p,
  .report-document h1,
  .report-document h2,
  .report-document h3,
  .report-document h4 {
    margin-top: 0;
  }

  .cdr-cover-sheet {
    border: 2px solid #0f172a;
    border-radius: 6px;
    padding: 36px 32px;
    margin-bottom: 24px;
    background: #ffffff;
    page-break-after: always;
    break-after: page;
  }

  .cdr-masthead {
    width: 100%;
    border-collapse: collapse;
    border-bottom: 3px solid #0f172a;
    margin-bottom: 14px;
  }

  .cdr-masthead td {
    vertical-align: top;
    padding-bottom: 10px;
  }

  .cdr-badge {
    display: inline-block;
    background: #0f172a;
    color: #38bdf8;
    font-weight: 800;
    font-size: 7.8pt;
    letter-spacing: 1.2px;
    padding: 4px 9px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .cdr-title {
    font-size: 15.5pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.3px;
    margin: 6px 0 2px 0 !important;
    text-transform: uppercase;
  }

  .cdr-subtitle {
    font-size: 9.5pt;
    color: #475569;
    font-weight: 700;
    margin: 0 !important;
  }

  .cdr-control-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 8px 11px;
    font-family: "Courier New", Courier, monospace;
    font-size: 8pt;
    line-height: 1.45;
    text-align: left;
  }

  .cdr-ribbon-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .cdr-ribbon-table td {
    border: 1px solid #cbd5e1;
    padding: 7px 10px;
    vertical-align: top;
    background: #f8fafc;
  }

  .ribbon-label {
    font-size: 7.2pt;
    font-weight: 800;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .ribbon-val {
    font-size: 9.2pt;
    font-weight: 700;
    color: #0f172a;
  }

  .kpi-strip {
    width: 100%;
    border-collapse: separate;
    border-spacing: 6px;
    margin: 0 -6px 16px -6px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .kpi-cell {
    width: 20%;
    background: #0f172a;
    color: #ffffff;
    padding: 9px 8px;
    border-radius: 6px;
    text-align: center;
    vertical-align: middle;
  }

  .kpi-num {
    font-size: 13.5pt;
    font-weight: 800;
    color: #38bdf8;
    line-height: 1.1;
  }

  .kpi-num.pass { color: #34d399; }
  .kpi-num.fail { color: #fb923c; }

  .kpi-caption {
    font-size: 6.8pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #cbd5e1;
    margin-top: 3px;
    font-weight: 700;
  }

  .cdr-block {
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    margin-bottom: 15px;
    overflow: hidden;
  }

  .cdr-block-header {
    background: #0f172a;
    color: #ffffff;
    padding: 7px 12px;
    font-size: 8.8pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .cdr-block-sub {
    float: right;
    color: #38bdf8;
    font-family: "Courier New", monospace;
    font-size: 7.8pt;
  }

  .cdr-block-body {
    padding: 12px 14px;
    background: #ffffff;
  }

  .narrative-item {
    margin-bottom: 12px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .narrative-item:last-child {
    margin-bottom: 0;
  }

  .narrative-heading {
    font-size: 8.8pt;
    font-weight: 800;
    text-transform: uppercase;
    color: #0f172a;
    margin: 0 0 4px 0 !important;
    letter-spacing: 0.4px;
  }

  .narrative-prose {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 9.5pt;
    line-height: 1.54;
    color: #1e293b;
    text-align: justify;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 3.5px solid #0284c7;
    padding: 9px 11px;
    border-radius: 4px;
    margin: 0 !important;
  }

  .narrative-prose.alert-prose {
    border-left-color: #ea580c;
    background: #fffaf5;
  }

  .report-table {
    width: 100%;
    border-collapse: collapse;
    margin: 0;
    font-size: 8.6pt;
  }

  .report-table th {
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    text-align: left;
    font-size: 7.6pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .report-table td {
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    vertical-align: top;
    color: #1e293b;
  }

  .report-table tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .status-chip {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 999px;
    font-size: 7.2pt;
    font-weight: 800;
    text-transform: uppercase;
    border: 1px solid transparent;
  }

  .status-good {
    color: #166534;
    background: #dcfce7;
    border-color: #86efac;
  }

  .status-issue {
    color: #9a3412;
    background: #ffedd5;
    border-color: #fdba74;
  }

  .status-critical {
    color: #991b1b;
    background: #fee2e2;
    border-color: #fca5a5;
  }

  .status-neutral {
    color: #475569;
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .photo-grid {
    width: 100%;
    border-collapse: separate;
    border-spacing: 8px;
    margin: 4px -8px 0 -8px;
  }

  .photo-cell {
    width: 50%;
    vertical-align: top;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .photo-card {
    border: 1px solid #cbd5e1;
    border-radius: 5px;
    background: #f8fafc;
    padding: 6px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .photo-card-header {
    background: #0f172a;
    color: #38bdf8;
    font-family: "Courier New", monospace;
    font-size: 7.6pt;
    font-weight: 700;
    padding: 4px 7px;
    margin-bottom: 5px;
  }

  .photo-card img {
    display: block;
    width: 100%;
    max-width: 302px;
    height: 188px;
    object-fit: cover;
    margin: 0 auto;
    border: 1px solid #e2e8f0;
  }

  .photo-caption {
    margin: 5px 2px 2px 2px !important;
    color: #334155;
    font-size: 7.9pt;
    line-height: 1.35;
  }

  .signoff-card {
    border: 2px solid #0f172a;
    border-radius: 6px;
    background: #f8fafc;
    overflow: hidden;
    margin-top: 16px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .signature-script {
    font-family: "Brush Script MT", "Segoe Script", cursive;
    font-size: 21pt;
    color: #0f172a;
    border-bottom: 1.5px solid #0f172a;
    padding: 6px 0 3px 0;
    min-height: 40px;
  }

  .audit-hash-box {
    font-family: "Courier New", Courier, monospace;
    font-size: 7.6pt;
    background: #e2e8f0;
    border: 1px solid #cbd5e1;
    padding: 7px 9px;
    border-radius: 4px;
    color: #0f172a;
    line-height: 1.45;
  }

  @media print {
    body { background: #ffffff !important; }
    .no-print { display: none !important; }
    .report-document { max-width: 100% !important; }
  }
`;

// ============================================================================
// 5. REPORT DATA & NARRATIVE SYNTHESIS
// ============================================================================
const escapeHtml = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const safeText = (value, fallback = '—') => {
  const text = value === null || value === undefined ? '' : String(value).trim();
  return text ? escapeHtml(text) : fallback;
};

const sanitizeFilename = (value) => {
  const clean = String(value || 'Inspection_Report')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[-_]+|[-_]+$/g, '');
  return clean || 'Inspection_Report';
};

const computeVerificationId = (formData) => {
  const payload = JSON.stringify({
    h: formData.header,
    a: Object.keys(formData.answers || {}).sort().map((k) => ({
      k,
      v: formData.answers[k]?.value,
      d: formData.answers[k]?.desc,
      p: (formData.answers[k]?.photos || []).length
    }))
  });
  let h1 = 0xdeadbeef ^ payload.length;
  let h2 = 0x41c6ce57 ^ payload.length;
  for (let i = 0, ch; i < payload.length; i++) {
    ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex = (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).toUpperCase().padStart(12, '0');
  return `FS-VER-${hex}`;
};

const chunkArray = (items, size) => {
  const output = [];
  for (let i = 0; i < items.length; i += size) {
    output.push(items.slice(i, i + size));
  }
  return output;
};

const formatGeneratedAt = () =>
  new Date().toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const buildSectionStats = (sections, answers) => {
  let checklistCount = 0;
  let answeredCount = 0;
  let compliantCount = 0;
  let issueCount = 0;
  let naCount = 0;
  let notCheckedCount = 0;
  let photoCount = 0;

  const allFigures = [];
  let figCounter = 1;

  const sectionStats = sections.map((section) => {
    const stats = {
      checklistCount: 0,
      answeredCount: 0,
      compliantCount: 0,
      issueCount: 0,
      naCount: 0,
      notCheckedCount: 0,
      photoCount: 0
    };

    section.questions.forEach((q) => {
      const answer = answers[q.id] || {};
      const value = answer.value ? String(answer.value).trim() : '';

      if (q.type === 'toggle') {
        checklistCount += 1;
        stats.checklistCount += 1;

        if (!value) {
          notCheckedCount += 1;
          stats.notCheckedCount += 1;
        } else {
          answeredCount += 1;
          stats.answeredCount += 1;
        }

        if (value === 'N/A') {
          naCount += 1;
          stats.naCount += 1;
        } else if (q.triggerOn && value === q.triggerOn) {
          issueCount += 1;
          stats.issueCount += 1;
        } else if (value) {
          compliantCount += 1;
          stats.compliantCount += 1;
        }
      }

      const photos = Array.isArray(answer.photos) ? answer.photos : [];
      photoCount += photos.length;
      stats.photoCount += photos.length;

      photos.forEach((ph) => {
        const photoObj = typeof ph === 'string'
          ? { id: `fig-${figCounter}`, dataUrl: ph, timestamp: formatGeneratedAt(), location: '', caption: `Item ${q.code} Evidence` }
          : ph;
        allFigures.push({
          figNum: figCounter++,
          qId: q.id,
          code: q.code || '',
          shortLabel: q.shortLabel || q.text,
          photo: photoObj
        });
      });
    });

    return stats;
  });

  const totalApplicable = compliantCount + issueCount;
  const complianceScore = totalApplicable === 0 ? 100 : Math.round((compliantCount / totalApplicable) * 100);

  return {
    checklistCount,
    answeredCount,
    compliantCount,
    issueCount,
    naCount,
    notCheckedCount,
    photoCount,
    complianceScore,
    allFigures,
    sectionStats
  };
};

// Compiles structured report model + HTML preview string
const compileStructuredReport = (formData) => {
  const answers = formData.answers || {};
  const sections = formData.sections || FORM_SCHEMA.sections;
  const header = formData.header || {};
  const generatedAt = formatGeneratedAt();
  const verificationId = computeVerificationId(formData);
  const stats = buildSectionStats(sections, answers);
  const styleMode = header.narrative_style || 'standard';
  const layoutMode = header.layout_mode || 'standard';

  const getFigRefsForQuestion = (qId) => {
    const figs = stats.allFigures.filter((f) => f.qId === qId).map((f) => `Fig. ${f.figNum}`);
    return figs.length > 0 ? figs.join(', ') : '';
  };

  const enrichClause = (q) => {
    const ans = answers[q.id] || {};
    const val = ans.value || '';
    const isTriggered = q.triggerOn && val === q.triggerOn;
    const figRef = getFigRefsForQuestion(q.id);

    let base = '';
    if (q.id === 'gen_4') {
      base = val === 'Yes' ? q.proseInfo : q.prosePass;
    } else {
      base = isTriggered ? q.proseFail : q.prosePass;
    }

    if (figRef) base += ` (see ${figRef})`;
    if (ans.desc && ans.desc.trim() !== '') {
      base += `. Field note (${q.code}): "${ans.desc.trim()}"`;
    }
    return base;
  };

  // Subcontractors & Headcount
  const subsRawStr = (answers.subcontractors?.value || '').trim();
  const subsList = subsRawStr ? subsRawStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const totalHeadcount = Math.max(0, Number(answers.headcount?.value || 0));

  const manpowerRows = subsList.length === 0
    ? [{ company: header.responsible_party || 'Site Workforce', workers: totalHeadcount || '—' }]
    : (() => {
        if (totalHeadcount === 0) {
          return subsList.map((company) => ({ company, workers: 'Active' }));
        }
        const base = Math.floor(totalHeadcount / subsList.length);
        let rem = totalHeadcount % subsList.length;
        return subsList.map((company) => {
          const extra = rem > 0 ? 1 : 0;
          if (rem > 0) rem--;
          return { company, workers: base + extra };
        });
      })();

  // Corrective Action Register (CAPA)
  const capaList = [];
  sections.forEach((sec) => {
    sec.questions.forEach((q) => {
      const ans = answers[q.id] || {};
      if (q.type === 'toggle' && q.triggerOn && ans.value === q.triggerOn) {
        const figRef = getFigRefsForQuestion(q.id);
        capaList.push({
          qId: q.id,
          code: q.code || 'ITEM',
          sectionTitle: sec.title,
          shortLabel: q.shortLabel || q.text,
          question: q.text,
          val: ans.value,
          finding: `${q.proseFail || q.text}.${ans.desc ? ` Observation: ${ans.desc.trim()}` : ''}${figRef ? ` [${figRef}]` : ''}`,
          action: q.capaAction || 'Investigate non-conformance and close out corrective action prior to next shift.',
          priority: q.priority || 'HIGH'
        });
      }
    });
  });

  // Section Narrative Synthesizer
  const synthesizeSectionProse = (sec, sectionNoteId) => {
    const passed = [];
    const failed = [];
    const naList = [];
    const unansweredList = [];

    sec.questions.forEach((q) => {
      if (q.type !== 'toggle') return;
      const ans = answers[q.id] || {};
      const val = ans.value ? String(ans.value).trim() : '';
      if (!val) {
        unansweredList.push(`${q.code}`);
      } else if (val === 'N/A') {
        naList.push(`${q.shortLabel || q.code} (${q.code})`);
      } else if (q.triggerOn && val === q.triggerOn) {
        failed.push(enrichClause(q));
      } else {
        passed.push(enrichClause(q));
      }
    });

    const sentences = [];
    if (styleMode === 'formal') {
      sentences.push(`In accordance with project quality and safety procedures for ${sec.title}, field inspection evaluated active site parameters.`);
    } else if (styleMode === 'standard' && sec.narrativeLead) {
      sentences.push(sec.narrativeLead);
    }

    if (passed.length === 1) {
      sentences.push(`Field verification confirmed that ${passed[0]}.`);
    } else if (passed.length > 1) {
      sentences.push(`On-site inspection confirmed that ${passed.slice(0, -1).join('; ')}; and furthermore, ${passed[passed.length - 1]}.`);
    }

    if (failed.length > 0) {
      sentences.push(`ACTION REQUIRED: Non-conforming conditions were recorded during walkdown: ${failed.join('; additionally, ')}. Corrective actions have been logged in the Corrective Action Register.`);
    }

    if (naList.length > 0) {
      sentences.push(`Items marked Not Applicable (N/A): ${naList.join(', ')}.`);
    }

    if (unansweredList.length > 0 && passed.length === 0 && failed.length === 0) {
      sentences.push(`Checklist items in this section (${unansweredList.join(', ')}) were not evaluated during this inspection.`);
    }

    const secNoteVal = sectionNoteId && answers[sectionNoteId]?.value ? answers[sectionNoteId].value.trim() : '';
    if (secNoteVal) {
      sentences.push(`Inspector Notes: "${secNoteVal}"`);
    }

    return sentences.join(' ');
  };

  const projectDisplay = header.project_name || header.job_number || 'Site Inspection';
  const locationDisplay = [header.location, header.gps_coords].filter(Boolean).join(' • ') || 'Location Not Specified';

  const postureSummary = stats.answeredCount === 0
    ? `Checklist items are pending evaluation. Review the sections below for recorded project details and notes.`
    : capaList.length === 0
      ? `All ${stats.answeredCount} evaluated inspection parameters met project safety and quality requirements (${stats.complianceScore}% Compliance Rate), with zero deficiencies flagged.`
      : `Field inspection evaluated ${stats.answeredCount} parameters and identified ${capaList.length} item(s) requiring corrective follow-up (${stats.complianceScore}% Compliance Rate).`;

  const execProse = styleMode === 'formal'
    ? `OFFICIAL INSPECTION RECORD (${header.job_number || 'UNASSIGNED'}): On ${header.date || getFormattedToday()}, a ${header.inspection_type || 'Comprehensive Safety & Quality'} inspection was conducted for ${projectDisplay} at ${locationDisplay} under the responsibility of ${header.responsible_party || 'Site Management'}, prepared by ${header.prepared_by || 'Field Inspector'}. Active site workforce totaled ${totalHeadcount || 0} personnel${subsList.length > 0 ? ` across ${subsList.length} subcontractor organization(s)` : ''}. Weather conditions were recorded as: ${header.weather || 'Not recorded'}. ${postureSummary}`
    : `Daily field survey and inspection was conducted on ${header.date || getFormattedToday()} for ${projectDisplay} (${locationDisplay}). The inspection was prepared by ${header.prepared_by || 'Field Inspector'} with ${header.responsible_party || 'General Contractor'} serving as responsible party. Total recorded workforce on site was ${totalHeadcount || 0} personnel${subsList.length > 0 ? ` representing ${subsList.length} subcontractor trade(s)` : ''}. Ambient weather was ${header.weather || 'not specified'}. ${postureSummary}`;

  const safetyProse = synthesizeSectionProse(sections[0], null);
  const exteriorProse = synthesizeSectionProse(sections[1], 'ext_notes');
  const qaProse = synthesizeSectionProse(sections[2], 'qa_notes');
  const houseProse = synthesizeSectionProse(sections[3], 'house_notes');

  const narratives = [
    { id: 'nar_exec', title: '1.1 Executive Operational Summary', text: execProse, isAlert: capaList.length > 0 },
    { id: 'nar_safety', title: '1.2 Safety Overview & Daily Site Conditions', text: safetyProse, isAlert: false },
    { id: 'nar_ext', title: '1.3 Exterior & Civil Site Conditions', text: exteriorProse, isAlert: false },
    { id: 'nar_qa', title: '1.4 Quality Assurance & Material Verification', text: qaProse, isAlert: false },
    { id: 'nar_house', title: '1.5 Housekeeping, Fire Readiness & Fall Protection', text: houseProse, isAlert: false }
  ];

  // Build Checklist Matrix Rows
  const checklistRows = [];
  sections.forEach((sec) => {
    sec.questions.forEach((q) => {
      if (q.type === 'toggle') {
        const ans = answers[q.id] || {};
        const val = ans.value ? String(ans.value).trim() : '';
        const isTrig = q.triggerOn && val === q.triggerOn;
        const figRef = getFigRefsForQuestion(q.id);

        let statusLabel = 'NOT CHECKED';
        let badgeClass = 'status-neutral';

        if (val === 'N/A') {
          statusLabel = 'N/A';
          badgeClass = 'status-neutral';
        } else if (q.id === 'gen_4' && val) {
          statusLabel = val === 'Yes' ? 'VISITORS LOGGED' : 'NO VISITORS';
          badgeClass = 'status-good';
        } else if (isTrig) {
          statusLabel = `ACTION REQ (${val})`;
          badgeClass = 'status-issue';
        } else if (val) {
          statusLabel = `COMPLIANT (${val})`;
          badgeClass = 'status-good';
        }

        checklistRows.push({
          qId: q.id,
          sectionTitle: sec.title,
          code: q.code,
          label: q.shortLabel || q.text,
          text: q.text,
          val: val || 'Not Checked',
          note: ans.desc ? ans.desc.trim() : '',
          figRef,
          badgeClass,
          statusLabel
        });
      }
    });
  });

  const signatureValue = (answers.signature?.value || header.prepared_by || '').trim();

  // Optional Formal Cover Page HTML
  const coverSheetHtml = layoutMode === 'cover' ? `
    <div class="cdr-cover-sheet">
      <div style="border-bottom:3px solid #0f172a;padding-bottom:16px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <span class="cdr-badge">FIELDSYNC • NINEKIWI</span>
          <h2 style="font-size:13pt;font-weight:800;color:#0f172a;margin:8px 0 0 0;">OFFICIAL SITE INSPECTION RECORD</h2>
        </div>
        <div style="text-align:right;font-family:monospace;font-size:8.5pt;color:#475569;">
          <div><strong>DOC ID:</strong> ${escapeHtml(verificationId)}</div>
          <div><strong>DATE:</strong> ${safeText(header.date)}</div>
        </div>
      </div>

      <div style="padding:20px 0 32px 0;">
        <div style="font-size:9pt;font-weight:800;color:#0284c7;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">
          CONSTRUCTION DAILY INSPECTION REPORT
        </div>
        <h1 style="font-size:24pt;font-weight:800;color:#0f172a;line-height:1.15;margin:0 0 10px 0;">
          ${safeText(header.project_name, 'Construction Site Inspection Report')}
        </h1>
        <p style="font-size:11.5pt;color:#475569;font-weight:600;margin:0;">
          ${safeText(header.inspection_type, 'Comprehensive Safety & Quality')}
        </p>
      </div>

      <table class="report-table" style="margin-bottom:28px;">
        <tbody>
          <tr>
            <th style="width:34%;">Project / Job Number</th>
            <td><strong>${safeText(header.job_number)}</strong></td>
          </tr>
          <tr>
            <th>Project / Site Name</th>
            <td>${safeText(header.project_name)}</td>
          </tr>
          <tr>
            <th>Site Location</th>
            <td>${safeText(header.location)}</td>
          </tr>
          <tr>
            <th>GPS Coordinates</th>
            <td style="font-family:monospace;">${safeText(header.gps_coords)}</td>
          </tr>
          <tr>
            <th>Weather Conditions</th>
            <td>${safeText(header.weather)}</td>
          </tr>
          <tr>
            <th>Prepared By (Inspector)</th>
            <td>${safeText(header.prepared_by)}</td>
          </tr>
          <tr>
            <th>Responsible Party / Contractor</th>
            <td>${safeText(header.responsible_party)}</td>
          </tr>
        </tbody>
      </table>

      <div style="background:#f8fafc;border:1px solid #cbd5e1;border-left:4px solid #0284c7;padding:14px 16px;border-radius:4px;">
        <div style="font-size:8.5pt;font-weight:800;text-transform:uppercase;color:#0f172a;margin-bottom:4px;">
          Executive Summary Snapshot
        </div>
        <p style="font-size:9.2pt;color:#334155;margin:0;line-height:1.5;">
          ${escapeHtml(postureSummary)}
        </p>
      </div>
    </div>
  ` : '';

  // Main Report Masthead & KPI Ribbon
  const mastheadHtml = `
    <table class="cdr-masthead">
      <tr>
        <td style="width:63%;">
          <span class="cdr-badge">FIELDSYNC BY NINEKIWI • DAILY INSPECTION REPORT</span>
          <h1 class="cdr-title" data-editable-key="doc_title">Construction Daily Inspection Report</h1>
          <p class="cdr-subtitle">${safeText(header.project_name, 'Project Site Inspection')} — ${safeText(header.location, 'Site Location')}</p>
        </td>
        <td style="width:37%;">
          <div class="cdr-control-box">
            <div><strong>JOB NO :</strong> ${safeText(header.job_number)}</div>
            <div><strong>DATE   :</strong> ${safeText(header.date)}</div>
            <div><strong>TYPE   :</strong> ${safeText(header.inspection_type)}</div>
            <div><strong>GPS    :</strong> ${safeText(header.gps_coords)}</div>
          </div>
        </td>
      </tr>
    </table>

    <table class="cdr-ribbon-table">
      <tr>
        <td style="width:34%;">
          <div class="ribbon-label">Responsible Party / Contractor</div>
          <div class="ribbon-val" data-editable-key="header_responsible">${safeText(header.responsible_party)}</div>
        </td>
        <td style="width:33%;">
          <div class="ribbon-label">Prepared By (Inspector)</div>
          <div class="ribbon-val" data-editable-key="header_prepared">${safeText(header.prepared_by)}</div>
        </td>
        <td style="width:33%;">
          <div class="ribbon-label">Weather &amp; Ambient Conditions</div>
          <div class="ribbon-val" style="font-size:8.6pt;" data-editable-key="header_weather">${safeText(header.weather)}</div>
        </td>
      </tr>
    </table>

    <table class="kpi-strip">
      <tr>
        <td class="kpi-cell">
          <div class="kpi-num pass">${stats.complianceScore}%</div>
          <div class="kpi-caption">Compliance Rate</div>
        </td>
        <td class="kpi-cell">
          <div class="kpi-num">${stats.answeredCount}/${stats.checklistCount}</div>
          <div class="kpi-caption">Items Evaluated</div>
        </td>
        <td class="kpi-cell">
          <div class="kpi-num ${capaList.length > 0 ? 'fail' : 'pass'}">${capaList.length}</div>
          <div class="kpi-caption">Follow-Up Items</div>
        </td>
        <td class="kpi-cell">
          <div class="kpi-num">${totalHeadcount || 0}</div>
          <div class="kpi-caption">Site Headcount</div>
        </td>
        <td class="kpi-cell">
          <div class="kpi-num">${stats.allFigures.length}</div>
          <div class="kpi-caption">Attached Photos</div>
        </td>
      </tr>
    </table>
  `;

  // Section I: Narrative Synthesis Block
  const narrativeHtml = `
    <div class="cdr-block">
      <div class="cdr-block-header">
        Section I — Daily Operations &amp; Inspection Narrative Summary
        <span class="cdr-block-sub">EXECUTIVE SUMMARY</span>
      </div>
      <div class="cdr-block-body">
        ${narratives.map((n) => `
          <div class="narrative-item">
            <h3 class="narrative-heading">${escapeHtml(n.title)}</h3>
            <p class="narrative-prose ${n.isAlert ? 'alert-prose' : ''}" data-editable-key="${n.id}">${escapeHtml(n.text)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Section II: Workforce & Subcontractor Log
  const workforceHtml = `
    <div class="cdr-block" style="page-break-inside:avoid;break-inside:avoid;">
      <div class="cdr-block-header">
        Section II — Workforce &amp; Subcontractor Summary
        <span class="cdr-block-sub">HEADCOUNT: ${totalHeadcount || 0}</span>
      </div>
      <div class="cdr-block-body" style="padding:10px;">
        <table class="report-table">
          <thead>
            <tr>
              <th style="width:72%;">Subcontractor / Trade Organization</th>
              <th style="width:28%;text-align:right;">Personnel / Status</th>
            </tr>
          </thead>
          <tbody>
            ${manpowerRows.map((r, idx) => `
              <tr>
                <td data-editable-key="sub_name_${idx}"><strong>${escapeHtml(r.company)}</strong></td>
                <td style="text-align:right;font-family:monospace;font-weight:700;" data-editable-key="sub_count_${idx}">${escapeHtml(String(r.workers))}</td>
              </tr>
            `).join('')}
            <tr style="background:#f8fafc;font-weight:800;">
              <td>TOTAL ESTIMATED SITE WORKFORCE</td>
              <td style="text-align:right;font-family:monospace;color:#0284c7;">${totalHeadcount || 0} Personnel</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Section III: Corrective Action Register
  const capaHtml = `
    <div class="cdr-block" style="page-break-inside:avoid;break-inside:avoid;">
      <div class="cdr-block-header">
        Section III — Corrective Action &amp; Follow-Up Register
        <span class="cdr-block-sub">${capaList.length === 0 ? '0 OPEN ITEMS' : `${capaList.length} FOLLOW-UP ITEM(S)`}</span>
      </div>
      <div class="cdr-block-body" style="padding:10px;">
        ${capaList.length === 0 ? `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:10px 12px;border-radius:5px;color:#14532d;font-size:8.8pt;">
            <strong>✓ NO DEFICIENCIES OR INCIDENTS FLAGGED:</strong>
            All evaluated inspection items met project safety, quality assurance, and housekeeping requirements.
          </div>
        ` : `
          <table class="report-table">
            <thead>
              <tr>
                <th style="width:9%;">Code</th>
                <th style="width:22%;">Inspection Item</th>
                <th style="width:35%;">Recorded Observation</th>
                <th style="width:24%;">Recommended Corrective Action</th>
                <th style="width:10%;text-align:center;">Priority</th>
              </tr>
            </thead>
            <tbody>
              ${capaList.map((item, idx) => `
                <tr style="background:#fffaf5;">
                  <td style="font-family:monospace;font-weight:800;color:#b91c1c;">${escapeHtml(item.code)}</td>
                  <td><strong>${escapeHtml(item.shortLabel)}</strong></td>
                  <td data-editable-key="capa_finding_${idx}">${escapeHtml(item.finding)}</td>
                  <td data-editable-key="capa_action_${idx}">${escapeHtml(item.action)}</td>
                  <td style="text-align:center;">
                    <span class="status-chip ${item.priority === 'CRITICAL' ? 'status-critical' : 'status-issue'}">${escapeHtml(item.priority)}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;

  // Section IV: Complete Inspection Verification Matrix
  const matrixHtml = `
    <div class="cdr-block">
      <div class="cdr-block-header">
        Section IV — Section-by-Section Inspection Verification Matrix
        <span class="cdr-block-sub">${checklistRows.length} CHECKLIST ITEMS</span>
      </div>
      <div class="cdr-block-body" style="padding:10px;">
        <table class="report-table">
          <thead>
            <tr>
              <th style="width:8%;">Code</th>
              <th style="width:44%;">Inspection Question</th>
              <th style="width:30%;">Inspector Note / Photo Ref</th>
              <th style="width:18%;text-align:center;">Recorded Status</th>
            </tr>
          </thead>
          <tbody>
            ${checklistRows.map((row) => `
              <tr>
                <td style="font-family:monospace;font-weight:800;color:#475569;">${escapeHtml(row.code)}</td>
                <td>
                  <strong>${escapeHtml(row.label)}</strong>
                  <div style="font-size:7.8pt;color:#64748b;">${escapeHtml(row.text)}</div>
                </td>
                <td style="font-size:8pt;color:#334155;" data-editable-key="matrix_note_${row.qId}">
                  ${row.note ? escapeHtml(row.note) : '<span style="color:#94a3b8;">—</span>'}
                  ${row.figRef ? `<div style="color:#0284c7;font-weight:700;font-family:monospace;margin-top:2px;">[${escapeHtml(row.figRef)}]</div>` : ''}
                </td>
                <td style="text-align:center;">
                  <span class="status-chip ${row.badgeClass}">${escapeHtml(row.statusLabel)}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Section V: Photographic Evidence Gallery
  const renderPhotoAppendix = (figures) => {
    if (!figures || figures.length === 0) return '';
    const rows = chunkArray(figures, 2).map((row) => `
      <tr>
        ${row.map((item) => `
          <td class="photo-cell">
            <div class="photo-card">
              <div class="photo-card-header">
                FIGURE ${item.figNum} — ITEM ${escapeHtml(item.code)} (${escapeHtml(item.shortLabel)})
              </div>
              <img
                src="${escapeHtml(item.photo.dataUrl)}"
                alt="Figure ${item.figNum}"
                width="302"
                height="188"
              />
              <p class="photo-caption">
                <strong>Figure ${item.figNum}:</strong>
                <span data-editable-key="fig_cap_${item.figNum}">${escapeHtml(item.photo.caption)}</span><br/>
                <span style="color:#64748b;font-family:monospace;font-size:7.2pt;">
                  ${escapeHtml(item.photo.timestamp)}${item.photo.location ? ` • ${escapeHtml(item.photo.location)}` : ''}
                </span>
              </p>
            </div>
          </td>
        `).join('')}
        ${row.length === 1 ? '<td class="photo-cell"></td>' : ''}
      </tr>
    `).join('');

    return `
      <div class="cdr-block">
        <div class="cdr-block-header">
          Section V — Photographic Evidence Appendix
          <span class="cdr-block-sub">${figures.length} ATTACHED PHOTO(S)</span>
        </div>
        <div class="cdr-block-body">
          <table class="photo-grid">
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  };

  // Section VI: Final Verification & Digital Sign-Off
  const signoffHtml = `
    <div class="signoff-card">
      <div class="cdr-block-header">
        Section VI — Final Verification &amp; Digital Sign-Off
        <span class="cdr-block-sub">OFFICIAL ATTESTATION</span>
      </div>
      <div class="cdr-block-body">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:60%;padding-right:14px;vertical-align:top;">
              <p style="font-size:8.5pt;color:#334155;margin-bottom:8px !important;">
                I hereby verify that this Daily Inspection Report accurately reflects the physical site conditions, safety observations, and quality checks recorded at <strong>${safeText(header.project_name, 'the project site')}</strong> on <strong>${safeText(header.date)}</strong>.
              </p>
              <div class="audit-hash-box">
                <div><strong>GENERATED TIMESTAMP :</strong> ${escapeHtml(generatedAt)}</div>
                <div><strong>VERIFICATION ID     :</strong> ${escapeHtml(verificationId)}</div>
                <div><strong>GPS COORDINATES     :</strong> ${safeText(header.gps_coords)}</div>
              </div>
            </td>
            <td style="width:40%;vertical-align:top;background:#f8fafc;border:1px solid #cbd5e1;border-radius:5px;padding:10px 12px;">
              <div style="font-size:7.3pt;font-weight:800;text-transform:uppercase;color:#475569;letter-spacing:0.5px;">
                Inspector Digital Signature
              </div>
              <div class="signature-script" data-editable-key="signature_name">${escapeHtml(signatureValue || 'Pending Signature')}</div>
              <div style="font-size:8.5pt;font-weight:800;color:#0f172a;margin-top:5px;">
                ${escapeHtml(signatureValue || header.prepared_by || 'Inspector')}
              </div>
              <div style="font-size:7.6pt;color:#64748b;">
                ${safeText(header.responsible_party, 'FieldSync Inspection Record')}
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;

  const finalHtml = `
    <div class="report-document">
      ${coverSheetHtml}
      ${mastheadHtml}
      ${narrativeHtml}
      ${workforceHtml}
      ${capaHtml}
      ${matrixHtml}
      ${renderPhotoAppendix(stats.allFigures)}
      ${signoffHtml}
    </div>
  `;

  return {
    html: finalHtml,
    negCount: stats.issueCount,
    complianceScore: stats.complianceScore,
    photoCount: stats.photoCount,
    verificationId,
    generatedAt,
    stats,
    narratives,
    manpowerRows,
    totalHeadcount,
    capaList,
    checklistRows,
    signatureValue,
    postureSummary
  };
};

// ============================================================================
// 6. HIGH-PRECISION SELECTABLE-TEXT PDF DOCUMENT ENGINE (jsPDF)
// ============================================================================
const exportHighPrecisionPdf = async (formData, editorDomElement, filename) => {
  const JsPDFClass = await ensureJsPdfLoaded();
  const compiled = compileStructuredReport(formData);
  const header = formData.header || {};

  // Read any inline user edits made inside the preview editor before drawing PDF
  const readEditedText = (key, fallbackText) => {
    if (!editorDomElement) return fallbackText;
    const node = editorDomElement.querySelector(`[data-editable-key="${key}"]`);
    if (node && node.innerText && node.innerText.trim() !== '') {
      return node.innerText.trim();
    }
    return fallbackText;
  };

  // A4 Portrait in points: 595.28 x 841.89 pt
  const doc = new JsPDFClass({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 36;
  const contentW = pageW - marginX * 2;
  const topY = 46;
  const bottomLimit = pageH - 46;

  let curY = topY;

  const ensureSpace = (neededPt) => {
    if (curY + neededPt > bottomLimit) {
      doc.addPage();
      curY = topY;
      return true;
    }
    return false;
  };

  const drawSectionBar = (title, rightSubtitle = '') => {
    ensureSpace(34);
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(marginX, curY, contentW, 20, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), marginX + 10, curY + 13);

    if (rightSubtitle) {
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.8);
      doc.setTextColor(56, 189, 248);
      doc.text(String(rightSubtitle).toUpperCase(), marginX + contentW - 10, curY + 13, { align: 'right' });
    }
    curY += 26;
  };

  // Optional Executive Cover Sheet on Page 1
  if (header.layout_mode === 'cover') {
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1.5);
    doc.roundedRect(marginX, topY, contentW, pageH - topY - 54, 5, 5, 'S');

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(marginX + 24, topY + 24, 132, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(56, 189, 248);
    doc.text('FIELDSYNC • NINEKIWI', marginX + 32, topY + 36);

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`DOC ID: ${compiled.verificationId}`, pageW - marginX - 24, topY + 32, { align: 'right' });
    doc.text(`DATE  : ${header.date || getFormattedToday()}`, pageW - marginX - 24, topY + 44, { align: 'right' });

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.75);
    doc.line(marginX + 24, topY + 56, pageW - marginX - 24, topY + 56);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(2, 132, 199);
    doc.text('CONSTRUCTION DAILY INSPECTION REPORT', marginX + 24, topY + 86);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    const coverTitleLines = doc.splitTextToSize(header.project_name || 'Site Inspection Report', contentW - 48);
    doc.text(coverTitleLines, marginX + 24, topY + 114);

    const afterTitleY = topY + 114 + coverTitleLines.length * 24;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(header.inspection_type || 'Comprehensive Safety & Quality', marginX + 24, afterTitleY + 6);

    // Cover metadata table
    let metaY = afterTitleY + 34;
    const coverMetaRows = [
      ['Project / Job Number', header.job_number || '—'],
      ['Project / Site Name', header.project_name || '—'],
      ['Inspection Date', header.date || '—'],
      ['Site Location', header.location || '—'],
      ['GPS Coordinates', header.gps_coords || '—'],
      ['Weather Conditions', header.weather || '—'],
      ['Prepared By (Inspector)', header.prepared_by || '—'],
      ['Responsible Party', header.responsible_party || '—']
    ];

    coverMetaRows.forEach(([label, val], idx) => {
      const rowH = 24;
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX + 24, metaY, contentW - 48, rowH, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.rect(marginX + 24, metaY, contentW - 48, rowH, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(label.toUpperCase(), marginX + 32, metaY + 15);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const clippedVal = doc.splitTextToSize(String(val), contentW - 220)[0] || '—';
      doc.text(clippedVal, marginX + 190, metaY + 15);
      metaY += rowH;
    });

    // Cover summary box
    metaY += 24;
    const sumLines = doc.splitTextToSize(compiled.postureSummary, contentW - 72);
    const sumBoxH = Math.max(54, sumLines.length * 13 + 28);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX + 24, metaY, contentW - 48, sumBoxH, 4, 4, 'FD');
    doc.setFillColor(2, 132, 199);
    doc.rect(marginX + 24, metaY, 4, sumBoxH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('EXECUTIVE ASSESSMENT SNAPSHOT', marginX + 36, metaY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text(sumLines, marginX + 36, metaY + 31);

    doc.addPage();
    curY = topY;
  }

  // 1. MASTHEAD BLOCK
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(marginX, curY, 215, 15, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(56, 189, 248);
  doc.text('FIELDSYNC BY NINEKIWI • DAILY INSPECTION REPORT', marginX + 7, curY + 10.5);

  const docTitleText = readEditedText('doc_title', 'CONSTRUCTION DAILY INSPECTION REPORT');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(docTitleText.toUpperCase(), marginX, curY + 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const subText = `${header.project_name || 'Project Site Inspection'} — ${header.location || 'Site Location'}`;
  doc.text(doc.splitTextToSize(subText, 315)[0], marginX, curY + 43);

  // Right Control Box
  const ctrlW = 190;
  const ctrlX = marginX + contentW - ctrlW;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.6);
  doc.roundedRect(ctrlX, curY, ctrlW, 48, 4, 4, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.6);
  doc.setTextColor(15, 23, 42);
  doc.text(`JOB NO: ${(header.job_number || '—').slice(0, 22)}`, ctrlX + 8, curY + 12);
  doc.text(`DATE  : ${(header.date || '—').slice(0, 22)}`, ctrlX + 8, curY + 22);
  doc.text(`TYPE  : ${(header.inspection_type || '—').slice(0, 22)}`, ctrlX + 8, curY + 32);
  doc.text(`GPS   : ${(header.gps_coords || '—').slice(0, 22)}`, ctrlX + 8, curY + 42);

  curY += 54;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1.8);
  doc.line(marginX, curY, marginX + contentW, curY);
  curY += 8;

  // 2. METADATA RIBBON (3-COLUMN TABLE)
  const colW = contentW / 3;
  const ribbonH = 34;
  const respVal = readEditedText('header_responsible', header.responsible_party || '—');
  const prepVal = readEditedText('header_prepared', header.prepared_by || '—');
  const wxVal = readEditedText('header_weather', header.weather || '—');

  [
    ['RESPONSIBLE PARTY / CONTRACTOR', respVal],
    ['PREPARED BY (INSPECTOR)', prepVal],
    ['WEATHER & AMBIENT CONDITIONS', wxVal]
  ].forEach(([lbl, val], idx) => {
    const cellX = marginX + idx * colW;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.rect(cellX, curY, colW, ribbonH, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(lbl, cellX + 7, curY + 11);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const line = doc.splitTextToSize(String(val), colW - 14)[0] || '—';
    doc.text(line, cellX + 7, curY + 24);
  });
  curY += ribbonH + 8;

  // 3. KPI SCORECARD STRIP (5 BOXES)
  const kpiGap = 5;
  const kpiW = (contentW - kpiGap * 4) / 5;
  const kpiH = 36;
  const kpiItems = [
    { num: `${compiled.stats.complianceScore}%`, cap: 'COMPLIANCE RATE', color: [52, 211, 153] },
    { num: `${compiled.stats.answeredCount}/${compiled.stats.checklistCount}`, cap: 'ITEMS EVALUATED', color: [56, 189, 248] },
    { num: `${compiled.capaList.length}`, cap: 'FOLLOW-UP ITEMS', color: compiled.capaList.length > 0 ? [251, 146, 60] : [52, 211, 153] },
    { num: `${compiled.totalHeadcount || 0}`, cap: 'SITE HEADCOUNT', color: [248, 250, 252] },
    { num: `${compiled.stats.allFigures.length}`, cap: 'ATTACHED PHOTOS', color: [56, 189, 248] }
  ];

  kpiItems.forEach((k, idx) => {
    const kx = marginX + idx * (kpiW + kpiGap);
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(kx, curY, kpiW, kpiH, 4, 4, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(k.color[0], k.color[1], k.color[2]);
    doc.text(k.num, kx + kpiW / 2, curY + 17, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.3);
    doc.setTextColor(203, 213, 225);
    doc.text(k.cap, kx + kpiW / 2, curY + 29, { align: 'center' });
  });
  curY += kpiH + 12;

  // 4. SECTION I — DAILY OPERATIONS & INSPECTION NARRATIVE SUMMARY
  drawSectionBar('Section I — Daily Operations & Inspection Narrative Summary', 'EXECUTIVE SUMMARY');

  compiled.narratives.forEach((n) => {
    const editedProse = readEditedText(n.id, n.text);
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    const proseLines = doc.splitTextToSize(editedProse, contentW - 22);
    const boxH = proseLines.length * 12 + 12;

    ensureSpace(boxH + 22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(15, 23, 42);
    doc.text(n.title.toUpperCase(), marginX + 2, curY + 8);
    curY += 12;

    if (n.isAlert) {
      doc.setFillColor(255, 250, 245);
      doc.setDrawColor(253, 186, 116);
    } else {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
    }
    doc.setLineWidth(0.5);
    doc.roundedRect(marginX, curY, contentW, boxH, 3, 3, 'FD');

    if (n.isAlert) {
      doc.setFillColor(234, 88, 12);
    } else {
      doc.setFillColor(2, 132, 199);
    }
    doc.rect(marginX, curY, 3.5, boxH, 'F');

    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(proseLines, marginX + 11, curY + 13);

    curY += boxH + 9;
  });
  curY += 4;

  // 5. SECTION II — WORKFORCE & SUBCONTRACTOR SUMMARY
  drawSectionBar('Section II — Workforce & Subcontractor Summary', `HEADCOUNT: ${compiled.totalHeadcount || 0}`);

  const drawWorkforceHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.rect(marginX, curY, contentW * 0.72, 18, 'FD');
    doc.rect(marginX + contentW * 0.72, curY, contentW * 0.28, 18, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.3);
    doc.setTextColor(51, 65, 85);
    doc.text('SUBCONTRACTOR / TRADE ORGANIZATION', marginX + 7, curY + 12);
    doc.text('PERSONNEL / STATUS', marginX + contentW - 7, curY + 12, { align: 'right' });
    curY += 18;
  };

  ensureSpace(44);
  drawWorkforceHeader();

  compiled.manpowerRows.forEach((r, idx) => {
    const subName = readEditedText(`sub_name_${idx}`, r.company);
    const subCount = readEditedText(`sub_count_${idx}`, String(r.workers));
    if (ensureSpace(20)) drawWorkforceHeader();

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, curY, contentW * 0.72, 18, 'FD');
    doc.rect(marginX + contentW * 0.72, curY, contentW * 0.28, 18, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.3);
    doc.setTextColor(15, 23, 42);
    doc.text(doc.splitTextToSize(subName, contentW * 0.7 - 12)[0] || '—', marginX + 7, curY + 12);

    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.text(subCount, marginX + contentW - 7, curY + 12, { align: 'right' });
    curY += 18;
  });

  // Total Workforce Row
  ensureSpace(22);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(marginX, curY, contentW * 0.72, 19, 'FD');
  doc.rect(marginX + contentW * 0.72, curY, contentW * 0.28, 19, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL ESTIMATED SITE WORKFORCE', marginX + 7, curY + 12.5);
  doc.setFont('courier', 'bold');
  doc.setTextColor(2, 132, 199);
  doc.text(`${compiled.totalHeadcount || 0} Personnel`, marginX + contentW - 7, curY + 12.5, { align: 'right' });
  curY += 29;

  // 6. SECTION III — CORRECTIVE ACTION & FOLLOW-UP REGISTER
  drawSectionBar(
    'Section III — Corrective Action & Follow-Up Register',
    compiled.capaList.length === 0 ? '0 OPEN ITEMS' : `${compiled.capaList.length} FOLLOW-UP ITEM(S)`
  );

  if (compiled.capaList.length === 0) {
    ensureSpace(34);
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(marginX, curY, contentW, 26, 4, 4, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.3);
    doc.setTextColor(20, 83, 45);
    doc.text(
      'NO DEFICIENCIES OR INCIDENTS FLAGGED: All evaluated checklist items met project requirements.',
      marginX + 10,
      curY + 16
    );
    curY += 36;
  } else {
    const cWidths = [42, 108, 184, 134, contentW - 468];
    const drawCapaHeader = () => {
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      let cx = marginX;
      ['CODE', 'PARAMETER', 'RECORDED OBSERVATION', 'CORRECTIVE ACTION', 'PRIORITY'].forEach((h, i) => {
        doc.rect(cx, curY, cWidths[i], 18, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(51, 65, 85);
        doc.text(h, cx + 5, curY + 12);
        cx += cWidths[i];
      });
      curY += 18;
    };

    ensureSpace(48);
    drawCapaHeader();

    compiled.capaList.forEach((item, idx) => {
      const findingTxt = readEditedText(`capa_finding_${idx}`, item.finding);
      const actionTxt = readEditedText(`capa_action_${idx}`, item.action);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const lblLines = doc.splitTextToSize(item.shortLabel, cWidths[1] - 10);
      const findLines = doc.splitTextToSize(findingTxt, cWidths[2] - 10);
      const actLines = doc.splitTextToSize(actionTxt, cWidths[3] - 10);
      const maxLines = Math.max(lblLines.length, findLines.length, actLines.length, 1);
      const rowH = maxLines * 10.5 + 10;

      if (ensureSpace(rowH + 6)) drawCapaHeader();

      let cx = marginX;
      cWidths.forEach((w) => {
        doc.setFillColor(255, 250, 245);
        doc.setDrawColor(203, 213, 225);
        doc.rect(cx, curY, w, rowH, 'FD');
        cx += w;
      });

      doc.setFont('courier', 'bold');
      doc.setFontSize(8.2);
      doc.setTextColor(185, 28, 28);
      doc.text(item.code, marginX + 5, curY + 13);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(lblLines, marginX + cWidths[0] + 5, curY + 13);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(findLines, marginX + cWidths[0] + cWidths[1] + 5, curY + 13);
      doc.text(actLines, marginX + cWidths[0] + cWidths[1] + cWidths[2] + 5, curY + 13);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(153, 27, 27);
      doc.text(
        item.priority,
        marginX + cWidths[0] + cWidths[1] + cWidths[2] + cWidths[3] + cWidths[4] / 2,
        curY + 13,
        { align: 'center' }
      );

      curY += rowH;
    });
    curY += 12;
  }

  // 7. SECTION IV — INSPECTION VERIFICATION MATRIX
  drawSectionBar('Section IV — Section-by-Section Inspection Verification Matrix', `${compiled.checklistRows.length} ITEMS`);

  const mWidths = [40, 225, 165, contentW - 430];
  const drawMatrixHeader = () => {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    let mx = marginX;
    ['CODE', 'INSPECTION QUESTION', 'FIELD NOTE / PHOTO REF', 'STATUS'].forEach((h, i) => {
      doc.rect(mx, curY, mWidths[i], 18, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      doc.text(h, mx + 5, curY + 12);
      mx += mWidths[i];
    });
    curY += 18;
  };

  ensureSpace(44);
  drawMatrixHeader();

  compiled.checklistRows.forEach((row) => {
    const editedNote = readEditedText(`matrix_note_${row.qId}`, row.note || '—');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    const qLines = doc.splitTextToSize(`${row.label}: ${row.text}`, mWidths[1] - 10);
    const nLines = doc.splitTextToSize(editedNote, mWidths[2] - 10);
    const maxL = Math.max(qLines.length, nLines.length, 1);
    const rowH = maxL * 10 + 9;

    if (ensureSpace(rowH + 4)) drawMatrixHeader();

    let mx = marginX;
    mWidths.forEach((w) => {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.rect(mx, curY, w, rowH, 'FD');
      mx += w;
    });

    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(row.code, marginX + 5, curY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(15, 23, 42);
    doc.text(qLines, marginX + mWidths[0] + 5, curY + 12);

    doc.setTextColor(51, 65, 85);
    doc.text(nLines, marginX + mWidths[0] + mWidths[1] + 5, curY + 12);

    // Status pill text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    if (row.badgeClass === 'status-good') {
      doc.setTextColor(22, 101, 52);
    } else if (row.badgeClass === 'status-issue') {
      doc.setTextColor(154, 52, 18);
    } else {
      doc.setTextColor(100, 116, 139);
    }
    doc.text(
      row.statusLabel,
      marginX + mWidths[0] + mWidths[1] + mWidths[2] + mWidths[3] / 2,
      curY + 12,
      { align: 'center' }
    );

    curY += rowH;
  });
  curY += 14;

  // 8. SECTION V — PHOTOGRAPHIC EVIDENCE APPENDIX (2-COLUMN GRID)
  if (compiled.stats.allFigures.length > 0) {
    ensureSpace(215);
    drawSectionBar('Section V — Photographic Evidence Appendix', `${compiled.stats.allFigures.length} PHOTO(S)`);

    const photoPairs = chunkArray(compiled.stats.allFigures, 2);
    const cardGap = 10;
    const cardW = (contentW - cardGap) / 2;
    const imgH = 148;

    photoPairs.forEach((pair) => {
      ensureSpace(imgH + 58);

      pair.forEach((item, colIdx) => {
        const cx = marginX + colIdx * (cardW + cardGap);
        const capText = readEditedText(`fig_cap_${item.figNum}`, item.photo.caption);
        const capLines = doc.splitTextToSize(`Fig. ${item.figNum}: ${capText}`, cardW - 14);
        const cardH = imgH + 26 + capLines.length * 9.5 + 10;

        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(cx, curY, cardW, cardH, 4, 4, 'FD');

        doc.setFillColor(15, 23, 42);
        doc.rect(cx + 4, curY + 4, cardW - 8, 15, 'F');
        doc.setFont('courier', 'bold');
        doc.setFontSize(7.2);
        doc.setTextColor(56, 189, 248);
        doc.text(
          `FIGURE ${item.figNum} — ITEM ${item.code} (${(item.shortLabel || '').slice(0, 22)})`,
          cx + 8,
          curY + 14
        );

        try {
          doc.addImage(item.photo.dataUrl, 'JPEG', cx + 4, curY + 21, cardW - 8, imgH);
        } catch {
          // Fallback frame if image format is unsupported
          doc.setDrawColor(148, 163, 184);
          doc.rect(cx + 4, curY + 21, cardW - 8, imgH, 'S');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.8);
        doc.setTextColor(30, 41, 59);
        doc.text(capLines, cx + 7, curY + 21 + imgH + 11);
      });

      curY += imgH + 56;
    });
    curY += 6;
  }

  // 9. SECTION VI — FINAL VERIFICATION & DIGITAL SIGN-OFF
  ensureSpace(118);
  drawSectionBar('Section VI — Final Verification & Digital Sign-Off', 'OFFICIAL ATTESTATION');

  const signBoxH = 82;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1.2);
  doc.roundedRect(marginX, curY, contentW, signBoxH, 4, 4, 'FD');

  const attestLines = doc.splitTextToSize(
    `I hereby verify that this Daily Inspection Report accurately reflects the physical site conditions, safety observations, and quality checks recorded at ${header.project_name || 'the project site'} on ${header.date || getFormattedToday()}.`,
    contentW * 0.56
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  doc.text(attestLines, marginX + 10, curY + 15);

  // Verification box
  doc.setFillColor(226, 232, 240);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.roundedRect(marginX + 10, curY + 42, contentW * 0.56, 32, 3, 3, 'FD');

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.3);
  doc.setTextColor(15, 23, 42);
  doc.text(`GENERATED TIMESTAMP : ${compiled.generatedAt}`, marginX + 16, curY + 53);
  doc.text(`VERIFICATION ID     : ${compiled.verificationId}`, marginX + 16, curY + 62);
  doc.text(`GPS COORDINATES     : ${header.gps_coords || '—'}`, marginX + 16, curY + 71);

  // Right Signature Box
  const sigX = marginX + contentW * 0.6;
  const sigW = contentW * 0.4 - 10;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(sigX, curY + 8, sigW, signBoxH - 16, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('INSPECTOR DIGITAL SIGNATURE', sigX + 8, curY + 20);

  const finalSigName = readEditedText('signature_name', compiled.signatureValue || header.prepared_by || 'Pending Signature');
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(finalSigName.slice(0, 28), sigX + 8, curY + 42);

  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(sigX + 8, curY + 47, sigX + sigW - 8, curY + 47);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text((finalSigName || 'Inspector').slice(0, 32), sigX + 8, curY + 59);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text((header.responsible_party || 'Authorized Field Record').slice(0, 34), sigX + 8, curY + 69);

  // 10. STAMP RUNNING HEADERS & FOOTERS ON ALL PAGES
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    // Running Top Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(100, 116, 139);
    doc.text('FIELDSYNC BY NINEKIWI • OFFICIAL INSPECTION RECORD', marginX, 24);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${header.job_number ? `Job #${header.job_number}` : header.project_name || 'Daily Inspection'}`,
      pageW - marginX,
      24,
      { align: 'right' }
    );
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(marginX, 29, pageW - marginX, 29);

    // Running Bottom Footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(marginX, pageH - 30, pageW - marginX, pageH - 30);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(100, 116, 139);
    doc.text(`Verification ID: ${compiled.verificationId} • Generated ${compiled.generatedAt}`, marginX, pageH - 18);

    doc.setFont('helvetica', 'bold');
    doc.text(`Page ${p} of ${totalPages}`, pageW - marginX, pageH - 18, { align: 'right' });
  }

  doc.save(filename);
};

// ============================================================================
// 7. MAIN FIELDSYNC PRODUCTION APPLICATION COMPONENT
// ============================================================================
export default function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'wizard' | 'generating' | 'editor'
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Start with a genuinely blank form state
  const [formData, setFormData] = useState(() => ({
    header: { ...FORM_SCHEMA.header, date: getFormattedToday() },
    answers: buildBlankAnswers(FORM_SCHEMA.sections),
    sections: FORM_SCHEMA.sections
  }));

  // Saved reports in localStorage (no pre-seeded demo reports)
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem('fieldsync_production_reports_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isFetchingGeo, setIsFetchingGeo] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const [editorContent, setEditorContent] = useState("");
  const [negCounter, setNegCounter] = useState(0);
  const [editorSourceData, setEditorSourceData] = useState(null);
  const [savedReportId, setSavedReportId] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const editorRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Persist reports to localStorage with quota protection
  useEffect(() => {
    try {
      localStorage.setItem('fieldsync_production_reports_v1', JSON.stringify(reports));
    } catch (error) {
      if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        if (reports.length > 2) {
          const trimmed = reports.slice(0, 2);
          try {
            localStorage.setItem('fieldsync_production_reports_v1', JSON.stringify(trimmed));
          } catch {
            // Ignore secondary storage error
          }
          showToast("Browser storage limit reached — older reports were archived.", "error");
        }
      }
    }
  }, [reports]);

  // Detect live GPS coordinates, address, and local weather
  const detectGpsAndWeather = () => {
    setIsFetchingGeo(true);
    setGeoError(null);
    fetchRealLocationAndWeather(
      (loc) => {
        setFormData((prev) => ({
          ...prev,
          header: { ...prev.header, location: prev.header.location || loc }
        }));
        setIsFetchingGeo(false);
      },
      (coords) => {
        setFormData((prev) => ({
          ...prev,
          header: { ...prev.header, gps_coords: coords }
        }));
      },
      (wx) => {
        if (wx) {
          setFormData((prev) => ({
            ...prev,
            header: { ...prev.header, weather: prev.header.weather || wx }
          }));
        }
      },
      (err) => {
        setGeoError(`Location detection unavailable (${err}). Please enter location and weather manually.`);
        setIsFetchingGeo(false);
      }
    );
  };

  // Start a clean new survey and automatically trigger GPS & Weather detection
  const startNewSurvey = () => {
    setFormData({
      header: { ...FORM_SCHEMA.header, date: getFormattedToday() },
      answers: buildBlankAnswers(FORM_SCHEMA.sections),
      sections: FORM_SCHEMA.sections
    });
    setSavedReportId(null);
    setCurrentStep(0);
    setView('wizard');
    setTimeout(() => {
      detectGpsAndWeather();
    }, 80);
  };

  // ==========================================================================
  // SURVEY WIZARD HANDLERS
  // ==========================================================================
  const handleHeaderChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      header: { ...prev.header, [field]: val }
    }));
  };

  const handleToggle = (qId, val) => {
    setFormData((prev) => {
      const currentAns = prev.answers[qId] || {};
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [qId]: {
            ...currentAns,
            value: val,
            desc: currentAns.desc || "",
            photos: currentAns.photos || []
          }
        }
      };
    });
  };

  // Enterprise quick-pass action: marks remaining unanswered questions in the active section as compliant
  const markSectionRemainingCompliant = (section) => {
    let updatedCount = 0;
    setFormData((prev) => {
      const nextAnswers = { ...prev.answers };
      section.questions.forEach((q) => {
        if (q.type === 'toggle') {
          const cur = nextAnswers[q.id] || {};
          if (!cur.value) {
            updatedCount += 1;
            nextAnswers[q.id] = {
              ...cur,
              value: q.compliantVal || "Yes",
              desc: cur.desc || "",
              photos: cur.photos || []
            };
          }
        }
      });
      return { ...prev, answers: nextAnswers };
    });
    if (updatedCount > 0) {
      showToast(`Marked ${updatedCount} remaining item(s) as compliant.`);
    } else {
      showToast("All items in this section already have a recorded response.");
    }
  };

  const toggleNoteDrawer = (qId) => {
    setFormData((prev) => {
      const currentAns = prev.answers[qId] || {};
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [qId]: {
            ...currentAns,
            drawerOpen: !currentAns.drawerOpen
          }
        }
      };
    });
  };

  const handleInputChange = (qId, value) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [qId]: { ...(prev.answers[qId] || {}), value }
      }
    }));
  };

  const handleDescChange = (qId, desc) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [qId]: { ...(prev.answers[qId] || {}), desc, drawerOpen: true }
      }
    }));
  };

  const handlePhotoUpload = (q, e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const timestampStr = formatGeneratedAt();

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showToast("Please upload a valid image file.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const watermarked = await watermarkUploadedPhoto(reader.result, {
          code: q.code,
          shortLabel: q.shortLabel || q.text,
          timestamp: timestampStr,
          gps_coords: formData.header.gps_coords,
          location: formData.header.location,
          caption: `Item ${q.code} (${q.shortLabel || 'Site Evidence'})`
        });

        setFormData((prev) => {
          const currentAns = prev.answers[q.id] || {};
          const currentPhotos = currentAns.photos || [];
          return {
            ...prev,
            answers: {
              ...prev.answers,
              [q.id]: {
                ...currentAns,
                drawerOpen: true,
                photos: [...currentPhotos, watermarked]
              }
            }
          };
        });
        showToast(`Photo attached and stamped for Item ${q.code}.`);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = null;
  };

  const handlePhotoCaptionChange = (qId, photoIndex, newCaption) => {
    setFormData((prev) => {
      const currentAns = prev.answers[qId] || {};
      const updatedPhotos = (currentAns.photos || []).map((ph, idx) =>
        idx === photoIndex ? { ...ph, caption: newCaption } : ph
      );
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [qId]: { ...currentAns, photos: updatedPhotos }
        }
      };
    });
  };

  const removePhoto = (qId, indexToRemove) => {
    setFormData((prev) => {
      const currentAns = prev.answers[qId];
      if (!currentAns || !currentAns.photos) return prev;
      const updatedPhotos = currentAns.photos.filter((_, i) => i !== indexToRemove);
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [qId]: { ...currentAns, photos: updatedPhotos }
        }
      };
    });
  };

  // ==========================================================================
  // REPORT COMPILATION & EXPORT HANDLERS
  // ==========================================================================
  const handleGenerateDocument = (customSource = null) => {
    const sourceToUse = customSource || formData;
    setView('generating');
    setTimeout(() => {
      try {
        const compiled = compileStructuredReport(sourceToUse);
        setEditorContent(compiled.html);
        setNegCounter(compiled.negCount);
        setEditorSourceData(JSON.parse(JSON.stringify(sourceToUse)));
        setView('editor');
      } catch (error) {
        console.error("Report compilation error:", error);
        showToast("Unable to compile report. Please verify your entries.", "error");
        setView('wizard');
      }
    }, 300);
  };

  const handleUpdateReportOptionsInEditor = (newLayoutMode, newNarrativeStyle) => {
    const baseData = editorSourceData || formData;
    const updatedSource = {
      ...baseData,
      header: {
        ...baseData.header,
        layout_mode: newLayoutMode ?? baseData.header.layout_mode,
        narrative_style: newNarrativeStyle ?? baseData.header.narrative_style
      }
    };
    const compiled = compileStructuredReport(updatedSource);
    setEditorContent(compiled.html);
    if (editorRef.current) {
      editorRef.current.innerHTML = compiled.html;
    }
    setNegCounter(compiled.negCount);
    setEditorSourceData(updatedSource);
    setFormData(updatedSource);
  };

  const saveReportToDashboard = (currentHtml) => {
    const existingSource = editorSourceData || formData;
    const stats = buildSectionStats(existingSource.sections || FORM_SCHEMA.sections, existingSource.answers || {});
    const reportRecord = {
      id: savedReportId || Date.now(),
      job_number: existingSource?.header?.job_number || 'Unassigned',
      project_name: existingSource?.header?.project_name || 'Untitled Inspection',
      date: existingSource?.header?.date || getFormattedToday(),
      location: existingSource?.header?.location || 'Location not specified',
      prepared_by: existingSource?.header?.prepared_by || 'Inspector',
      issues: stats.issueCount,
      complianceScore: stats.complianceScore,
      photoCount: stats.photoCount,
      content: currentHtml,
      formData: JSON.stringify(existingSource)
    };

    if (savedReportId) {
      setReports((prev) => prev.map((r) => (r.id === savedReportId ? reportRecord : r)));
    } else {
      setReports((prev) => [reportRecord, ...prev]);
      setSavedReportId(reportRecord.id);
    }
    return reportRecord;
  };

  const handleExport = async (type) => {
    const content = editorRef.current?.innerHTML || editorContent;
    const sourceData = editorSourceData || formData;
    const jobIdentifier = sourceData?.header?.job_number || sourceData?.header?.project_name || 'Inspection_Report';
    const safeFilenameBase = sanitizeFilename(jobIdentifier);
    const verificationId = computeVerificationId(sourceData);

    if (!content) {
      showToast("No report content available to export.", "error");
      return;
    }

    if (type === 'pdf') {
      setIsExportingPdf(true);
      try {
        await exportHighPrecisionPdf(
          sourceData,
          editorRef.current,
          `FieldSync_${safeFilenameBase}_Report.pdf`
        );
        saveReportToDashboard(content);
        showToast("PDF report downloaded.");
      } catch (error) {
        console.error("PDF generation error:", error);
        showToast("Opening system print dialog for PDF save.", "error");
        window.print();
      } finally {
        setIsExportingPdf(false);
      }
    } else if (type === 'docx') {
      const wordDocumentHtml = `
        <!DOCTYPE html>
        <html
          xmlns:v="urn:schemas-microsoft-com:vml"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
          xmlns="http://www.w3.org/TR/REC-html40"
        >
          <head>
            <meta charset="utf-8">
            <meta name="ProgId" content="Word.Document">
            <meta name="Generator" content="Microsoft Word 15">
            <title>FieldSync Inspection Report - ${escapeHtml(safeFilenameBase)}</title>
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
              ${REPORT_CSS}
              @page Section1 {
                size: 595.3pt 841.9pt;
                margin: 0.6in 0.55in 0.6in 0.55in;
                mso-header-margin: 0.28in;
                mso-footer-margin: 0.28in;
                mso-header: h1;
                mso-footer: f1;
              }
              div.Section1 { page: Section1; }
              body { margin: 0; padding: 0; background: #ffffff; font-family: Arial, Helvetica, sans-serif; }
              .report-document { max-width: 100% !important; width: 100% !important; }
              table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
              td, th { mso-padding-alt: 4pt 6pt 4pt 6pt; }
              p.MsoHeader, p.MsoFooter { margin: 0in; font-size: 8pt; font-family: Arial, sans-serif; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="Section1">
              ${content}
              <table style="display:none;mso-hide:all;">
                <tr>
                  <td>
                    <div style="mso-element:header" id="h1">
                      <p class="MsoHeader" style="border-bottom:1pt solid #cbd5e1;padding-bottom:3pt;">
                        <strong>FIELDSYNC BY NINEKIWI • DAILY INSPECTION REPORT</strong>
                        <span style="float:right;">Job: ${escapeHtml(safeFilenameBase)}</span>
                      </p>
                    </div>
                    <div style="mso-element:footer" id="f1">
                      <p class="MsoFooter" style="border-top:1pt solid #cbd5e1;padding-top:3pt;">
                        <span>Verification ID: ${escapeHtml(verificationId)}</span>
                        <span style="float:right;">
                          Page <!--[if supportFields]><span style="mso-element:field-begin"></span> PAGE <span style="mso-element:field-separator"></span><![endif]-->1<!--[if supportFields]><span style="mso-element:field-end"></span><![endif]-->
                          of <!--[if supportFields]><span style="mso-element:field-begin"></span> NUMPAGES <span style="mso-element:field-separator"></span><![endif]-->1<!--[if supportFields]><span style="mso-element:field-end"></span><![endif]-->
                        </span>
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', wordDocumentHtml], {
        type: 'application/msword;charset=utf-8'
      });
      downloadBlob(blob, `FieldSync_${safeFilenameBase}_Report.doc`);
      saveReportToDashboard(content);
      showToast("Word document (.doc) downloaded.");
    }
  };

  const execCmd = (cmd) => {
    document.execCommand(cmd, false, null);
    if (editorRef.current) editorRef.current.focus();
  };

  const liveStats = buildSectionStats(formData.sections, formData.answers);

  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.job_number || '').toLowerCase().includes(q) ||
      (r.project_name || '').toLowerCase().includes(q) ||
      (r.location || '').toLowerCase().includes(q) ||
      (r.prepared_by || '').toLowerCase().includes(q) ||
      (r.date || '').toLowerCase().includes(q)
    );
  });

  // ==========================================================================
  // VIEW 1: SURVEY DASHBOARD
  // ==========================================================================
  const renderDashboard = () => (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-slate-900 text-white px-6 py-4 sticky top-0 z-50 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500 p-2.5 rounded-xl shadow-md text-white">
              <HardHat size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">FieldSync</span>
                <span className="text-[11px] uppercase tracking-widest px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-400/30">
                  by NineKiwi
                </span>
              </div>
              <p className="text-xs text-slate-400">Construction Site Survey &amp; Daily Inspection Reporting</p>
            </div>
          </div>

          <button
            onClick={startNewSurvey}
            className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition"
          >
            <Plus size={18} /> New Site Inspection
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Executive Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider">
              <Award size={14} /> Daily Construction Inspection Suite
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Inspection Reports &amp; Field Logs
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Capture daily safety conditions, site observations, quality assurance checks, and timestamped site photographs to generate formal PDF and Microsoft Word inspection reports.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto shrink-0">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center min-w-[110px]">
              <div className="text-2xl font-extrabold text-slate-900">{reports.length}</div>
              <div className="text-[11px] uppercase text-slate-500 font-bold mt-0.5">Total Reports</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center min-w-[110px]">
              <div className="text-2xl font-extrabold text-emerald-600">
                {reports.length > 0
                  ? `${Math.round(reports.reduce((a, b) => a + (b.complianceScore ?? 100), 0) / reports.length)}%`
                  : '—'}
              </div>
              <div className="text-[11px] uppercase text-slate-500 font-bold mt-0.5">Avg Compliance</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center min-w-[110px]">
              <div className="text-2xl font-extrabold text-sky-600">
                {reports.reduce((a, b) => a + (b.photoCount || 0), 0)}
              </div>
              <div className="text-[11px] uppercase text-slate-500 font-bold mt-0.5">Logged Photos</div>
            </div>
          </div>
        </div>

        {/* Reports Directory */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-extrabold text-slate-900">
              Saved Inspection Reports
            </h2>
            {reports.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by job #, project, or location..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {reports.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-16 text-center">
              <div className="mx-auto w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="text-sky-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No inspection reports recorded yet</h3>
              <p className="text-slate-500 max-w-md mx-auto text-sm mb-6">
                Start a new site inspection to record checklist observations, attach timestamped field photos, and generate a formal report.
              </p>
              <button
                onClick={startNewSurvey}
                className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 shadow-md transition"
              >
                <Plus size={18} /> Start First Site Inspection
              </button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-sm">
              No inspection reports match "{searchQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between"
                >
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${r.issues > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <span className="bg-slate-100 text-slate-800 font-mono text-xs font-bold px-3 py-1 rounded-md border border-slate-200">
                        #{r.job_number || 'Unassigned'}
                      </span>
                      {r.issues > 0 ? (
                        <span className="flex items-center gap-1 text-amber-800 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <AlertTriangle size={13} /> {r.issues} Follow-Up
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-800 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 size={13} /> Compliant
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 line-clamp-1 mb-1">
                      {r.project_name || 'Site Inspection Report'}
                    </h3>
                    <p className="text-slate-500 text-xs flex items-center gap-1.5 mb-1.5">
                      <Calendar size={13} className="text-slate-400" /> {r.date}
                    </p>
                    <p className="text-slate-600 text-xs flex items-center gap-1.5 line-clamp-1">
                      <MapPin size={13} className="shrink-0 text-sky-600" /> {r.location}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (r.formData) {
                          const parsed = JSON.parse(r.formData);
                          const compiled = compileStructuredReport(parsed);
                          setEditorContent(r.content || compiled.html);
                          setNegCounter(compiled.negCount);
                          setEditorSourceData(parsed);
                        } else {
                          setEditorContent(r.content || '');
                          setNegCounter(r.issues || 0);
                          setEditorSourceData(null);
                        }
                        setSavedReportId(r.id);
                        setView('editor');
                      }}
                      className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye size={15} /> Open Report
                    </button>

                    <button
                      onClick={() => {
                        if (r.formData) {
                          setFormData(JSON.parse(r.formData));
                          setSavedReportId(r.id);
                          setCurrentStep(0);
                          setView('wizard');
                        }
                      }}
                      className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                      title="Edit Survey Responses"
                    >
                      <SlidersHorizontal size={15} />
                    </button>

                    <button
                      onClick={() => {
                        setReports((prev) => prev.filter((item) => item.id !== r.id));
                        showToast("Report deleted.");
                      }}
                      className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Delete Report"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );

  // ==========================================================================
  // VIEW 2: MULTI-STEP SURVEY WIZARD
  // ==========================================================================
  const renderWizardHeaderStep = () => (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
            Step 1 of {formData.sections.length + 1}
          </span>
          <h2 className="font-extrabold text-xl sm:text-2xl text-slate-900">Project Details &amp; Site Conditions</h2>
        </div>

        <button
          type="button"
          onClick={detectGpsAndWeather}
          disabled={isFetchingGeo}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-xl border border-slate-300 flex items-center gap-1.5 transition"
        >
          {isFetchingGeo ? (
            <Loader2 size={14} className="animate-spin text-sky-600" />
          ) : (
            <MapPin size={14} className="text-sky-600" />
          )}
          <span>{isFetchingGeo ? 'Detecting GPS & Weather...' : 'Detect GPS & Weather'}</span>
        </button>
      </div>

      {geoError && (
        <div className="bg-amber-50 text-amber-900 p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border border-amber-200">
          <AlertTriangle size={16} className="shrink-0 text-amber-600" /> {geoError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Project / Job Number</label>
          <input
            type="text"
            placeholder="e.g. PRJ-2026-104"
            value={formData.header.job_number}
            onChange={(e) => handleHeaderChange('job_number', e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Project / Site Name</label>
          <input
            type="text"
            placeholder="Enter project or building name"
            value={formData.header.project_name}
            onChange={(e) => handleHeaderChange('project_name', e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Prepared By (Inspector Name)</label>
          <input
            type="text"
            placeholder="Enter inspector full name"
            value={formData.header.prepared_by}
            onChange={(e) => handleHeaderChange('prepared_by', e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Responsible Party / General Contractor</label>
          <input
            type="text"
            placeholder="Enter contractor or responsible organization"
            value={formData.header.responsible_party}
            onChange={(e) => handleHeaderChange('responsible_party', e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Site Location</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={isFetchingGeo ? "Detecting location..." : "Enter site address or sector"}
              value={formData.header.location}
              onChange={(e) => handleHeaderChange('location', e.target.value)}
              className="w-full pl-10 p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">GPS Coordinates</label>
          <input
            type="text"
            placeholder={isFetchingGeo ? "Detecting coordinates..." : "e.g. 30.3165° N, 78.0322° E"}
            value={formData.header.gps_coords}
            onChange={(e) => handleHeaderChange('gps_coords', e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Weather Conditions</label>
          <div className="relative">
            <Cloud className="absolute left-3.5 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={isFetchingGeo ? "Detecting local weather..." : "e.g. Clear Sky, 28°C, Wind: 10 km/h"}
              value={formData.header.weather}
              onChange={(e) => handleHeaderChange('weather', e.target.value)}
              className="w-full pl-10 p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Inspection Date</label>
            <input
              type="text"
              value={formData.header.date}
              onChange={(e) => handleHeaderChange('date', e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">Inspection Type</label>
            <input
              type="text"
              value={formData.header.inspection_type}
              onChange={(e) => handleHeaderChange('inspection_type', e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderWizard = () => {
    const activeSection = currentStep > 0 ? formData.sections[currentStep - 1] : null;
    const hasToggleQuestions = activeSection?.questions?.some((q) => q.type === 'toggle');

    return (
      <div className="min-h-screen bg-slate-50 pb-24">
        {/* Top Wizard Navigation Bar */}
        <div className="bg-slate-900 text-white px-4 py-3.5 sticky top-0 z-40 shadow-md border-b border-slate-800">
          <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-3">
            <button
              onClick={() => setView('dashboard')}
              className="text-slate-300 hover:text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5"
            >
              <ChevronLeft size={16} /> Dashboard
            </button>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => setCurrentStep(0)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  currentStep === 0 ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Project Details
              </button>
              {formData.sections.map((sec, idx) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setCurrentStep(idx + 1)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    currentStep === idx + 1 ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sec.code} {sec.title.replace(/^[0-9.]+\s*/, '').split(' ')[0]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleGenerateDocument()}
              className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition shadow flex items-center gap-1.5"
            >
              <FileText size={16} /> Preview &amp; Generate Report
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
          {/* Progress Status Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-5 flex-wrap">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Checklist Progress</div>
                <div className="text-base font-extrabold text-slate-900">
                  {liveStats.answeredCount} / {liveStats.checklistCount} Answered
                </div>
              </div>
              <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Follow-Up Items</div>
                <div className={`text-base font-extrabold ${liveStats.issueCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                  {liveStats.issueCount} Flagged
                </div>
              </div>
              <div className="h-7 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Attached Photos</div>
                <div className="text-base font-extrabold text-sky-600">{liveStats.photoCount} Photos</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep((prev) => prev - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
                >
                  ← Previous
                </button>
              )}
              {currentStep < formData.sections.length ? (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep((prev) => prev + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  Next Section <ChevronRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleGenerateDocument()}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  <FileText size={15} /> Generate Final Report →
                </button>
              )}
            </div>
          </div>

          {currentStep === 0 && renderWizardHeaderStep()}

          {activeSection && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <span className="text-[11px] font-mono text-sky-400 uppercase font-bold">
                    Section {activeSection.code}
                  </span>
                  <h2 className="font-extrabold text-xl">{activeSection.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{activeSection.subtitle}</p>
                </div>

                {hasToggleQuestions && (
                  <button
                    type="button"
                    onClick={() => markSectionRemainingCompliant(activeSection)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition"
                  >
                    <CheckSquare size={14} /> Mark Remaining as Compliant
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-200">
                {activeSection.questions.map((q) => {
                  const ans = formData.answers[q.id] || {};
                  if (q.type === 'toggle') {
                    const isTriggered = q.triggerOn && ans.value === q.triggerOn;
                    const isInfoActive = q.infoPromptOn && ans.value === q.infoPromptOn;
                    const hasPhotos = Array.isArray(ans.photos) && ans.photos.length > 0;
                    const isDrawerVisible = isTriggered || isInfoActive || ans.drawerOpen || Boolean(ans.desc) || hasPhotos;

                    return (
                      <div key={q.id} className="p-6 transition hover:bg-slate-50/60">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1 pr-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {q.code}
                              </span>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {q.shortLabel}
                              </span>
                              {isTriggered && (
                                <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                  <AlertTriangle size={12} /> Follow-Up Required
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-slate-900 text-base">{q.text}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                            <div className="inline-flex rounded-xl border border-slate-300 bg-slate-100 p-1">
                              {q.options.map((opt) => {
                                const isSelected = ans.value === opt;
                                const isOptAlert = q.triggerOn === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleToggle(q.id, opt)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-extrabold transition ${
                                      isSelected
                                        ? isOptAlert
                                          ? 'bg-amber-600 text-white shadow'
                                          : opt === 'N/A'
                                            ? 'bg-slate-700 text-white shadow'
                                            : 'bg-sky-600 text-white shadow'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleNoteDrawer(q.id)}
                              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                                isDrawerVisible
                                  ? 'bg-sky-50 border-sky-400 text-sky-900'
                                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <Camera size={14} />
                              <span>Add Photo &amp; Note</span>
                              {hasPhotos && (
                                <span className="px-1.5 py-0.2 rounded-full bg-sky-600 text-white text-[10px] font-extrabold">
                                  {ans.photos.length}
                                </span>
                              )}
                            </button>
                          </div>
                        </div>

                        {isDrawerVisible && (
                          <div className={`mt-4 p-4 rounded-xl border ${isTriggered ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                  Inspector Observation / Field Note ({q.code})
                                </label>
                                <textarea
                                  rows={3}
                                  value={ans.desc || ""}
                                  onChange={(e) => handleDescChange(q.id, e.target.value)}
                                  placeholder="Enter specific location, observation details, or corrective actions taken..."
                                  className="w-full p-3 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                                  Attach Site Photographs (Timestamp &amp; Location Stamped)
                                </label>
                                <label className="block border-2 border-dashed border-slate-300 hover:border-sky-500 bg-white rounded-xl p-4 text-center cursor-pointer transition">
                                  <Camera size={22} className="mx-auto text-sky-600 mb-1" />
                                  <span className="block text-xs font-bold text-slate-800">Click to Capture or Upload Photos</span>
                                  <span className="block text-[11px] text-slate-400 mt-0.5">
                                    Automatically stamps timestamp &amp; location metadata
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload(q, e)}
                                  />
                                </label>
                              </div>
                            </div>

                            {hasPhotos && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                                {ans.photos.map((ph, pIdx) => {
                                  const imgSrc = typeof ph === 'string' ? ph : ph.dataUrl;
                                  const phCap = typeof ph === 'string' ? '' : ph.caption;
                                  return (
                                    <div key={ph.id || pIdx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                      <div className="relative h-36 bg-slate-900">
                                        <img src={imgSrc} alt="Site Evidence" className="w-full h-full object-cover" />
                                        <button
                                          type="button"
                                          onClick={() => removePhoto(q.id, pIdx)}
                                          className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                      <div className="p-2">
                                        <input
                                          type="text"
                                          value={phCap}
                                          onChange={(e) => handlePhotoCaptionChange(q.id, pIdx, e.target.value)}
                                          placeholder="Enter photo caption..."
                                          className="w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-sky-500"
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (q.type === 'textarea') {
                    return (
                      <div key={q.id} className="p-6 bg-slate-50/70">
                        <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">
                          {q.text}
                        </label>
                        <textarea
                          rows={3}
                          value={ans.value || ""}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                          placeholder={`Enter ${q.text.toLowerCase()}...`}
                          className="w-full p-3.5 border border-slate-300 bg-white rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                    );
                  }

                  if (q.type === 'text' || q.type === 'number') {
                    return (
                      <div key={q.id} className="p-6">
                        <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">
                          {q.text}
                        </label>
                        <input
                          type={q.type === 'number' ? 'number' : 'text'}
                          value={ans.value || ""}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                          placeholder={q.id === 'subcontractors' ? "e.g. Subcontractor A, Subcontractor B (comma-separated)" : "Enter value"}
                          className="w-full p-3.5 border border-slate-300 bg-slate-50 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                    );
                  }

                  if (q.type === 'signature') {
                    return (
                      <div key={q.id} className="p-6 bg-slate-50/60">
                        <label className="block text-xs font-extrabold uppercase text-slate-700 mb-2">
                          {q.text}
                        </label>
                        <input
                          type="text"
                          value={ans.value || ""}
                          onChange={(e) => handleInputChange(q.id, e.target.value)}
                          placeholder="Type full name to sign"
                          className="w-full p-3.5 border-2 border-slate-300 bg-white rounded-xl text-base font-bold focus:border-sky-500 focus:outline-none"
                        />
                        <div className="mt-3 p-4 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <div className="text-[10px] font-bold uppercase text-slate-400">Signature Preview</div>
                            <div className="text-2xl italic font-serif text-slate-900 mt-1">
                              {ans.value || "Awaiting Inspector Signature..."}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                            <ShieldCheck size={16} className="text-emerald-600" /> Legally binding timestamp will be automatically generated upon export.
                          </span>
                        </div>
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
  };

  // ==========================================================================
  // VIEW 3: COMPILING REPORT SCREEN
  // ==========================================================================
  const renderGenerating = () => (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <RefreshCw size={48} className="text-sky-400 animate-spin mx-auto" />
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Compiling Inspection Report</h2>
        <p className="text-slate-400 text-sm">
          Formatting executive summary, inspection matrices, photographic evidence, and digital sign-off...
        </p>
      </div>
    </div>
  );

  // ==========================================================================
  // VIEW 4: REPORT PREVIEW, INLINE EDITOR & EXPORT SUITE
  // ==========================================================================
  const renderEditor = () => {
    const activeLayout = editorSourceData?.header?.layout_mode || formData.header.layout_mode || 'standard';
    const activeStyle = editorSourceData?.header?.narrative_style || formData.header.narrative_style || 'standard';

    return (
      <div className="min-h-screen bg-slate-200 flex flex-col">
        <style dangerouslySetInnerHTML={{ __html: REPORT_CSS }} />

        {/* Sticky Top Toolbar */}
        <div className="bg-slate-900 text-white p-3 sticky top-0 z-50 shadow-lg border-b border-slate-800 px-4 sm:px-6 no-print">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Navigation & Text Formatting */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setView('wizard')}
                className="text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 transition"
              >
                <ChevronLeft size={15} /> Back to Survey
              </button>

              <button
                onClick={() => setView('dashboard')}
                className="text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 transition"
              >
                Dashboard
              </button>

              <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
                <button onClick={() => execCmd('bold')} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg" title="Bold">
                  <Bold size={15} />
                </button>
                <button onClick={() => execCmd('italic')} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg" title="Italic">
                  <Italic size={15} />
                </button>
                <button onClick={() => execCmd('insertUnorderedList')} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg" title="Bullet List">
                  <List size={15} />
                </button>
              </div>

              {/* Layout Switcher */}
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-slate-400 font-semibold">Layout:</span>
                <select
                  value={activeLayout}
                  onChange={(e) => handleUpdateReportOptionsInEditor(e.target.value, null)}
                  className="bg-transparent text-sky-300 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="standard" className="bg-slate-900 text-white">Standard CDR Layout</option>
                  <option value="cover" className="bg-slate-900 text-white">Executive Cover Layout</option>
                </select>
              </div>

              {/* Narrative Tone Switcher */}
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-slate-400 font-semibold">Narrative:</span>
                <select
                  value={activeStyle}
                  onChange={(e) => handleUpdateReportOptionsInEditor(null, e.target.value)}
                  className="bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="standard" className="bg-slate-900 text-white">Standard Daily Narrative</option>
                  <option value="formal" className="bg-slate-900 text-white">Formal Engineering Record</option>
                  <option value="concise" className="bg-slate-900 text-white">Concise Technical Summary</option>
                </select>
              </div>
            </div>

            {/* Save & Export Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  const html = editorRef.current?.innerHTML || editorContent;
                  saveReportToDashboard(html);
                  showToast("Report saved to Dashboard.");
                }}
                className="px-3.5 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center gap-1.5"
              >
                <CheckCheck size={15} className="text-emerald-400" /> Save
              </button>

              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition flex items-center gap-1.5"
              >
                <Printer size={15} /> Print
              </button>

              <button
                onClick={() => handleExport('docx')}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl flex items-center gap-1.5 shadow transition"
              >
                <FileSpreadsheet size={16} className="text-sky-700" /> Export Word (.doc)
              </button>

              <button
                onClick={() => handleExport('pdf')}
                disabled={isExportingPdf}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl flex items-center gap-1.5 shadow-md transition"
              >
                {isExportingPdf ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Helper Banner */}
        <div className="bg-slate-800 text-slate-300 text-xs py-2 px-4 text-center border-b border-slate-700 no-print">
          <strong className="text-sky-300">Report Preview &amp; Editor:</strong> Click directly on any paragraph, note, or table entry below to refine the text prior to downloading your PDF or Word report.
        </div>

        {/* Editable A4 Sheet */}
        <div className="flex-1 overflow-auto py-8 px-3 sm:px-6">
          <div
            ref={editorRef}
            className="mx-auto bg-white shadow-2xl focus:outline-none ring-1 ring-slate-300 rounded-sm"
            style={{
              width: '760px',
              maxWidth: '100%',
              minHeight: '1060px',
              padding: '36px 40px',
              color: '#0f172a'
            }}
            contentEditable={true}
            suppressContentEditableWarning={true}
            dangerouslySetInnerHTML={{ __html: editorContent }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen font-sans antialiased">
      {toast && (
        <div className="fixed bottom-5 right-5 z-[9999] no-print">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl font-bold text-xs sm:text-sm flex items-center gap-2.5 border-l-4 ${
              toast.type === 'error'
                ? 'bg-slate-900 text-white border-rose-500'
                : 'bg-slate-900 text-white border-sky-400'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle size={18} className="text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
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