import { getJSON, updateJSON } from "./requests.js";
import generateTasks from "./generateTasks.js";
import {
  updateActivePage,
  updateTasksPerPage,
  fetchAndUpdatePagination,
} from "./pagination.js";

const gridContainer = document.querySelector(".grid-container");
let currentPage = 1;

//------------RENDERING TASKS------------
document.addEventListener("DOMContentLoaded", async () => {
  await generateTasks();
  updateActivePage(currentPage);
});

//------------ADD DONE TASK STYLES-------------
function checkedElem(gridItem, state) {
  if (state) {
    gridItem.style.textDecoration = "line-through";
    gridItem.style.color = "rgba(44, 43, 43, 0.605)";
  } else {
    gridItem.style.textDecoration = "none";
    gridItem.style.color = "black";
  }
}

//------------GENERATE MODALS FOR TASKS-------------
async function generateModal(task) {
  const content = `<div class="modal animated-border" data-task-id="${task.id}">
                          <div class="modal-header">
                              <img src="../images/icon warning.svg" alt="warning">
                              <span class="modal-title">Delete</span>
                          </div>
                          <div class="modal-content">
                              <p>Do You Want To Delete This Task?</p>
                              <div class="modal-info">
                                 <p>${task.title}</p>
                                 <p>${task.dueDate}</p>
                              </div>
                          </div>
                          <div class="modal-buttons">
                              <button type="submit" id="confirmDeleteBtn">Delete</button>
                              <button id="cancelDeleteBtn">Cancel</button>
                          </div>
                    </div>`;
  document.body.insertAdjacentHTML("beforeend", content);
}

//------------SHOW MODAL-------------
function showModal(taskId) {
  const modal = document.querySelector(`.modal[data-task-id="${taskId}"]`);
  const overlay = document.querySelector(".overlay");

  if (modal && overlay) {
    modal.style.display = "flex";
    overlay.style.display = "block";
  }
}

//------------HIDE MODAL-------------
function hideModal(modal) {
  const overlay = document.querySelector(".overlay");

  if (modal && overlay) {
    modal.style.display = "none";
    overlay.style.display = "none";
  }
}

//------------EVENT DELEGATION FOR TASKS-------------
gridContainer.addEventListener("click", async (event) => {
  //------------DELETE MODAL AND TASK-------------
  if (event.target.classList.contains("delete-icon")) {
    const gridItem = event.target.closest(".grid-item");
    if (gridItem) {
      const taskId = gridItem.dataset.taskId;
      const task = await getJSON(taskId);
      generateModal(task);
      showModal(task.id);
    }
  } //------------EDIT TASK-------------
  else if (event.target.classList.contains("edit-icon")) {
    const gridItem = event.target.closest(".grid-item");
    if (gridItem) {
      const taskId = +gridItem.dataset.taskId;
      await getJSON(taskId);
      location.assign(
        `http://127.0.0.1:5500/htmlContent/Home.html?id=${taskId}`
      );
    }
  } //------------CHECK TASK DONE-------------
  else if (event.target.classList.contains("checkbox")) {
    const checkbox = event.target;
    const gridItem = checkbox.closest(".grid-item");
    const taskId = +gridItem.dataset.taskId;
    console.log(checkbox.checked);
    checkedElem(gridItem, checkbox.checked);
    await updateJSON("PATCH", { isDone: checkbox.checked }, taskId);
    updateTasksPerPage(currentPage);
  }
});

//------------CONFIRM OR CANCEL DELETION-------------
document.addEventListener("click", async (event) => {
  if (event.target.id === "cancelDeleteBtn") {
    const modal = event.target.closest(".modal");
    if (modal) {
      hideModal(modal);
    }
  } else if (event.target.id === "confirmDeleteBtn") {
    const modal = event.target.closest(".modal");
    const taskId = modal.dataset.taskId;
    const gridItem = document.querySelector(
      `.grid-item[data-task-id="${taskId}"]`
    );
    if (gridItem) {
      gridItem.remove();
      hideModal(modal);
      modal.remove();
      await updateJSON("DELETE", taskId);
      updateTasksPerPage(currentPage);
      //pagination should be done again after each deletion
      await fetchAndUpdatePagination();
      if (gridContainer.childElementCount === 0) {
        if (currentPage > 1) {
          //go one page back if page becomes empty after deletion
          currentPage--;
        }
        updateTasksPerPage(currentPage);
        updateActivePage(currentPage);

        // Remove the page-number element of the deleted page
        const pageNumberToDelete = document.getElementById(
          currentPage + 1
        );
        if (pageNumberToDelete) {
          pageNumberToDelete.remove();
        }
      }
    }
  }
});
