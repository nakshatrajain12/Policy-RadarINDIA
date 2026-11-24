/**
 * Scheme Media Provider
 * Maps ministries, state jurisdictions, and sectors to official government logos,
 * state emblems, and high-quality pictorial imagery for all 193 schemes.
 */

export interface SchemeMedia {
  coverImage: string;
  logoUrl: string;
  badgeLabel: string;
  accentColor: string;
}

// Curated high-resolution thematic images (reliable CDN URLs)
const THEMATIC_COVERS: Record<string, string> = {
  agritech: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80", // Smart farming & crop sensor
  cleantech: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80", // Solar farm & renewable energy
  deeptech: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80", // Robotics & advanced electronics
  biotech: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80", // Biotechnology lab & pipette
  healthtech: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80", // Medical scanner & diagnostics
  hardware: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", // Microchips & semiconductor
  saas: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", // Data analytics dashboard
  msme: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80", // Advanced manufacturing & precision machining
  defense: "https://images.unsplash.com/photo-1517976487507-5b6533d44e7c?auto=format&fit=crop&w=800&q=80", // Aerospace & aerospace engineering
  spacetech: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // Satellite & Earth observation
  default: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" // Modern tech headquarters
};

// Official Government Organization & Ministry Badges / Logos (SVGs or official CDNs)
const MINISTRY_LOGOS: Record<string, { logo: string; label: string; color: string }> = {
  startup_india: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "Startup India / DPIIT",
    color: "#1e3a8a"
  },
  dpiit: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "DPIIT, Ministry of Commerce",
    color: "#1e40af"
  },
  birac: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "BIRAC / Dept of Biotechnology",
    color: "#047857"
  },
  meity: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "Ministry of Electronics & IT",
    color: "#0369a1"
  },
  dst: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "Department of Science & Tech",
    color: "#4338ca"
  },
  msme: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "Ministry of MSME",
    color: "#b45309"
  },
  mof: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "Ministry of Finance",
    color: "#15803d"
  },
  aim: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "Atal Innovation Mission (NITI Aayog)",
    color: "#c2410c"
  },
  sidbi: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "SIDBI Venture Capital",
    color: "#0f766e"
  },
  state_karnataka: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Seal_of_Karnataka.svg/200px-Seal_of_Karnataka.svg.png",
    label: "Govt. of Karnataka (KITS / ELEVATE)",
    color: "#dc2626"
  },
  state_maharashtra: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Maharashtra.svg/200px-Seal_of_Maharashtra.svg.png",
    label: "Govt. of Maharashtra (MSInS)",
    color: "#ea580c"
  },
  state_gujarat: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "Govt. of Gujarat (i-Hub / Industries)",
    color: "#d97706"
  },
  state_telangana: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "Govt. of Telangana (T-Hub / TSIC)",
    color: "#059669"
  },
  state_kerala: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "Govt. of Kerala (KSUM)",
    color: "#0284c7"
  },
  default_gov: {
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png",
    label: "Government of India",
    color: "#334155"
  }
};

/**
 * Returns complete pictorial metadata for any scheme record.
 */
export function getSchemeMedia(scheme: {
  scheme_name?: string;
  name?: string;
  ministry?: string;
  geographic_restriction?: string;
  sector_eligibility?: string | string[];
  category?: string;
}): SchemeMedia {
  const sName = (scheme.scheme_name || scheme.name || "").toLowerCase();
  const ministry = (scheme.ministry || "").toLowerCase();
  const geo = (scheme.geographic_restriction || "").toLowerCase();
  
  const sectorsRaw = scheme.sector_eligibility;
  const sectorsStr = Array.isArray(sectorsRaw) 
    ? sectorsRaw.join(" ").toLowerCase() 
    : String(sectorsRaw || "").toLowerCase();
  const categoryStr = String(scheme.category || "").toLowerCase();

  // 1. Determine Cover Picture based on domain/technology
  let coverImage = THEMATIC_COVERS.default;
  if (sName.includes("agri") || sectorsStr.includes("agri") || categoryStr.includes("agri")) {
    coverImage = THEMATIC_COVERS.agritech;
  } else if (sName.includes("clean") || sName.includes("solar") || sName.includes("energy") || sectorsStr.includes("clean") || sectorsStr.includes("renewable")) {
    coverImage = THEMATIC_COVERS.cleantech;
  } else if (sName.includes("bio") || ministry.includes("birac") || ministry.includes("biotechnology") || sectorsStr.includes("bio")) {
    coverImage = THEMATIC_COVERS.biotech;
  } else if (sName.includes("health") || sName.includes("medical") || sectorsStr.includes("health") || sectorsStr.includes("pharma")) {
    coverImage = THEMATIC_COVERS.healthtech;
  } else if (sName.includes("deep") || sName.includes("ai") || sName.includes("robotics") || sectorsStr.includes("deep") || sectorsStr.includes("artificial")) {
    coverImage = THEMATIC_COVERS.deeptech;
  } else if (sName.includes("hardware") || sName.includes("semiconductor") || sName.includes("chip") || sName.includes("electronic") || ministry.includes("meity")) {
    coverImage = THEMATIC_COVERS.hardware;
  } else if (sName.includes("space") || sName.includes("drone") || sName.includes("defense") || sName.includes("idex")) {
    coverImage = THEMATIC_COVERS.defense;
  } else if (sName.includes("msme") || sName.includes("zed") || sName.includes("pmegp") || ministry.includes("msme")) {
    coverImage = THEMATIC_COVERS.msme;
  } else if (sName.includes("software") || sName.includes("saas") || sName.includes("digital")) {
    coverImage = THEMATIC_COVERS.saas;
  }

  // 2. Determine Ministry / State Logo and Badge
  let badge = MINISTRY_LOGOS.default_gov;
  if (geo.includes("karnataka") || sName.includes("elevate") || sName.includes("karnataka")) {
    badge = MINISTRY_LOGOS.state_karnataka;
  } else if (geo.includes("maharashtra") || sName.includes("maharashtra") || sName.includes("msins")) {
    badge = MINISTRY_LOGOS.state_maharashtra;
  } else if (geo.includes("gujarat") || sName.includes("gujarat")) {
    badge = MINISTRY_LOGOS.state_gujarat;
  } else if (geo.includes("telangana") || sName.includes("telangana") || sName.includes("t-hub")) {
    badge = MINISTRY_LOGOS.state_telangana;
  } else if (geo.includes("kerala") || sName.includes("kerala") || sName.includes("ksum")) {
    badge = MINISTRY_LOGOS.state_kerala;
  } else if (ministry.includes("birac") || ministry.includes("biotechnology")) {
    badge = MINISTRY_LOGOS.birac;
  } else if (ministry.includes("meity") || ministry.includes("electronics")) {
    badge = MINISTRY_LOGOS.meity;
  } else if (ministry.includes("dst") || ministry.includes("science")) {
    badge = MINISTRY_LOGOS.dst;
  } else if (ministry.includes("msme")) {
    badge = MINISTRY_LOGOS.msme;
  } else if (ministry.includes("finance") || ministry.includes("financial services") || sName.includes("cgss")) {
    badge = MINISTRY_LOGOS.mof;
  } else if (ministry.includes("aim") || ministry.includes("niti") || ministry.includes("atal")) {
    badge = MINISTRY_LOGOS.aim;
  } else if (ministry.includes("sidbi")) {
    badge = MINISTRY_LOGOS.sidbi;
  } else if (ministry.includes("dpiit") || ministry.includes("startup india")) {
    badge = MINISTRY_LOGOS.dpiit;
  }

  return {
    coverImage,
    logoUrl: badge.logo,
    badgeLabel: badge.label,
    accentColor: badge.color
  };
}
