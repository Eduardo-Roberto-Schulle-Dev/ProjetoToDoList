// Seleção de elementos
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const filterSelect = document.querySelector("#filter-select"); // Seleciona o filtro

let oldInputValue; // Variável para armazenar o valor antigo da tarefa

// Funções 
const saveTodo = (text) => {
  const todo = document.createElement("div");
  todo.classList.add("todo");

  const todoTitle = document.createElement("h3");
  todoTitle.innerText = text;
  todo.appendChild(todoTitle);

  const doneBtn = document.createElement("button");
  doneBtn.classList.add("finish-todo");
  doneBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
  todo.appendChild(doneBtn);

  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-todo");
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  todo.appendChild(editBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("remove-todo");
  deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  todo.appendChild(deleteBtn);

  todoList.appendChild(todo);
}

document.addEventListener("DOMContentLoaded", function() {
  // Carrega os todos do localStorage ao carregar a página
  loadTodosFromLocalStorage();
});

const toggleForms = () => {
  editForm.classList.toggle("hide");
  todoForm.classList.toggle("hide");
  todoList.classList.toggle("hide");
}

const updateTodo = (newText) => {
  const todos = document.querySelectorAll(".todo");

  todos.forEach((todo) => {
    let todoTitle = todo.querySelector("h3");

    if (todoTitle.innerText === oldInputValue) {
      todoTitle.innerText = newText;

      // Atualizando o valor na localStorage
      updateTodoLocalStorage(oldInputValue, newText);
    }
  });
}

const updateTodoLocalStorage = (oldText, newText) => {
  let todos = JSON.parse(localStorage.getItem("todos")) || [];

  todos = todos.map(todo => {
    if (todo === oldText) {
      return newText;
    }
    return todo;
  });

  localStorage.setItem("todos", JSON.stringify(todos));
}

// Funções relacionadas ao localStorage
function insertolocalStorage() {
  var item = $('#todo_input').val().trim();
  if (item != '') {
    var uniqueKey = 'todo_' + new Date().getTime();
    localStorage.setItem(uniqueKey, item);
    $('#todo_input').val('');
    loadTodosFromLocalStorage();
  } else {
    alert('Insira um valor válido!');
    $('#todo_input').val('');
  }
}

function loadTodosFromLocalStorage() {
  var todoList = $('#todo-list');
  todoList.empty(); // Limpa a lista antes de adicionar os itens

  for (var i = 0; i < localStorage.length; i++) {
    var key = localStorage.key(i);
    if (key.startsWith('todo_')) {
      var value = localStorage.getItem(key);

      // Cria a estrutura HTML para cada item da lista
      var listItem = $(`
        <div class="todo">
          <h3>${value}</h3>
          <button class="finish-todo" onclick="finishTodo('${key}')">
            <i class="fa-solid fa-check"></i>
          </button>
          <button class="edit-todo" onclick="editTodo('${key}', '${value}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="remove-todo" onclick="removeTodo('${key}')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `);
      todoList.append(listItem);
    }
  }

  // Chama a função de filtro para aplicar o filtro atual após carregar os todos
  filterTodos(filterSelect.value);
}

// Função para editar um item
function editTodo(key, value) {
  $('#edit-input').val(value);
  $('#edit-form').removeClass('hide');
  $('#todo-form').addClass('hide');

  // Evento de edição
  $('#edit-form').off('submit').on('submit', function(e) {
    e.preventDefault();
    var newValue = $('#edit-input').val();
    
    // Atualiza o valor no localStorage
    if (newValue.trim() !== '') {
      localStorage.setItem(key, newValue);
    }
    
    $('#edit-form').addClass('hide');
    $('#todo-form').removeClass('hide');
    loadTodosFromLocalStorage();
  });
}

// Função para remover um item
function removeTodo(key) {
  localStorage.removeItem(key);
  loadTodosFromLocalStorage();
}

// Função para finalizar uma tarefa
function finishTodo(key) {
  const todoDiv = $(`[data-key="${key}"]`);
  todoDiv.toggleClass("done");

  // Atualiza o status no localStorage (se necessário)
  updateTodoStatusLocalStorage(key);
}

// Função para atualizar o status de uma tarefa no localStorage
function updateTodoStatusLocalStorage(todoKey) {
  const todoValue = localStorage.getItem(todoKey);
  if (todoValue) {
    const isDone = JSON.parse(localStorage.getItem(`${todoKey}_done`)) || false;
    localStorage.setItem(`${todoKey}_done`, !isDone);
  }
}

// Função para filtrar tarefas
function filterTodos(filterValue) {
  const todos = document.querySelectorAll(".todo");

  todos.forEach((todo) => {
    switch (filterValue) {
      case "all":
        todo.style.display = "flex";
        break;
      case "done":
        if (todo.classList.contains("done")) {
          todo.style.display = "flex";
        } else {
          todo.style.display = "none";
        }
        break;
      case "todo":
        if (!todo.classList.contains("done")) {
          todo.style.display = "flex";
        } else {
          todo.style.display = "none";
        }
        break;
    }
  });
}

// Evento para capturar a mudança no filtro
filterSelect.addEventListener("change", (e) => {
  const filterValue = e.target.value;
  filterTodos(filterValue);
});

// Eventos 
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  insertolocalStorage();
});

document.addEventListener("click", (e) => {
  const targetEl = e.target;
  const parentEl = targetEl.closest("div");
  let todoTitle;

  if (parentEl && parentEl.querySelector("h3")) {
    todoTitle = parentEl.querySelector("h3").innerText || "";
  }

  if (targetEl.classList.contains("finish-todo")) {
    parentEl.classList.toggle("done");
    updateTodoStatusLocalStorage(todoTitle);
  }

  if (targetEl.classList.contains("remove-todo")) {
    parentEl.remove();
    removeTodoLocalStorage(todoTitle);
  }

  if (targetEl.classList.contains("edit-todo")) {
    toggleForms();
    editInput.value = todoTitle;
    oldInputValue = todoTitle;
  }
});

cancelEditBtn.addEventListener("click", (e) => {
  e.preventDefault();
  toggleForms();
});

editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editInputValue = editInput.value;

  if (editInputValue) {
    updateTodo(editInputValue);
  }
  toggleForms();
});

// Botão de cancelar edição
$('#cancel-edit-btn').click(function() {
  $('#edit-form').addClass('hide');
  $('#todo-form').removeClass('hide');
});

function removeTodoLocalStorage(todoTitle) {
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    if (localStorage.getItem(key) === todoTitle) {
      localStorage.removeItem(key);
      break;
    }
  }
}
