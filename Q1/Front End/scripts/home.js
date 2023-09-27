import { getJSON, updateJSON } from "./requests.js";

const formElem = document.querySelector("#task-form");
const btnCancel = document.querySelector(".btnCancel");

const titleInput = document.querySelector("#title");
const descriptionInput = document.querySelector("#description");
const dateInput = document.querySelector("#dueDate");

let editMode = false;

//------------TURNING HOME PAGE INTO EDIT PAGE-------------
(async function editPageSettings() {
  const urlParams = new URLSearchParams(window.location.search);
  // Check if the URL contains the 'taskId' query parameter
  const taskId = +urlParams.get("id");
  if (taskId) {
    editMode = true;

    //changing components ui
    const btnAdd = document.querySelector(".btnAdd");
    btnAdd.textContent = "Save";
    const addTask = document.querySelector(".add-task-title");
    addTask.textContent = "Edit Task";

    //filling the inputs with data
    const response = await getJSON(taskId);
    titleInput.value = response.title;
    descriptionInput.value = response.description;
    dateInput.value = response.dueDate;
  }
})();

//------------SUBMIT FORM-------------
formElem.addEventListener("submit", async (e) => {
  // Page not refreshing
  e.preventDefault();

  // Getting the object of form data
  const formData = Object.fromEntries(new FormData(formElem).entries());

  // Adding createdAt, updatedAt, isDone properties
  formData.createdAt = new Date();
  formData.updatedAt = editMode ? new Date() : formData.createdAt;
  formData.isDone = false;

  // Sending the POST request to the server
  try {
    if (editMode) {
      const formData = Object.fromEntries(
        new FormData(formElem).entries()
      );
      const pageAddress = new URL(window.location.href);
      const taskId = pageAddress.searchParams.get("id");
      updateJSON("PATCH", formData, taskId).then(() => {
        // Displaying toast successful
        showToast(
          "linear-gradient(to right, #00b09b, #96c93d)",
          "Task Edited Successfully"
        );
      });
      editMode = false;
    } else {
      updateJSON("POST", formData).then(() => {
        console.log("successful promise");
        // Displaying toast successful
        showToast(
          "linear-gradient(to right, #00b09b, #96c93d)",
          "Task Added Successfully"
        );
      });
    }
    // Resetting the inputs of form and redirecting
    setTimeout(() => {
      formElem.reset();
      window.location.href = "../htmlContent/Todos.html";
    }, 3000);
  } catch (error) {
    // Displaying toast unsuccessful
    showToast(
      "linear-gradient(to right, #ff0000, #cc0000)",
      "Task Was Not Added"
    );
  }
});

//------------CANCEL BUTTON REDIRECT-------------
btnCancel.addEventListener(
  "click",
  () => (window.location.href = "../htmlContent/Todos.html")
);

//------------TOASTIFY-------------
function showToast(bgColor, text) {
  Toastify({
    text: text,
    style: {
      background: bgColor,
    },
    offset: {
      y: 40, // Vertical axis - can be a number or a string indicating unity. eg: '2em'
    },
    gravity: "top", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    duration: 3000,
    className: "toast-animated-border", // Add the CSS class for the animated border
  }).showToast();
}
