const STORAGE_KEY = "pastelTasks.v1";

const form = document.getElementById("todoForm");
const input = document.getElementById("todoInput");
const list = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");
let todos = loadTodos();
let currentFilter = "all";
let toastTimer;

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function addTodo(text) {
  todos.unshift({
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
    text,
    completed: false,
    createdAt: Date.now()
  });
  saveTodos();
  render();
  showToast("Task added to your list");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    showToast("Please enter a task first");
    input.focus();
    return;
  }
  addTodo(text);
  input.value = "";
  input.focus();
});

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter").forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  render();
}

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = `todo-item${todo.completed ? " completed" : ""}`;

  const check = document.createElement("button");
  check.className = "check-button";
  check.type = "button";
  check.setAttribute("aria-label", todo.completed ? "Mark as in progress" : "Mark as completed");
  check.textContent = todo.completed ? "✓" : "";
  check.addEventListener("click", () => {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  });

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;

  const actions = document.createElement("div");
  actions.className = "item-actions";

  const edit = document.createElement("button");
  edit.className = "icon-button";
  edit.type = "button";
  edit.textContent = "✎";
  edit.setAttribute("aria-label", "Edit task");
  edit.title = "Edit task";
  edit.addEventListener("click", () => {
    const updated = window.prompt("Update your task:", todo.text);
    if (updated === null) return;
    if (!updated.trim()) {
      showToast("Task cannot be empty");
      return;
    }
    todo.text = updated.trim();
    saveTodos();
    render();
    showToast("Task updated");
  });

  const remove = document.createElement("button");
  remove.className = "icon-button delete";
  remove.type = "button";
  remove.textContent = "×";
  remove.setAttribute("aria-label", "Delete task");
  remove.title = "Delete task";
  remove.addEventListener("click", () => {
    todos = todos.filter(item => item.id !== todo.id);
    saveTodos();
    render();
    showToast("Task deleted");
  });

  actions.append(edit, remove);
  li.append(check, text, actions);
  return li;
}

function render() {
  list.replaceChildren();
  const visibleTodos = todos.filter(todo => {
    if (currentFilter === "active") return !todo.completed;
    if (currentFilter === "completed") return todo.completed;
    return true;
  });

  visibleTodos.forEach(todo => list.appendChild(createTodoElement(todo)));
  emptyState.style.display = visibleTodos.length ? "none" : "block";

  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const active = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  document.getElementById("taskCount").textContent = total;
  document.getElementById("allCount").textContent = total;
  document.getElementById("activeCount").textContent = active;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("progressText").textContent = `${percent}% complete`;
  document.getElementById("progressBar").style.width = `${percent}%`;
  document.getElementById("remainingText").textContent =
    active === 0 ? (total ? "Everything is complete. Lovely work!" : "You have a fresh start.") :
    `${active} task${active === 1 ? "" : "s"} left to go`;
}

document.getElementById("clearCompleted").addEventListener("click", () => {
  const before = todos.length;
  todos = todos.filter(todo => !todo.completed);
  if (todos.length === before) {
    showToast("No completed tasks to clear");
    return;
  }
  saveTodos();
  render();
  showToast("Completed tasks cleared");
});

document.getElementById("todayLabel").textContent = new Intl.DateTimeFormat("en", {
  weekday: "short", month: "short", day: "numeric"
}).format(new Date());

render();
