let users = [];
let tasks = [];

// ---------- PROMISE CREATORS ----------

// Create user (async)
function createUser(name) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ id: Date.now(), name });
        }, 400);
    });
}

// Create task (async, no user yet)
function createTask(title, dueDate) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                id: Date.now(),
                title,
                userId: null,
                completed: false,
                dueDate   // ✅ NEW
            });
        }, 400);
    });
}


// ---------- ADD FUNCTIONS ----------

function addUser() {
    const input = document.getElementById("userInput");
    const name = input.value.trim();

    if (!name) {
        showToast("User name cannot be empty ❌", "error");
        return;
    }

    // ✅ DUPLICATE CHECK
    const exists = users.some(
        user => user.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
        showToast("User already exists ❌", "error");
        return;
    }

    createUser(name)
        .then(user => {
            users.push(user);
            updateDropdowns();
            input.value = "";
            showToast("User added successfully ✅");
        });
}


function addTask() {
    const input = document.getElementById("taskInput");
    const dueDateInput = document.getElementById("dueDateInput");

    const title = input.value.trim();
    const dueDate = dueDateInput.value;

    if (!title) {
        showToast("Task name cannot be empty ❌", "error");
        return;
    }

    if (!dueDate) {
        showToast("Please select a due date ❌", "error");
        return;
    }

    // ✅ DUPLICATE CHECK
    const exists = tasks.some(
        task => task.title.toLowerCase() === title.toLowerCase()
    );

    if (exists) {
        showToast("Task already exists ❌", "error");
        return;
    }

    createTask(title, dueDate)
        .then(task => {
            tasks.push(task);
            updateDropdowns();
            renderTasks();
            updateSummary();
            input.value = "";
            dueDateInput.value = "";
            showToast("Task added successfully ✅");
        });
}



// ---------- PARALLEL MATCHING FUNCTION ----------

function assignTask() {
    const taskId = document.getElementById("taskSelect").value;
    const userId = document.getElementById("userSelect").value;

    if (!taskId || !userId) {
        showToast("Select task and user ❌", "error");
        return;
    }

    const taskPromise = Promise.resolve(tasks.find(t => t.id == taskId));
    const userPromise = Promise.resolve(users.find(u => u.id == userId));

    Promise.all([taskPromise, userPromise])
        .then(([task, user]) => {
            if (!task || !user) {
                showToast("Assignment failed ❌", "error");
                return;
            }

            task.userId = user.id;
            renderTasks();
            updateDropdowns();
            updateSummary();
            showToast("Task assigned successfully 🎉");
        })
        .catch(() => showToast("Error assigning task ❌", "error"));
}


// ---------- UI HELPERS ----------

function updateDropdowns() {
    const taskSelect = document.getElementById("taskSelect");
    const userSelect = document.getElementById("userSelect");

    taskSelect.innerHTML = "<option value=''>Select Task</option>";
    userSelect.innerHTML = "<option value=''>Select User</option>";

    tasks.filter(t => t.userId === null).forEach(task => {
        const opt = document.createElement("option");
        opt.value = task.id;
        opt.textContent = task.title;
        taskSelect.appendChild(opt);
    });

    users.forEach(user => {
        const opt = document.createElement("option");
        opt.value = user.id;
        opt.textContent = user.name;
        userSelect.appendChild(opt);
    });
}

function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.forEach(task => {
        const user = users.find(u => u.id === task.userId);

        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";

        const left = document.createElement("div");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.onchange = () => toggleTask(task.id);

        const text = document.createElement("span");
        text.style.marginLeft = "8px";
        const dueText = `📅 ${task.dueDate} | ${getCountdown(task.dueDate)}`;


text.textContent = user
    ? `${task.title} — 👤 ${user.name} | ${dueText}`
    : `${task.title} — ❌ Unassigned | ${dueText}`;


        if (task.completed) {
            text.style.textDecoration = "line-through";
            text.style.color = "gray";
        }

        left.appendChild(checkbox);
        left.appendChild(text);

        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑";
        delBtn.style.background = "#dc3545";
        delBtn.style.marginLeft = "10px";
        delBtn.onclick = () => deleteTask(task.id);

        li.appendChild(left);
        li.appendChild(delBtn);
        list.appendChild(li);
        const today = new Date().toISOString().split("T")[0];

if (!task.completed && task.dueDate < today) {
    li.style.borderLeft = "4px solid red";
}

    });
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;

    showToast(
        task.completed ? "Task marked as completed ✅" : "Task marked as pending ⏳"
    );
    updateSummary();
    renderTasks();
}

function deleteTask(taskId) {
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;

    tasks.splice(index, 1);

    updateDropdowns();
    renderTasks();
    updateSummary();
    showToast("Task deleted successfully 🗑");
}


function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.className = "toast";
    }, 3000);
}
function getCountdown(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diff < 0) return "⏰ Overdue";
    if (diff === 0) return "⏰ Due Today";
    return `⏰ ${diff} day(s) left`;
}
function updateSummary() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;

    const today = new Date().toISOString().split("T")[0];
    const overdue = tasks.filter(
        t => !t.completed && t.dueDate < today
    ).length;

    document.getElementById("summary").textContent =
        `📊 Total: ${total} | ✅ Completed: ${completed} | ⏰ Overdue: ${overdue}`;
}
renderTasks();
updateSummary();

