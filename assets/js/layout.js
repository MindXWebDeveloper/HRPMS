document.addEventListener("DOMContentLoaded", async () => {
  const sidebarHost = document.querySelector("[data-layout='sidebar']");

  if (!sidebarHost) {
    return;
  }

  const basePath = document.body.dataset.basePath || "";

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
    setActiveSidebarItem(sidebarHost);

    if (typeof window.initFlowbite === "function") {
      window.initFlowbite();
    }
  } catch (error) {
    console.error(error);
    sidebarHost.innerHTML =
      '<p class="p-4 text-sm text-red-600">Kh&#244;ng t&#7843;i &#273;&#432;&#7907;c sidebar.</p>';
  }
});

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
