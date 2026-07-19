import { getCurrentUser } from "../services/authService.js";

function normalizeRole(role) {
  return (role || "").trim().toUpperCase();
}

function getAuthorContext(user = getCurrentUser()) {
  return {
    user,
    role: normalizeRole(user?.role),
  };
}

function canAccess(allowedRoles = [], authorContext = getAuthorContext()) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return true;
  }

  const role = authorContext.role;
  const adminAliasRoles = ["HR_MANAGER"];
  const isAdminAliasAllowed = allowedRoles.includes("ADMIN") && adminAliasRoles.includes(role);

  return (
    allowedRoles.includes("ALL") ||
    allowedRoles.includes(role) ||
    isAdminAliasAllowed
  );
}

function setDisabledState(root, isDisabled) {
  if (typeof root.disabled === "boolean") {
    root.disabled = isDisabled;
  }

  root
    .querySelectorAll("button, input, select, textarea")
    .forEach((field) => {
      field.disabled = isDisabled;
    });
}

function applyRoleGuards(root = document, authorContext = getAuthorContext()) {
  if (!root) {
    return;
  }

  root.querySelectorAll("[data-role]").forEach((node) => {
    const allowedRoles = (node.dataset.role || "all")
      .split(",")
      .map((value) => normalizeRole(value));
    const mode = (node.dataset.roleMode || "hide").trim().toLowerCase();
    const allowed = canAccess(allowedRoles, authorContext);

    if (mode === "disable") {
      node.style.display = "";
      node.classList.toggle("pointer-events-none", !allowed);
      node.classList.toggle("opacity-50", !allowed);
      node.setAttribute("aria-disabled", String(!allowed));
      setDisabledState(node, !allowed);
      return;
    }

    node.style.display = allowed ? "" : "none";
  });
}

export { normalizeRole, getAuthorContext, canAccess, applyRoleGuards };
