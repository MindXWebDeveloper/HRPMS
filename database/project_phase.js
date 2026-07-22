import { PROJECT_PHASES } from "../assets/js/common/storageKeys.js";

const DEFAULT_PROJECT_PHASES = [
  {
    id: "phase-001",
    projectId: "prj-001",
    phaseName: "Phan tich yeu cau",
    color: "purple",
    sortOrder: 1,
    createdAt: "2026-07-01T08:00:00",
    updatedAt: "2026-07-01T08:00:00",
  },
  {
    id: "phase-002",
    projectId: "prj-001",
    phaseName: "Thiet ke he thong",
    color: "blue",
    sortOrder: 2,
    createdAt: "2026-07-04T08:00:00",
    updatedAt: "2026-07-04T08:00:00",
  },
  {
    id: "phase-003",
    projectId: "prj-001",
    phaseName: "Phat trien",
    color: "indigo",
    sortOrder: 3,
    createdAt: "2026-07-07T08:00:00",
    updatedAt: "2026-07-07T08:00:00",
  },
  {
    id: "phase-004",
    projectId: "prj-002",
    phaseName: "Thiet ke mobile",
    color: "blue",
    sortOrder: 1,
    createdAt: "2026-07-02T08:00:00",
    updatedAt: "2026-07-02T08:00:00",
  },
];

function initProjectPhases() {
  const storedPhases = getAllProjectPhases();

  if (storedPhases.length === 0) {
    saveProjectPhases(DEFAULT_PROJECT_PHASES);
  }
}

function getAllProjectPhases() {
  try {
    const storedPhases = JSON.parse(localStorage.getItem(PROJECT_PHASES));

    return Array.isArray(storedPhases) ? storedPhases : [];
  } catch {
    return [];
  }
}

function saveProjectPhases(phases) {
  localStorage.setItem(PROJECT_PHASES, JSON.stringify(phases));
}

function findProjectPhasesByProjectId(projectId) {
  return getAllProjectPhases()
    .filter((phase) => phase.projectId === projectId)
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
}

function findProjectPhaseById(phaseId) {
  return getAllProjectPhases().find((phase) => phase.id === phaseId) || null;
}

function nextPhaseId(phases) {
  const maxNumber = phases.reduce((max, phase) => {
    const match = String(phase.id || "").match(/phase-(\d+)/);

    if (!match) {
      return max;
    }

    return Math.max(max, Number(match[1]));
  }, 0);

  return `phase-${String(maxNumber + 1).padStart(3, "0")}`;
}

function insertProjectPhase(phaseJson) {
  const phases = getAllProjectPhases();
  const now = new Date().toISOString();

  const projectPhases = findProjectPhasesByProjectId(phaseJson.projectId);
  const nextOrder = projectPhases.length + 1;

  const newPhase = {
    id: phaseJson.id || nextPhaseId(phases),
    projectId: phaseJson.projectId,
    phaseName: phaseJson.phaseName,
    color: phaseJson.color || "blue",
    sortOrder: Number(phaseJson.sortOrder || nextOrder),
    createdAt: phaseJson.createdAt || now,
    updatedAt: phaseJson.updatedAt || now,
  };

  phases.push(newPhase);
  saveProjectPhases(phases);

  return newPhase;
}

export {
  DEFAULT_PROJECT_PHASES,
  initProjectPhases,
  getAllProjectPhases,
  saveProjectPhases,
  findProjectPhaseById,
  findProjectPhasesByProjectId,
  insertProjectPhase,
};
