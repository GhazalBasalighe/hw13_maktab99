import { getJSON, updateJSON } from "./requests.js";
import generateTasks from "./generateTasks.js";

const gridContainer = document.querySelector(".grid-container");

//------------RENDERING TASKS------------
document.addEventListener("DOMContentLoaded", async () => {
  await generateTasks();
  await pagination();
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

//------------PAGINATION------------
const footer = document.querySelector(".bottom-gray");
const pageList = document.createElement("ul");
pageList.classList.add("page-list");
footer.appendChild(pageList);

const taskPerPage = 12;
let tasksTotalCount = (await getJSON()).length;
let pageCount = Math.ceil(tasksTotalCount / taskPerPage);
let currentPage = 1;

//svg content for prev and next arrows
const prevpageSvg = ` <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g transform="translate(24 0) scale(-1 1)"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="#1ab8db" d="M16.06 10.94a1.5 1.5 0 0 1 0 2.12l-5.656 5.658a1.5 1.5 0 1 1-2.121-2.122L12.879 12L8.283 7.404a1.5 1.5 0 0 1 2.12-2.122l5.658 5.657Z"/></g></g></svg>`;
const nextPageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="M24 0v24H0V0h24ZM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018Zm.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01l-.184-.092Z"/><path fill="#1ab8db" d="M16.06 10.94a1.5 1.5 0 0 1 0 2.12l-5.656 5.658a1.5 1.5 0 1 1-2.121-2.122L12.879 12L8.283 7.404a1.5 1.5 0 0 1 2.12-2.122l5.658 5.657Z"/></g></svg>`;

// Create dynamic UI for page numbers
createPageNumbers(pageList, pageCount);

// Create left arrow at the beginning
const prevPage = createArrowElement("prevPage", prevpageSvg);
insertArrowSvg(prevPage, prevpageSvg, "afterbegin");

// Create right arrow at the end
const nextPage = createArrowElement("nextPage", nextPageSvg);
insertArrowSvg(nextPage, nextPageSvg, "beforeend");

// Add event listeners for arrow clicks and page number clicks
addPaginationEventListeners(prevPage, nextPage, pageList);

// Validate the requested page and load it
validateAndLoadRequestedPage(pageCount);

//------------GENERATE PAGE NUMBERS UL-------------
function createPageNumbers(pageList, pageCount) {
  for (let i = 1; i <= pageCount; i++) {
    const pageNum = document.createElement("li");
    pageNum.textContent = i;
    pageNum.classList.add("page-number");
    pageNum.id = i;
    pageList.appendChild(pageNum);
  }
}

//------------UPDATE ACTIVE PAGE-------------
function updateActivePage(currentPage) {
  const pageNumbers = document.querySelectorAll(".page-number");
  pageNumbers.forEach((pageNumber) => {
    pageNumber.classList.remove("active-page");
    if (pageNumber.id == currentPage) {
      pageNumber.classList.add("active-page");
    }
  });
}

//------------GENERATE ARROWS-------------
function createArrowElement(id, svgContent) {
  const arrowElement = document.createElement("span");
  arrowElement.id = id;
  arrowElement.innerHTML = svgContent;
  arrowElement.style.cursor = "pointer";
  return arrowElement;
}

//------------PAGINATION FUNCTIONALITY-------------
function addPaginationEventListeners(prevPage, nextPage, pageList) {
  // Right arrow -> next page
  nextPage.addEventListener("click", () => {
    if (currentPage < pageCount) currentPage++;
    else return;
    updateTasksPerPage(currentPage);
    updateActivePage(currentPage);
  });

  // Left arrow -> previous page
  prevPage.addEventListener("click", () => {
    if (currentPage != 1) currentPage--;
    else return;
    updateTasksPerPage(currentPage);
    updateActivePage(currentPage);
  });

  // Page numbers themselves
  pageList.addEventListener("click", (e) => {
    if (e.target.classList.contains("page-number")) {
      const pageId = e.target.id;
      currentPage = pageId;
      updateTasksPerPage(currentPage);
      updateActivePage(currentPage);
    }
  });
}

//------------INSERT ARROW FOR PAGINATION-------------
function insertArrowSvg(elemName, innerHtml, placeTo) {
  elemName.innerHTML = `${innerHtml}`;
  elemName.style.cursor = "pointer";
  pageList.insertAdjacentElement(`${placeTo}`, elemName);
}

//------------UPDATE TASKS ACCORDING TO PAGE-------------
async function updateTasksPerPage(currentPage) {
  const queryParam = `?_page=${currentPage}&_limit=${taskPerPage}`;
  const pageAddress = new URL(window.location.href);
  pageAddress.searchParams.set("_page", currentPage);
  pageAddress.searchParams.set("_limit", taskPerPage);
  window.history.replaceState({}, "", pageAddress);
  await generateTasks(queryParam);
}

//------------UPDATE PAGINATION AFTER REMOVING A TASK-------------
async function fetchAndUpdatePagination() {
  tasksTotalCount = (await getJSON()).length;
  pageCount = Math.ceil(tasksTotalCount / taskPerPage);

  // Remove existing page numbers and arrows
  const pageNumbers = document.querySelectorAll(".page-number");
  pageNumbers.forEach((pageNumber) => {
    pageNumber.remove();
  });

  const prevArrow = document.querySelector("#prevPage");
  if (prevArrow) {
    prevArrow.remove();
  }

  const nextArrow = document.querySelector("#nextPage");
  if (nextArrow) {
    nextArrow.remove();
  }

  // Add new page numbers
  for (let i = 1; i <= pageCount; i++) {
    const pageNum = document.createElement("li");
    pageNum.textContent = i;
    pageNum.classList.add("page-number");
    pageNum.id = i;
    pageList.appendChild(pageNum);
  }

  // Insert next and previous page arrows again
  insertArrowSvg(prevPage, prevpageSvg, "afterbegin");
  insertArrowSvg(nextPage, nextPageSvg, "beforeend");

  validateAndLoadRequestedPage(pageCount);
}

//------------VALIDATE QUERY PARAM PAGE CHANGE-------------
function validateAndLoadRequestedPage(pageCount) {
  const urlParams = new URLSearchParams(window.location.search);
  const requestedPage = parseInt(urlParams.get("_page"));

  // Check if the requested page exceeds the total number of pages
  if (requestedPage > pageCount) {
    // Redirect to the "Not Found" page
    window.location.href = "./NotFound.html";
  } else {
    // Load the requested page normally
    updateTasksPerPage(requestedPage);
    updateActivePage(requestedPage);
  }
}
