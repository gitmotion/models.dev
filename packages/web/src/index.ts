const modal = document.getElementById("modal") as HTMLDialogElement;
const modalClose = document.getElementById("close")!;
const help = document.getElementById("help")!;
const search = document.getElementById("search")! as HTMLInputElement;

import { columns } from "./table-schema.js";
import type { ColumnKey } from "./table-schema.js";

type ProvidersJson = Record<string, {
  name: string;
  models: Record<string, {
    name: string;
    family?: string;
    status?: string;
    tool_call: boolean;
    reasoning: boolean;
    modalities: { input: string[]; output: string[] };
    cost?: {
      input?: number;
      output?: number;
      reasoning?: number;
      cache_read?: number;
      cache_write?: number;
      input_audio?: number;
      output_audio?: number;
    };
    limit: { context: number; input?: number; output: number };
    structured_output?: boolean;
    temperature?: boolean;
    open_weights: boolean;
    knowledge?: string;
    release_date: string;
    last_updated: string;
  }>;
}>;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderCost(cost?: number): string {
  return cost === undefined ? "-" : `$${cost.toFixed(2)}`;
}

function modalityIcon(modality: string): string {
  switch (modality) {
    case "text":
      return `<span class="modality-icon" data-tooltip="Text"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4,7 4,4 20,4 20,7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg></span>`;
    case "image":
      return `<span class="modality-icon" data-tooltip="Image"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg></span>`;
    case "audio":
      return `<span class="modality-icon" data-tooltip="Audio"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="m19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg></span>`;
    case "video":
      return `<span class="modality-icon" data-tooltip="Video"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"></path><rect width="14" height="12" x="2" y="6" rx="2" ry="2"></rect></svg></span>`;
    case "pdf":
      return `<span class="modality-icon" data-tooltip="PDF"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14,2 14,8 20,8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10,9 9,9 8,9"></polyline></svg></span>`;
    default:
      return "";
  }
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

type RowCtx = {
  providerId: string;
  providerName: string;
  modelId: string;
  modelName: string;
  family: string;
  toolCall: string;
  reasoning: string;
  inputMods: string[];
  outputMods: string[];
  contextLimit: string;
  inputLimit: string;
  outputLimit: string;
  structuredOutput: string;
  temperature: string;
  weights: string;
  knowledge: string;
  releaseDate: string;
  lastUpdated: string;
  costs: {
    input: string;
    output: string;
    reasoning: string;
    cacheRead: string;
    cacheWrite: string;
    inputAudio: string;
    outputAudio: string;
  };
};

function cellHtml(key: ColumnKey, ctx: RowCtx): string {
  switch (key) {
    case "provider":
      return (
        `<div class="provider-cell">` +
        `<span class="provider-logo" data-provider-id="${escapeHtml(ctx.providerId)}"></span>` +
        `<span>${escapeHtml(ctx.providerName)}</span>` +
        `</div>`
      );
    case "model":
      return escapeHtml(ctx.modelName);
    case "family":
      return escapeHtml(ctx.family);
    case "providerId":
      return escapeHtml(ctx.providerId);
    case "modelId":
      return (
        `<div class="model-id-cell">` +
        `<span class="model-id-text">${escapeHtml(ctx.modelId)}</span>` +
        `<button class="copy-button" onclick="copyModelId(this, ${escapeHtml(JSON.stringify(ctx.modelId))})">` +
        `<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="m4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>` +
        `<svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><polyline points="20,6 9,17 4,12" /></svg>` +
        `</button>` +
        `</div>`
      );
    case "toolCall":
      return ctx.toolCall;
    case "reasoning":
      return ctx.reasoning;
    case "modalitiesInput":
      return `<div class="modalities">${ctx.inputMods.map(modalityIcon).join("")}</div>`;
    case "modalitiesOutput":
      return `<div class="modalities">${ctx.outputMods.map(modalityIcon).join("")}</div>`;
    case "costInput":
      return ctx.costs.input;
    case "costOutput":
      return ctx.costs.output;
    case "costReasoning":
      return ctx.costs.reasoning;
    case "costCacheRead":
      return ctx.costs.cacheRead;
    case "costCacheWrite":
      return ctx.costs.cacheWrite;
    case "costInputAudio":
      return ctx.costs.inputAudio;
    case "costOutputAudio":
      return ctx.costs.outputAudio;
    case "limitContext":
      return ctx.contextLimit;
    case "limitInput":
      return ctx.inputLimit;
    case "limitOutput":
      return ctx.outputLimit;
    case "structuredOutput":
      return ctx.structuredOutput;
    case "temperature":
      return ctx.temperature;
    case "weights":
      return ctx.weights;
    case "knowledge":
      return escapeHtml(ctx.knowledge);
    case "releaseDate":
      return escapeHtml(ctx.releaseDate);
    case "lastUpdated":
      return escapeHtml(ctx.lastUpdated);
  }
}

function searchValue(key: ColumnKey, ctx: RowCtx): string {
  switch (key) {
    case "provider":
      return ctx.providerName;
    case "model":
      return ctx.modelName;
    case "family":
      return ctx.family;
    case "providerId":
      return ctx.providerId;
    case "modelId":
      return ctx.modelId;
    case "toolCall":
      return ctx.toolCall;
    case "reasoning":
      return ctx.reasoning;
    case "modalitiesInput":
      return ctx.inputMods.join(" ");
    case "modalitiesOutput":
      return ctx.outputMods.join(" ");
    case "costInput":
      return ctx.costs.input;
    case "costOutput":
      return ctx.costs.output;
    case "costReasoning":
      return ctx.costs.reasoning;
    case "costCacheRead":
      return ctx.costs.cacheRead;
    case "costCacheWrite":
      return ctx.costs.cacheWrite;
    case "costInputAudio":
      return ctx.costs.inputAudio;
    case "costOutputAudio":
      return ctx.costs.outputAudio;
    case "limitContext":
      return ctx.contextLimit;
    case "limitInput":
      return ctx.inputLimit;
    case "limitOutput":
      return ctx.outputLimit;
    case "structuredOutput":
      return ctx.structuredOutput;
    case "temperature":
      return ctx.temperature;
    case "weights":
      return ctx.weights;
    case "knowledge":
      return ctx.knowledge;
    case "releaseDate":
      return ctx.releaseDate;
    case "lastUpdated":
      return ctx.lastUpdated;
  }
}

const providerLogoCache = new Map<string, string>();

async function hydrateProviderLogos(root: ParentNode = document) {
  const targets = Array.from(
    root.querySelectorAll<HTMLElement>(".provider-logo[data-provider-id]")
  );

  const missing = new Set<string>();
  for (const el of targets) {
    const id = el.dataset.providerId;
    if (!id) continue;
    if (!providerLogoCache.has(id)) missing.add(id);
  }

  await Promise.all(
    Array.from(missing).map(async (providerId) => {
      try {
        const res = await fetch(`/logos/${encodeURIComponent(providerId)}.svg`, {
          headers: { Accept: "image/svg+xml" },
        });
        if (!res.ok) throw new Error(`Failed to fetch logo for ${providerId}`);
        const svg = await res.text();
        providerLogoCache.set(providerId, svg);
      } catch {
        providerLogoCache.set(providerId, "");
      }
    })
  );

  for (const el of targets) {
    if (el.innerHTML) continue;
    const id = el.dataset.providerId;
    if (!id) continue;
    const svg = providerLogoCache.get(id) ?? "";
    if (svg) el.innerHTML = svg;
  }
}

async function populateTableFromApi() {
  const tbody = document.getElementById("models-tbody") as HTMLTableSectionElement | null;
  if (!tbody) return;

  const theadThCount = document.querySelectorAll("table thead th").length;
  tbody.innerHTML = `<tr class="loading-row"><td colspan="${theadThCount}">Loading models…</td></tr>`;

  let data: ProvidersJson;
  try {
    const res = await fetch("/api.json", { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Failed to fetch /api.json (${res.status})`);
    data = (await res.json()) as ProvidersJson;
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr class="loading-row"><td colspan="${theadThCount}">Failed to load models.</td></tr>`;
    return;
  }

  const rows: string[] = [];
  const providersSorted = Object.entries(data).sort(([, a], [, b]) => a.name.localeCompare(b.name));
  for (const [providerId, provider] of providersSorted) {
    const modelsSorted = Object.entries(provider.models)
      .filter(([, model]) => model.status !== "alpha")
      .sort(([, a], [, b]) => a.name.localeCompare(b.name));

    for (const [modelId, model] of modelsSorted) {
      const providerName = provider.name;
      const modelName = model.name;
      const family = model.family ?? "-";
      const toolCall = model.tool_call ? "Yes" : "No";
      const reasoning = model.reasoning ? "Yes" : "No";
      const inputMods = model.modalities?.input ?? [];
      const outputMods = model.modalities?.output ?? [];
      const contextLimit = (model.limit?.context ?? 0).toLocaleString();
      const inputLimit = model.limit?.input?.toLocaleString() ?? "-";
      const outputLimit = (model.limit?.output ?? 0).toLocaleString();
      const structuredOutput =
        model.structured_output === undefined ? "-" : model.structured_output ? "Yes" : "No";
      const temperature = model.temperature ? "Yes" : "No";
      const weights = model.open_weights ? "Open" : "Closed";
      const knowledge = model.knowledge ? model.knowledge.substring(0, 7) : "-";
      const releaseDate = model.release_date;
      const lastUpdated = model.last_updated;

      const costs = {
        input: renderCost(model.cost?.input),
        output: renderCost(model.cost?.output),
        reasoning: renderCost(model.cost?.reasoning),
        cacheRead: renderCost(model.cost?.cache_read),
        cacheWrite: renderCost(model.cost?.cache_write),
        inputAudio: renderCost(model.cost?.input_audio),
        outputAudio: renderCost(model.cost?.output_audio),
      };

      const ctx: RowCtx = {
        providerId,
        providerName,
        modelId,
        modelName,
        family,
        toolCall,
        reasoning,
        inputMods,
        outputMods,
        contextLimit,
        inputLimit,
        outputLimit,
        structuredOutput,
        temperature,
        weights,
        knowledge,
        releaseDate,
        lastUpdated,
        costs,
      };

      const searchable = columns
        .map((c) => searchValue(c.key, ctx))
        .join(" | ")
        .toLowerCase();

      const rowHtml =
        `<tr data-search="${escapeHtml(searchable)}">` +
        columns.map((c) => `<td>${cellHtml(c.key, ctx)}</td>`).join("") +
        `</tr>`;

      rows.push(rowHtml);
    }
  }

  tbody.innerHTML = "";
  const chunkSize = 150;
  for (let i = 0; i < rows.length; i += chunkSize) {
    tbody.insertAdjacentHTML("beforeend", rows.slice(i, i + chunkSize).join(""));
    await nextFrame();
  }

  await hydrateProviderLogos(tbody);
}

/////////////////////////
// URL State Management
/////////////////////////
function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

function updateQueryParams(updates: Record<string, string | null>) {
  const params = getQueryParams();
  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
  }
  const newPath = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;
  window.history.pushState({}, "", newPath);
}

function getColumnNameForURL(headerEl: Element): string {
  const text = headerEl.textContent?.trim().toLowerCase() || "";
  return text.replace(/↑|↓/g, "").trim().split(/\s+/).slice(0, 2).join("-");
}

function getColumnIndexByUrlName(name: string): number {
  const headers = document.querySelectorAll("th.sortable");
  return Array.from(headers).findIndex(
    (header) => getColumnNameForURL(header) === name
  );
}

/////////////////////////
// Handle "How to use"
/////////////////////////
let y = 0;

help.addEventListener("click", () => {
  y = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = `-${y}px`;
  modal.showModal();
});

function closeDialog() {
  modal.close();
  document.body.style.position = "";
  document.body.style.top = "";
  window.scrollTo(0, y);
}

modalClose.addEventListener("click", closeDialog);
modal.addEventListener("cancel", closeDialog);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeDialog();
});

////////////////////
// Handle Sorting
////////////////////
let currentSort = { column: -1, direction: "asc" };

function sortTable(column: number, direction: "asc" | "desc") {
  const header = document.querySelectorAll("th.sortable")[column];
  const columnType = header.getAttribute("data-type");
  if (!columnType) return;

  // update state
  currentSort = { column, direction };
  updateQueryParams({
    sort: getColumnNameForURL(header),
    order: direction,
  });

  // sort rows
  const tbody = document.querySelector("table tbody")!;
  const rows = Array.from(
    tbody.querySelectorAll("tr")
  ) as HTMLTableRowElement[];
  rows.sort((a, b) => {
    const aValue = getCellValue(a.cells[column], columnType);
    const bValue = getCellValue(b.cells[column], columnType);

    // Handle undefined values - always sort to bottom
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    let comparison = 0;
    if (columnType === "number" || columnType === "modalities") {
      comparison = (aValue as number) - (bValue as number);
    } else if (columnType === "boolean") {
      comparison = (aValue as string).localeCompare(bValue as string);
    } else {
      comparison = (aValue as string).localeCompare(bValue as string);
    }

    return direction === "asc" ? comparison : -comparison;
  });
  rows.forEach((row) => tbody.appendChild(row));

  // update sort indicators
  const headers = document.querySelectorAll("th.sortable");
  headers.forEach((header, i) => {
    const indicator = header.querySelector(".sort-indicator")!;

    if (i === column) {
      indicator.textContent = direction === "asc" ? "↑" : "↓";
    } else {
      indicator.textContent = "";
    }
  });
}

function getCellValue(
  cell: HTMLTableCellElement,
  type: string
): string | number | undefined {
  if (type === "modalities")
    return cell.querySelectorAll(".modality-icon").length;

  const text = cell.textContent?.trim() || "";
  if (text === "-") return;
  if (type === "number") return parseFloat(text.replace(/[$,]/g, "")) || 0;
  return text;
}

document.querySelectorAll("th.sortable").forEach((header) => {
  header.addEventListener("click", () => {
    const column = Array.from(header.parentElement!.children).indexOf(header);
    const direction =
      currentSort.column === column && currentSort.direction === "asc"
        ? "desc"
        : "asc";
    sortTable(column, direction);
  });
});

///////////////////
// Handle Search
///////////////////
const SEARCH_DEBOUNCE_MS = 200;
let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined;

function filterTable(value: string) {
  const lowerCaseValues = value.toLowerCase().split(",").filter(str => str.trim() !== "");
  const rows = document.querySelectorAll(
    "table tbody tr"
  ) as NodeListOf<HTMLTableRowElement>;

  rows.forEach((row) => {
    const haystack = (row.getAttribute("data-search") ?? row.textContent ?? "").toLowerCase();
    const isVisible = lowerCaseValues.length === 0 ||
     lowerCaseValues.some((lowerCaseValue) => haystack.includes(lowerCaseValue));
    row.style.display = isVisible ? "" : "none";
  });

  updateQueryParams({ search: value || null });
}

function scheduleFilterTable() {
  if (searchDebounceTimer !== undefined) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    filterTable(search.value);
  }, SEARCH_DEBOUNCE_MS);
}

search.addEventListener("input", scheduleFilterTable);

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    search.focus();
  }
});

search.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    search.value = "";
    if (searchDebounceTimer !== undefined) clearTimeout(searchDebounceTimer);
    filterTable("");
  }
});

///////////////////////////////////
// Handle Copy model ID function
///////////////////////////////////
(window as any).copyModelId = async (
  button: HTMLButtonElement,
  modelId: string
) => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(modelId);

      // Switch to check icon
      const copyIcon = button.querySelector(".copy-icon") as HTMLElement;
      const checkIcon = button.querySelector(".check-icon") as HTMLElement;

      copyIcon.style.display = "none";
      checkIcon.style.display = "block";

      // Switch back after 1 second
      setTimeout(() => {
        copyIcon.style.display = "block";
        checkIcon.style.display = "none";
      }, 1000);
    }
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
};

///////////////////////////////////
// Initialize State from URL
///////////////////////////////////
function initializeFromURL() {
  const params = getQueryParams();

  (() => {
    const searchQuery = params.get("search");
    if (!searchQuery) return;
    search.value = searchQuery;
    filterTable(searchQuery);
  })();

  (() => {
    const columnName = params.get("sort");
    if (!columnName) return;

    const columnIndex = getColumnIndexByUrlName(columnName);
    if (columnIndex === -1) return;

    const direction = (params.get("order") as "asc" | "desc") || "asc";
    sortTable(columnIndex, direction);
  })();
}

document.addEventListener("DOMContentLoaded", async () => {
  await populateTableFromApi();
  initializeFromURL();
});
window.addEventListener("popstate", initializeFromURL);
