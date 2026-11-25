
const API_URL = "/api/gundams";

const limit = 10;

let currentPage = 1;
let totalPages = 1;

let allGundams = [];
let filteredGundams = [];

const container = document.getElementById("gundam-container");
const searchInput = document.getElementById("search");

// Decode URL-encoded Gundam names
function decodeName(value) {
    try {
        return decodeURIComponent(value);
    } catch (error) {
        return value;
    }
}

// Prevent HTML injection
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Fetch all Gundams from the API
async function fetchAllGundams() {
    container.innerHTML = `
        <p class="col-span-full text-center text-gray-500 py-10">
            Loading Gundam collection...
        </p>
    `;

    try {
        // Fetch the first page
        const firstResponse = await fetch(
            `${API_URL}?page=1&limit=${limit}`
        );

        if (!firstResponse.ok) {
            throw new Error("Failed to fetch Gundam data");
        }

        const firstData = await firstResponse.json();

        allGundams = [...firstData.results];

        const pages = firstData.info.pages;

        // Fetch remaining pages sequentially
        for (let page = 2; page <= pages; page++) {
            container.innerHTML = `
                <p class="col-span-full text-center text-gray-500 py-10">
                    Loading Gundams...
                    ${page} of ${pages} pages
                </p>
            `;

            const response = await fetch(
                `${API_URL}?page=${page}&limit=${limit}`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch page ${page}`);
            }

            const data = await response.json();

            allGundams.push(...data.results);
        }

        // Initialize collection
        filteredGundams = [...allGundams];

        updatePagination();
        displayGundams(getCurrentPageGundams());

        console.log(`Loaded ${allGundams.length} Gundams`);

    } catch (error) {
        console.error(error);

        container.innerHTML = `
            <p class="col-span-full text-center text-red-500 py-10">
                Failed to load Gundam collection.
                Please refresh the page.
            </p>
        `;
    }
}

// Get Gundams for the current page
function getCurrentPageGundams() {
    const start = (currentPage - 1) * limit;

    return filteredGundams.slice(start, start + limit);
}


// Display Gundam cards
function displayGundams(data) {
    if (data.length === 0) {
        container.innerHTML = `
            <p class="col-span-full text-center text-slate-400 py-10">
                No Gundams found.
            </p>
        `;
        return;
    }

    container.innerHTML = data.map(gundam => {
        const name = decodeName(gundam.name);
        const pilot = gundam.pilots || "Unknown pilot";

        return `
            <article
                onclick="showGundamDetails('${gundam.id}')"
                class="
                    bg-[#172B4D] rounded-xl overflow-hidden
                    border border-slate-700
                    shadow-lg hover:shadow-blue-900/40
                    hover:border-[#2563EB]
                    hover:-translate-y-1
                    transition-all duration-300
                    flex flex-col cursor-pointer
                    group
                "
            >

                <div class="
                    bg-[#E8EDF2] h-64
                    flex items-center justify-center p-5
                    overflow-hidden
                ">

                    ${
                        gundam.imgUrl
                        ? `
                            <img
                                src="${escapeHTML(gundam.imgUrl)}"
                                alt="${escapeHTML(name)}"
                                class="
                                    w-full h-full object-contain
                                    group-hover:scale-105
                                    transition-transform duration-300
                                "
                                loading="lazy"
                                onerror="this.style.display='none'"
                            >
                        `
                        : `
                            <p class="text-gray-500 text-sm">
                                No image available
                            </p>
                        `
                    }

                </div>

                <div class="p-5 flex flex-col flex-1">

                    <p class="
                        text-[#F4C542] text-xs
                        font-semibold tracking-widest mb-2
                    ">
                        MOBILE SUIT
                    </p>

                    <h3 class="
                        text-lg font-bold text-white
                        leading-snug min-h-14 line-clamp-2
                    ">
                        ${escapeHTML(name)}
                    </h3>

                    <div class="
                        mt-4 pt-3 border-t border-slate-600
                    ">

                        <p class="
                            text-xs text-slate-400
                            uppercase tracking-wide
                        ">
                            Pilot
                        </p>

                        <p class="
                            text-sm text-slate-200
                            mt-1 line-clamp-2
                        ">
                            ${escapeHTML(pilot)}
                        </p>

                    </div>

                    <div class="
                        mt-5 flex items-center justify-between
                        text-xs font-semibold
                    ">
                        <span class="text-blue-300">
                            VIEW DETAILS
                        </span>

                        <span class="
                            text-[#F4C542]
                            group-hover:translate-x-1
                            transition-transform
                        ">
                            →
                        </span>
                    </div>

                </div>
            </article>
        `;
    }).join("");
}

// Update pagination
function updatePagination() {
    totalPages = Math.max(1, Math.ceil(filteredGundams.length / limit));

    document.getElementById("page-info").textContent =
        `Page ${currentPage} of ${totalPages}`;

    document.getElementById("prev-btn").disabled =
        currentPage === 1;

    document.getElementById("next-btn").disabled =
        currentPage === totalPages;
}

// Change page
function changePage(direction) {
    const nextPage = currentPage + direction;

    if (nextPage >= 1 && nextPage <= totalPages) {
        currentPage = nextPage;

        displayGundams(getCurrentPageGundams());
        updatePagination();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}

// Search all Gundams by name or pilot
searchInput.addEventListener("input", function () {
    const keyword = this.value.trim().toLowerCase();

    filteredGundams = allGundams.filter(gundam => {
        const name = decodeName(gundam.name).toLowerCase();
        const pilot = (gundam.pilots || "").toLowerCase();

        return name.includes(keyword) || pilot.includes(keyword);
    });

    // Return to first page after searching
    currentPage = 1;

    updatePagination();
    displayGundams(getCurrentPageGundams());
});

function showGundamDetails(id) {
    const gundam = allGundams.find(
        item => String(item.id) === String(id)
    );

    if (!gundam) return;

    const name = decodeName(gundam.name || gundam.wikiName || "Unknown Gundam");

    document.getElementById("modal-image").src = gundam.imgUrl || "";
    document.getElementById("modal-name").textContent = name;
    document.getElementById("modal-description").textContent =
        gundam.header || "No description available.";

    const pilot = Array.isArray(gundam.pilots)
        ? gundam.pilots.map(p => typeof p === "string" ? p : p.name || "Unknown").join(", ")
        : gundam.pilots || "Unknown pilot";

    document.getElementById("modal-pilot").textContent = pilot;

    const wikiLink = document.getElementById("modal-wiki");
    wikiLink.href = gundam.wikiUrl || "#";

    const modal = document.getElementById("gundam-modal");

    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeModal() {
    const modal = document.getElementById("gundam-modal");

    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

// Start website
fetchAllGundams();
