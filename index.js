// Funcion que recibe una fecha con representacion numerica
// (Como la estamos guardando en las tareas)
// Y la regresa como texto con el formato dd/mm/yy
function toSmallDate(date) {
  let smallDate = new Date(date);
  return smallDate.toLocaleString("es-mx", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
}

function sortByDateCreatedASC(a, b) {
  return a.dateCreated > b.dateCreated;
}

function sortByDateCreatedDSC(a, b) {
  return a.dateCreated < b.dateCreated;
}

function App() {
  // Definimos nuestras variables globales de la app
  // mi arreglo de tareas y el elemento de HTML donde voy a hacer el render
  let taskList;
  // Definimos las tareas filtradas
  let filteredTasks;
  let taskListElement;
  // Definimos el filtro por el que se van a buscar las tareas.
  let filter;

  // Inicializo mi APP y sus variables
  function init() {
    // Inicializamos mis tareas como un arreglo vacío
    taskList = [];

    // Checamos si tenemos guardado en el Local storage las tareas
    if (localStorage.getItem("task-list") != null) {
      // Si existen las tareas las `Parseo` de JSON -> objecto de JS
      // Y se las asigno a mi lista de tareas
      taskList = JSON.parse(localStorage.getItem("task-list"));
    }

    // En cuanto abre mi aplicacion mis tareas filtradas van a ser las mismas
    // Que las tareas guardadas
    filteredTasks = taskList;

    // Mi filtro por default será vacío
    filter = "";

    taskListElement = document.getElementById("task-list");
    let addTaskForm = document.getElementById("add-task");
    addTaskForm.addEventListener("submit", handleSubmit);

    let buttonASC = document.getElementById("sort-asc");
    let buttonDSC = document.getElementById("sort-dsc");
    let filterInput = document.getElementById("filter-task");

    buttonASC.addEventListener("click", sortASC);
    buttonDSC.addEventListener("click", sortDSC);
    // Cada vez que mi input cambie de valor, guardo el Filtro y filtro mis tareas
    filterInput.oninput = handleFilter;

    render();
  }

  // Mando a llamar init() para inicializar mis variables
  init();

  // Mi Funcion de render que se encargara de a partir de el arreglo `taskList`
  // Renderear un template de html
  function render() {
    // Siempre empieza mi app con un string vacio
    // Para borrar cualquier cosa que este antes
    let template = "<ul>";

    // Recorremos el arreglo de tareas elemento por elemento
    for (let i = 0; i < filteredTasks.length; i++) {
      let task = filteredTasks[i];
      // Declaramos una nueva variable que sería mi fecha
      // con formato de texto dd/mm/yy
      let dateCreated = toSmallDate(task.dateCreated);

      // La clase de mi <li> quiero que siempre sea task item
      let className = "task-item";
      if (task.done) {
        // Si la tarea está terminada le agrego la clase de css `-done`
        className += " -done";
      }

      // Mi template será la acumulación de cada vuelta del LOOP + la nueva tarea
      // Guardo en propiedades que empiecen con `data-` propiedades a las que
      // después puedo acceder en JS
      template =
        template +
        `
      <li class="${className}" data-index=${i} data-done="${task.done}">
       <span class="task-date">${dateCreated}</span>
        <span class="task-text">${task.text}</span>
        <button>×</button>
      </li>
    `;
    }

    // Si existen tareas, cierro mi <ul>
    if (filteredTasks.length > 0) {
      template = template + "</ul>";
    } else if (taskList.length === 0) {
      // Si no hay tareas en mi lista de tareas
      // Mi template es un mensaje para decirle al usuario que no hay tareas
      template = `
      <div class="task-empty">
        <h2>¡Felicidades! 🥳</h2>
        <p>No tienes ninguna tarea</p>
      </div>
      `;
    } else {
      // Si hay tareas pero no hay tareas filtradas, le digo al
      // usuario que puede cambiar el filtro para mostrar las tareas que no se ven.
      template = `
      <div class="task-empty">
        <h2>😔</h2>
        <p>No hay tareas que tengan el texto <strong>${filter}</strong></p>
        <p>Intenta con un filtro diferente</strong></p>
      </div>
      `;
    }

    // A mi elemento de HTML que contiene mi lista le asigno el template que cree
    taskListElement.innerHTML = template;

    // Obtengo todos los elementos de HTML con la clase `task-item`
    let taskListElementList = document.getElementsByClassName("task-item");

    // A cada uno de ellos le asigno los event listener de toggle y delete task
    for (task of taskListElementList) {
      task.querySelector(".task-text").addEventListener("click", toggleTask);
      task.querySelector("button").addEventListener("click", deteleTask);
    }
  }

  // Cuando la forma de add task manda su evento de `submit` lo intercepto
  function handleSubmit(event) {
    event.preventDefault();
    let form = event.target;
    let input = form.querySelector("input");
    // Obtengo el valor del input, lo agrego a mi lista de tareas y lo borro
    addTask(input.value);
    input.value = "";
  }

  // Funcion para guardar mi lista de tareas en el LocalStorage
  function saveTasks() {
    localStorage.setItem("task-list", JSON.stringify(taskList));
  }

  // Guardo una nueva tarea en mi arreglo de tareas
  function addTask(task) {
    taskList.push({
      text: task,
      done: false,
      dateCreated: Date.now(),
    });
    // Siempre que modifico mi arreglo de tareas lo tengo que
    // Guardar -> Filtrar -> Renderar
    saveTasks();
    filterTasks();
    // Cada vez que cambia mi arreglo tengo que volver a llamar a `render()`
    render();
  }

  // Elimino un elemento de mi arreglo basandome en el indice del arreglo
  function deteleTask(event) {
    let parent = event.target.parentNode;
    let index = parent.dataset.index;
    taskList.splice(index, 1);
    // Siempre que modifico mi arreglo de tareas lo tengo que
    // Guardar -> Filtrar -> Renderar
    saveTasks();
    filterTasks();
    render();
  }

  // Cambio el estado entre terminado o no terminado de mi tarea dependiendo de su indice.
  function toggleTask(event) {
    let parent = event.target.parentNode;
    let done = parent.dataset.done === "true";
    let index = parent.dataset.index;
    taskList[index].done = !done;
    // Siempre que modifico mi arreglo de tareas lo tengo que
    // Guardar -> Filtrar -> Renderar
    saveTasks();
    filterTasks();
    render();
  }

  function sortASC() {
    filterTasks();
    filteredTasks = filteredTasks.sort(sortByDateCreatedASC);
    let buttonASC = document.getElementById("sort-asc");
    let buttonDSC = document.getElementById("sort-dsc");

    // Le asigno la clase `-active` a el boton de orden
    // ascendente o descendente dependiendo de lo que fue clickeado
    buttonASC.classList.add("-active");
    buttonDSC.classList.remove("-active");

    render();
  }

  function sortDSC() {
    filterTasks();
    filteredTasks = filteredTasks.sort(sortByDateCreatedDSC);
    let buttonASC = document.getElementById("sort-asc");
    let buttonDSC = document.getElementById("sort-dsc");
    // Le asigno la clase `-active` a el boton de orden
    // ascendente o descendente dependiendo de lo que fue clickeado
    buttonASC.classList.remove("-active");
    buttonDSC.classList.add("-active");
    render();
  }

  function filterTasks() {
    // Filtro mis tareas gracias a la variable `filter`
    // Utilizando una funcion anónima  `()=>{}`
    filteredTasks = taskList.filter((task) => {
      return task.text.toLowerCase().includes(filter.toLowerCase());
    });

    // Si mi filtro está vacío
    // Mis tareas filtradas serán todas las tareas
    if (!filter) {
      filteredTasks = taskList;
    }

    render();
  }

  // Funcion que maneja el cambio de filtro
  function handleFilter(e) {
    let value = e.target.value;
    filter = value;
    filterTasks();
  }
}

document.addEventListener("DOMContentLoaded", App);
