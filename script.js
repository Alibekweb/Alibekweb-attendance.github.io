const table = document.getElementById("attendanceTable");
const groupSelect = document.getElementById("groupSelect");
const monthPicker = document.getElementById("monthPicker");
const shell = document.getElementById("appShell");
const modal = document.getElementById("addModal");

let groups = JSON.parse(localStorage.getItem("groups")) || {
    "AXV3": [{ id: 1, ism: "Jumanazarov Alibek" }, { id: 2, ism: "Xudoyberganov Asror" }]
};

const save = () => localStorage.setItem("groups", JSON.stringify(groups));

function toggleSidebar() {
    shell.classList.toggle("collapsed");
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 400);
}

function openAddModal() { modal.classList.add("active"); document.getElementById("newName").focus(); }
function closeAddModal() { modal.classList.remove("active"); document.getElementById("newName").value = ""; }

function loadGroups() {
    groupSelect.innerHTML = "";
    Object.keys(groups).forEach(g => groupSelect.add(new Option(g, g)));
}

const getDayName = (y, m, d) => ["Yak", "Du", "Se", "Cho", "Pa", "Ju", "Sha"][new Date(y, m, d).getDay()];

function render() {
    const group = groupSelect.value;
    if (!group) return;

    const [year, month] = monthPicker.value.split("-");
    const totalDays = new Date(year, month, 0).getDate();
    const students = (groups[group] || []).sort((a, b) => a.ism.localeCompare(b.ism));

    document.getElementById("currentGroupName").innerText = group;
    document.getElementById("statsDisplay").innerText = `${students.length} nafar o'quvchi`;

    let html = `<thead><tr><th class="student">F.I.SH</th>`;
    for (let d = 1; d <= totalDays; d++) {
        const dayIdx = new Date(year, month-1, d).getDay();
        const isToday = d === new Date().getDate() && (month-1) === new Date().getMonth() && year == new Date().getFullYear();
        html += `<th class="${isToday ? 'today' : ''} ${dayIdx === 0 ? 'weekend' : ''}">${d}<br><small style="font-size:7px">${getDayName(year, month-1, d)}</small></th>`;
    }
    html += `<th style="width:40px">%</th></tr></thead><tbody>`;

    students.forEach(st => {
        html += `<tr><td class="student" oncontextmenu="deleteStudent(event, '${st.id}')">${st.ism}</td>`;
        let present = 0;
        for (let d = 1; d <= totalDays; d++) {
            const key = `att-${group}-${st.id}-${year}-${month}-${d}`;
            const status = localStorage.getItem(key) || "";
            if(status === "Bor") present++;
            const cls = status === "Bor" ? "status-bor" : status === "Yo‘q" ? "status-yoq" : status === "Sababli" ? "status-sababli" : "";
            html += `<td data-key="${key}" class="${cls}"></td>`;
        }
        const pct = Math.round((present / totalDays) * 100);
        html += `<td style="font-weight:700; background:#f8fafc; color:${pct < 70 ? '#ef4444' : '#10b981'}">${pct}%</td></tr>`;
    });

    table.innerHTML = html + `</tbody>`;
    bindEvents();
}

function bindEvents() {
    document.querySelectorAll("td[data-key]").forEach(td => {
        td.onclick = () => {
            const k = td.dataset.key;
            let s = localStorage.getItem(k);
            s = s === "Bor" ? "Yo‘q" : s === "Yo‘q" ? "Sababli" : s === "Sababli" ? "" : "Bor";
            s ? localStorage.setItem(k, s) : localStorage.removeItem(k);
            render();
        };
    });
}

function deleteStudent(e, id) {
    e.preventDefault();
    if(confirm("Ushbu o'quvchini ro'yxatdan o'chirmoqchimisiz?")) {
        groups[groupSelect.value] = groups[groupSelect.value].filter(s => s.id != id);
        save(); render();
    }
}

function addNewGroup() {
    const n = prompt("Yangi guruh nomi:");
    if(n && !groups[n]) { groups[n] = []; save(); loadGroups(); groupSelect.value = n; render(); }
}

document.getElementById("saveStudentBtn").onclick = () => {
    const inp = document.getElementById("newName");
    if(inp.value.trim()) {
        groups[groupSelect.value].push({ id: Date.now(), ism: inp.value.trim() });
        save(); closeAddModal(); render();
    }
};

monthPicker.value = new Date().toISOString().slice(0, 7);
groupSelect.onchange = render;
monthPicker.onchange = render;
loadGroups();
render();