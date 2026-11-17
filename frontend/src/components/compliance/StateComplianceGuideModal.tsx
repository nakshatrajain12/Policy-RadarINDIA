"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  X, 
  ExternalLink, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Scale, 
  MapPin, 
  Award,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { FounderProfile } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userProfile: FounderProfile;
}

const STATE_GUIDES: Record<string, {
  portalName: string;
  portalUrl: string;
  nodalAgency: string;
  keyBenefits: string[];
  mandatorySteps: string[];
}> = {
  "Karnataka": {
    portalName: "Startup Karnataka (K-Tech)",
    portalUrl: "https://startup.karnataka.gov.in/",
    nodalAgency: "Dept of Electronics, IT, Bt and S&T, Government of Karnataka",
    keyBenefits: [
      "Idea2PoC (ELEVATE 100) grant up to ₹50 Lakhs equity-free",
      "Special ELEVATE WomEN fund for women entrepreneurs",
      "Subsidized access to Karnataka Innovation Technology Society (KITS) incubation",
      "Patent fee reimbursement up to ₹2 Lakhs (Indian) and ₹10 Lakhs (International)"
    ],
    mandatorySteps: [
      "Incorporate company in Karnataka or register branch office",
      "Sign up on startup.karnataka.gov.in with company PAN and CIN",
      "Obtain Startup Karnataka Registration Number (SKRN)",
      "Submit proposal during open ELEVATE call window"
    ]
  },
  "Maharashtra": {
    portalName: "Maharashtra State Innovation Society (MSInS)",
    portalUrl: "https://www.msins.in/",
    nodalAgency: "Skill Development, Employment and Entrepreneurship Dept, Govt of Maharashtra",
    keyBenefits: [
      "Maharashtra Startup Week work orders up to ₹15 Lakhs from government departments",
      "100% patent filing reimbursement (up to ₹2 Lakhs domestic, ₹10 Lakhs global)",
      "Quality testing & ISO certification subsidies up to ₹2 Lakhs",
      "FinTech Regulatory Sandbox access for Mumbai/Pune fintech startups"
    ],
    mandatorySteps: [
      "Register entity in Maharashtra with state GSTIN",
      "Register on msins.in with DPIIT certificate",
      "Apply for Maharashtra Startup Registry certificate",
      "Enroll in annual Maharashtra Startup Week competition"
    ]
  },
  "Telangana": {
    portalName: "Startup Telangana / T-Hub",
    portalUrl: "https://t-hub.co/",
    nodalAgency: "Information Technology, E&C Dept, Government of Telangana",
    keyBenefits: [
      "T-Fund early-stage co-investment tickets up to ₹1 Crore",
      "WE-Hub specialized grants and mentorship for women-led startups",
      "TSIC rural innovator seed grants up to ₹5 Lakhs",
      "Telangana Mobility Valley (TMV) test track access for EV/battery ventures"
    ],
    mandatorySteps: [
      "Have operating office in Telangana",
      "Register on startup.telangana.gov.in",
      "Enroll in T-Hub Lab32 or WE-Hub accelerator programs"
    ]
  },
  "Tamil Nadu": {
    portalName: "StartupTN",
    portalUrl: "https://startuptn.in/",
    nodalAgency: "Tamil Nadu Startup and Innovation Mission (TANSIM)",
    keyBenefits: [
      "TANSEED seed grant up to ₹15 Lakhs equity-free in tranches",
      "Tamil Nadu SC/ST Startup Fund up to ₹3 Crore equity/debt",
      "Innovation Voucher Programme (IVP-A & IVP-B) up to ₹5 Lakhs",
      "Free access to StartupTN regional hubs across Chennai, Madurai, Coimbatore"
    ],
    mandatorySteps: [
      "Incorporate in Tamil Nadu with state GSTIN",
      "Register on startuptn.in with DPIIT certificate",
      "Apply for TANSEED funding cycle via online pitch submission"
    ]
  },
  "Kerala": {
    portalName: "Kerala Startup Mission (KSUM)",
    portalUrl: "https://startupmission.kerala.gov.in/",
    nodalAgency: "Electronics and IT Department, Government of Kerala",
    keyBenefits: [
      "Idea Grant up to ₹15 Lakhs for prototyping and MVP",
      "Low-interest soft loans up to ₹30 Lakhs for working capital",
      "100% patent filing cost reimbursement (up to ₹10 Lakhs)",
      "Subsidized international expo booths at GITEX, Slush, and Web Summit"
    ],
    mandatorySteps: [
      "Create founder account on startupmission.kerala.gov.in",
      "Obtain KSUM Unique ID (mandatory for all state subsidies)",
      "Submit application to KSUM grant committee"
    ]
  },
  "Delhi": {
    portalName: "Delhi Startup Policy Portal",
    portalUrl: "https://delhistartuppolicy.in/",
    nodalAgency: "Industries Department, Government of NCT of Delhi",
    keyBenefits: [
      "Collateral-free, interest-free seed capital loans up to ₹10 Lakhs (50% waiver on job creation)",
      "50% lease rental subsidy up to ₹50,000/month for 1 year in recognized incubators",
      "Patent and trademark filing fee reimbursements",
      "Financial assistance for employee health insurance premiums"
    ],
    mandatorySteps: [
      "Valid Delhi operational address and Delhi GSTIN",
      "Obtain DPIIT Recognition certificate",
      "Register on delhistartuppolicy.in portal"
    ]
  },
  "Uttar Pradesh": {
    portalName: "StartinUP",
    portalUrl: "https://startinup.up.gov.in/",
    nodalAgency: "IT & Electronics Department, Government of Uttar Pradesh",
    keyBenefits: [
      "Seed Capital financial assistance up to ₹7.5 Lakhs",
      "Monthly Sustenance Allowance of ₹17,500/month for 1 year (₹20,000 for women/SC/ST)",
      "CoE grant up to ₹1 Crore at IIT Kanpur / IIT BHU centers",
      "100% electricity duty exemption for 5 years"
    ],
    mandatorySteps: [
      "Register company in Uttar Pradesh",
      "Register on startinup.up.gov.in with DPIIT details",
      "Get incubated at any recognized UP incubator"
    ]
  },
  "Gujarat": {
    portalName: "Startup Gujarat / i-Hub",
    portalUrl: "https://startup.gujarat.gov.in/",
    nodalAgency: "Industries Commissionerate, Government of Gujarat",
    keyBenefits: [
      "Seed assistance up to ₹30 Lakhs for prototype & marketing",
      "Monthly sustenance allowance of ₹20,000/month (₹25,000 for women)",
      "Student Startup Policy (SSIP 2.0) PoC grants up to ₹2.5 Lakhs",
      "iCreate hardware and clean mobility prototyping facilities"
    ],
    mandatorySteps: [
      "Nodal institute approval in Gujarat",
      "Sign up on startup.gujarat.gov.in",
      "Submit technical proposal to state screening committee"
    ]
  },
  "Rajasthan": {
    portalName: "iStart Rajasthan",
    portalUrl: "https://istart.rajasthan.gov.in/",
    nodalAgency: "Department of Information Technology & Communication (DoITC)",
    keyBenefits: [
      "Viability grant up to ₹15 Lakhs based on QRate assessment",
      "Monthly sustenance allowance of ₹20,000/month (₹25,000 for women)",
      "Bhamashah Techno Fund matching investments up to ₹2.5 Crore",
      "Free plug-and-play workspace at Bhamashah Techno Hub Jaipur"
    ],
    mandatorySteps: [
      "Rajasthan domicile or registration",
      "Complete iStart QRate evaluation scorecard",
      "Achieve Bronze rating or above for automatic allowance disbursement"
    ]
  }
};

export function StateComplianceGuideModal({ isOpen, onClose, userProfile }: Props) {
  const [activeTab, setActiveTab] = useState<"dpiit" | "state" | "statutory">("dpiit");

  if (!isOpen) return null;

  const stateData = STATE_GUIDES[userProfile.state] || {
    portalName: `Startup ${userProfile.state} Portal`,
    portalUrl: "https://www.startupindia.gov.in/",
    nodalAgency: `State Innovation Mission / Industries Dept, Govt of ${userProfile.state}`,
    keyBenefits: [
      "Access to state seed capital and incubation infrastructure",
      "State-level procurement preferences and tender fee exemptions",
      "Reimbursement of patent filing fees and quality certifications",
      "Subsidized electricity and lease rentals in state IT parks"
    ],
    mandatorySteps: [
      `Register operational office with ${userProfile.state} address proof`,
      "Obtain DPIIT Recognition certificate from Startup India",
      `Register on the state single-window investor/startup portal`
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 dark:bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Startup Licenses & State Compliance Guide</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  Regulatory Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Official licensing roadmaps, DPIIT tax exemptions, and state-specific nodal registrations for {userProfile.state}.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6">
          <button
            onClick={() => setActiveTab("dpiit")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "dpiit" 
                ? "border-blue-500 text-blue-400" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            DPIIT Recognition & Tax Holidays
          </button>
          <button
            onClick={() => setActiveTab("state")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "state" 
                ? "border-blue-500 text-blue-400" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="w-4 h-4" />
            {userProfile.state} State Startup Mission
          </button>
          <button
            onClick={() => setActiveTab("statutory")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "statutory" 
                ? "border-blue-500 text-blue-400" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Essential Statutory Licenses
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs text-slate-300">
          
          {/* TAB 1: DPIIT Recognition */}
          {activeTab === "dpiit" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-950/20 space-y-2">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                  What is DPIIT Recognition?
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Issued by the Department for Promotion of Industry and Internal Trade (Ministry of Commerce and Industry). 
                  It is the sovereign legal verification that qualifies your company as an official Indian Startup under Gazette Notification G.S.R. 127(E).
                </p>
              </div>

              {/* Eligibility Criteria */}
              <div className="space-y-2">
                <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  Official Eligibility Criteria
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { label: "Company Age", desc: "Incorporated within the last 10 years" },
                    { label: "Entity Structure", desc: "Private Limited (Pvt Ltd), LLP, or Registered Partnership" },
                    { label: "Turnover Limit", desc: "Annual turnover has not exceeded ₹100 Crore in any financial year" },
                    { label: "Innovation Focus", desc: "Original innovative product, process, or scalable employment generation" }
                  ].map((crit, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {crit.label}
                      </div>
                      <div className="text-slate-400 mt-1">{crit.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Benefits */}
              <div className="space-y-2">
                <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  Statutory Incentives Unlocked
                </div>
                <div className="space-y-2">
                  {[
                    {
                      title: "Section 56(2)(viib) Exemption (Angel Tax Relief)",
                      desc: "Investments from accredited resident angel investors, family offices, and funds are exempt from tax above fair market value."
                    },
                    {
                      title: "Section 80-IAC Income Tax Holiday",
                      desc: "100% tax holiday on profits for 3 consecutive financial years out of the first 10 years (subject to Inter-Ministerial Board certification)."
                    },
                    {
                      title: "80% Rebate in Patent Fees & Fast-Track IPR (SIPP)",
                      desc: "80% rebate in patent application fees and 50% rebate on trademark filings, with government bearing facilitator advisory fees."
                    },
                    {
                      title: "Startup India Seed Fund Scheme (SISFS) Eligibility",
                      desc: "Unlocks non-dilutive prototype grants up to ₹20 Lakhs and convertible debentures up to ₹50 Lakhs via incubators."
                    },
                    {
                      title: "Exemption from Prior Experience in Government Procurement",
                      desc: "DPIIT startups are exempt from 'prior turnover' and 'prior experience' hurdles for public procurement tenders on GeM."
                    }
                  ].map((ben, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-white">{ben.title}</div>
                        <div className="text-slate-400 mt-0.5 leading-relaxed">{ben.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Registration Guide */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-3">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>How to Apply Online (48 Hours, 100% Free)</span>
                  <a 
                    href="https://www.startupindia.gov.in/content/sih/en/recognition-page.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    Startup India Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                  <li>Incorporate your company as a Private Limited Company or LLP via the MCA SPICe+ portal.</li>
                  <li>Log on to <strong>startupindia.gov.in</strong> and create a founder profile.</li>
                  <li>Click <strong>'Apply for DPIIT Recognition'</strong> and upload your Certificate of Incorporation (CIN) and PAN.</li>
                  <li>Provide a brief 300-word write-up explaining your product innovation, market problem, and potential for job creation.</li>
                  <li>Submit the form. Your digital recognition certificate with a unique DIPP number is issued within 48 to 72 hours.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: State-Specific Startup Guide */}
          {activeTab === "state" && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    {stateData.portalName}
                  </div>
                  <div className="text-slate-400 mt-0.5">Nodal Agency: {stateData.nodalAgency}</div>
                </div>
                <a
                  href={stateData.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 shrink-0"
                >
                  Visit Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* State Benefits */}
              <div className="space-y-2">
                <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  State-Specific Incentives for {userProfile.state} Startups
                </div>
                <div className="space-y-2">
                  {stateData.keyBenefits.map((ben, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-white font-medium">{ben}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* State Onboarding Checklist */}
              <div className="space-y-2">
                <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  State Nodal Registration Roadmap
                </div>
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
                  {stateData.mandatorySteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-slate-300 leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Statutory Licenses */}
          {activeTab === "statutory" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-slate-400">
                Core statutory registrations mandated by Indian commercial law prior to receiving institutional grants or commercial capital:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    name: "MCA Certificate of Incorporation (CIN)",
                    portal: "mca.gov.in (SPICe+)",
                    desc: "Establishes legal identity as a separate corporate entity. Mandatory for all central seed funds."
                  },
                  {
                    name: "Udyam / MSME Registration",
                    portal: "udyamregistration.gov.in",
                    desc: "Free self-declaration registration providing priority lending status and access to MSME Idea Hackathon grants."
                  },
                  {
                    name: "Goods and Services Tax (GSTIN)",
                    portal: "gst.gov.in",
                    desc: "Mandatory if annual aggregate turnover exceeds ₹20/40 Lakhs or for inter-state e-commerce supplies."
                  },
                  {
                    name: "Professional Tax (PT) & Shop Act",
                    portal: "State Commercial Tax Portals",
                    desc: "Required for establishing official operational business premises and hiring on-roll employees in the state."
                  },
                  {
                    name: "Intellectual Property / Provisional Patent",
                    portal: "ipindiaonline.gov.in",
                    desc: "Provisional patent specification (Form 1 & 2) secures 12-month global priority date at minimal cost."
                  },
                  {
                    name: "FSSAI / CDSCO Sector Clearances",
                    portal: "foscos.fssai.gov.in / cdsco.gov.in",
                    desc: "Mandatory regulatory licenses for Agri-food processing or clinical healthtech/medical device ventures."
                  }
                ].map((lic, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-white text-xs">{lic.name}</div>
                    <div className="text-blue-400 text-[10px] font-semibold">{lic.portal}</div>
                    <p className="text-slate-400 text-[11px] leading-relaxed pt-1">{lic.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/90">
          <div className="text-xs text-slate-400">
            Current Profile State: <strong className="text-white">{userProfile.state}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}

