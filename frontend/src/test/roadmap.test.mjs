import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read seed schemes directly
const seedPath = path.resolve(__dirname, "../data/schemes_seed.json");
const seedSchemes = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

// Import compiled or transpile-compatible logic
import { generatePersonalizedRoadmap, formatInrCapital } from "../lib/roadmapEngine.js";

// Test Persona 1: Student / Early Stage AgriTech in Karnataka
const persona1 = {
  startupName: "KisanAI Soil Health",
  sector: "AgriTech",
  stage: "Idea",
  state: "Karnataka",
  primaryGoal: "Idea Validation / Prototype",
  turnoverBand: "< ₹10 Lakhs (Pre-revenue)",
  documentsHeld: ["aadhaar_pan", "pitch_deck"]
};

// Test Persona 2: Woman-Led DeepTech AI in Maharashtra
const persona2 = {
  startupName: "NeuroSense Diagnostics",
  sector: "DeepTech & Hardware",
  stage: "Prototype/MVP",
  state: "Maharashtra",
  primaryGoal: "R&D Grant / Product MVP",
  turnoverBand: "₹10 Lakhs - ₹1 Crore",
  documentsHeld: ["aadhaar_pan", "incorporation", "dpiit_cert", "patent_ipr"],
  womenLed: true
};

// Test Persona 3: Rural CleanTech / Solar MSME in Gujarat
const persona3 = {
  startupName: "SuryaShakti Green Fab",
  sector: "CleanTech & EV",
  stage: "Early Revenue",
  state: "Gujarat",
  primaryGoal: "Scale-up Debt / Credit Guarantee",
  turnoverBand: "₹1 Crore - ₹5 Crore",
  documentsHeld: ["aadhaar_pan", "incorporation", "dpiit_cert", "udyam_msme", "gstin"]
};

test("formatInrCapital formats correctly for Lakhs and Crores", () => {
  assert.equal(formatInrCapital(1000000), "₹10 Lakhs");
  assert.equal(formatInrCapital(5000000), "₹50 Lakhs");
  assert.equal(formatInrCapital(10000000), "₹1 Crore");
  assert.equal(formatInrCapital(100000000), "₹10 Crore");
});

test("Same profile produces identical deterministic roadmap output", () => {
  const rm1 = generatePersonalizedRoadmap(persona1, seedSchemes);
  const rm2 = generatePersonalizedRoadmap(persona1, seedSchemes);

  assert.equal(rm1.steps.length, rm2.steps.length);
  assert.equal(rm1.steps[0].id, rm2.steps[0].id);
  assert.equal(rm1.steps[0].title, rm2.steps[0].title);
  assert.equal(rm1.stats.nowCount, rm2.stats.nowCount);
});

test("Different profiles produce visibly different roadmaps", () => {
  const rmAgri = generatePersonalizedRoadmap(persona1, seedSchemes);
  const rmDeep = generatePersonalizedRoadmap(persona2, seedSchemes);
  const rmClean = generatePersonalizedRoadmap(persona3, seedSchemes);

  // Persona 1 lacks DPIIT, so its first NOW step MUST be DPIIT Accreditation
  assert.equal(rmAgri.steps[0].id, "step-dpiit-foundation");
  assert.equal(rmAgri.steps[0].title, "Apply for DPIIT Startup Recognition");

  // Persona 2 already has DPIIT, so it should NOT have step-dpiit-foundation
  const hasDpiitStepInDeep = rmDeep.steps.some(s => s.id === "step-dpiit-foundation");
  assert.equal(hasDpiitStepInDeep, false, "Persona with DPIIT already held should not be asked to apply for DPIIT");

  // Persona 3 is seeking Debt / Guarantee, so its Later phase must contain Credit Guarantee
  const hasCreditGuarantee = rmClean.steps.some(s => s.title.toLowerCase().includes("credit guarantee") || s.title.toLowerCase().includes("stand-up"));
  assert.equal(hasCreditGuarantee, true, "Persona seeking Debt must have Credit Guarantee in roadmap");

  // Titles between Persona 1 and Persona 2 must be different
  const titlesAgri = rmAgri.steps.map(s => s.title);
  const titlesDeep = rmDeep.steps.map(s => s.title);
  assert.notDeepEqual(titlesAgri, titlesDeep, "AgriTech and DeepTech personas must produce different roadmap steps");
});

test("Every step has action title, whyItMatters, documentsRequired, and portal link", () => {
  const roadmap = generatePersonalizedRoadmap(persona1, seedSchemes);
  assert.ok(roadmap.steps.length >= 3, "Roadmap should have at least 3 steps");

  for (const step of roadmap.steps) {
    assert.ok(step.title.length > 5, "Step must have a non-empty action title");
    assert.ok(step.whyItMatters.length > 10, "Step must explain why it matters");
    assert.ok(step.documentsRequired.length >= 1, "Step must list required documents");
    assert.ok(step.actionUrl.startsWith("http"), "Step must have a valid URL");
    assert.ok(["now", "next", "later"].includes(step.phase), "Step phase must be now, next, or later");
  }
});

test("Handles edge cases: empty profile or missing inputs gracefully", () => {
  const emptyRoadmap = generatePersonalizedRoadmap({
    startupName: "",
    sector: "",
    stage: "",
    state: "",
    primaryGoal: "Idea Validation / Prototype",
    turnoverBand: "< ₹10 Lakhs (Pre-revenue)",
    documentsHeld: []
  }, seedSchemes);

  assert.ok(emptyRoadmap.steps.length > 0, "Edge case should still produce fallback actionable steps");
  assert.ok(emptyRoadmap.nextBestAction !== null, "Must identify next best action");
});
