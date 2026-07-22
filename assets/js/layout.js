import { getCurrentUser, clearCurrentUser } from "./services/authService.js";
import { getAuthorContext, applyRoleGuards } from "./common/author.js";

document.addEventListener("DOMContentLoaded", async () => {
  const isGitHubPages = location.hostname.endsWith("github.io");
  const basePath = isGitHubPages ? document.body.dataset.basePath +"/HRPMS" : document.body.dataset.basePath;
  //const basePath = document.body.dataset.basePath || "";
  const currentUser = getCurrentUser();

  if (!ensureAuthenticated(basePath, currentUser)) {
    return;
  }

  if (!ensureMenuAuthorization(basePath, currentUser)) {
    return;
  }

  const authorContext = getAuthorContext(currentUser);
  const sidebarHost = document.querySelector("[data-layout='sidebar']");
  applyRoleGuards(document, authorContext);

  if (!sidebarHost) {
    return;
  }

  try {
    const response = await fetch(`${basePath}pages/components/sidebar.html`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Cannot load sidebar: ${response.status}`);
    }

    const sidebarHtml = await response.text();
    const sidebarDocument = new DOMParser().parseFromString(
      sidebarHtml,
      "text/html",
    );
    const sidebarTemplate = sidebarDocument.querySelector("#sidebar-template");

    sidebarHost.innerHTML = sidebarTemplate
      ? sidebarTemplate.innerHTML
      : sidebarHtml;

    resolveSidebarPaths(sidebarHost, basePath);
    applyRoleGuards(sidebarHost, authorContext);
    applyRoleGuards(document, authorContext); // cho toàn trang
    setActiveSidebarItem(sidebarHost);

    if (typeof window.initFlowbite === "function") {
      window.initFlowbite();
    }
  } catch (error) {
    console.error(error);
    sidebarHost.innerHTML =
      '<p class="p-4 text-sm text-red-600">Kh&#244;ng t&#7843;i &#273;&#432;&#7907;c sidebar.</p>';
  }

  const btnLogout = document.getElementById("btnLogout");
  const fullName = document.getElementById("fullName");

  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      clearCurrentUser();
      window.location.href = `${basePath}index.html`;
    });
  }

  if (fullName) {
    fullName.innerText = getCurrentUser()?.fullName || "Người dùng";
  }
  
});

document.addEventListener("click", () => {});

function ensureAuthenticated(basePath, currentUser) {
  if (currentUser) {
    return true;
  }

  const signinPath = `${basePath}index.html`;
  showAlertOnBlankPageThenRedirect("Vui lòng đăng nhập.", signinPath);

  return false;
}

function ensureMenuAuthorization(basePath, currentUser) {
  const role = String(currentUser?.role || "").trim().toLowerCase();

  if (role !== "project_manager") {
    return true;
  }

  const currentPath = normalizePath(window.location.pathname);
  const restrictedPrefixes = [
    "pages/employee-management/",
    "pages/accountregister/",
    "pages/education-management/",
    "pages/training-management/",
  ];
  const restrictedExactPaths = [
    "pages/accountedit/AccountEdit.html",
  ];

  const blockedByPrefix = restrictedPrefixes.some((prefix) => currentPath.startsWith(prefix));
  const blockedByExactPath = restrictedExactPaths.some((path) => currentPath.endsWith(path));

  if (!blockedByPrefix && !blockedByExactPath) {
    return true;
  }

  const dashboardPath = `${basePath}pages/accountdashboard/accountdashboard.html`;
  showAlertOnBlankPageThenRedirect("Bạn không có quyền vào menu này.", dashboardPath);

  return false;
}

function showAlertOnBlankPageThenRedirect(message, redirectPath) {
  renderBlankPage();

  // Wait for paint so the native alert appears over a blank page.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      alert(message);
      window.location.replace(redirectPath);
    });
  });
}

function renderBlankPage() {
  const body = document.body;
  const html = document.documentElement;

  if (body) {
    body.innerHTML = "";
    body.style.background = "#ffffff";
    body.style.margin = "0";
    body.style.minHeight = "100vh";
  }

  if (html) {
    html.style.background = "#ffffff";
  }
}

function resolveSidebarPaths(root, basePath) {
  root.querySelectorAll("[data-href]").forEach((link) => {
    link.href = `${basePath}${link.dataset.href}`;
  });

  root.querySelectorAll("[data-src]").forEach((image) => {
    image.src = `${basePath}${image.dataset.src}`;
  });
}

function setActiveSidebarItem(root) {
  const currentPath = normalizePath(window.location.pathname);
  const activeClasses = ["bg-[#1558C7]", "text-white"];

  root.querySelectorAll("[data-nav-id]").forEach((link) => {
    const linkPath = normalizePath(new URL(link.href, window.location.href).pathname);

    if (currentPath.endsWith(linkPath) || linkPath.endsWith(currentPath)) {
      link.classList.add(...activeClasses);

      const submenu = link.closest("ul[id^='dropdown-']");
      if (submenu) {
        submenu.classList.remove("hidden");
      }
    }
  });
}

function normalizePath(path) {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

