import { getJSON } from "./requests.js";

const gridContainer = document.querySelector(".grid-container");

// ------------GENERATE GRID ITEMS-------------
export default async function generateTasks(
  queryParam = "?_page=1&_limit=12"
) {
  const tasks = await getJSON(queryParam);
  if (queryParam) {
    // gridContainer.innerHTML = "";
    gridContainer.textContent = "";
    //According to MDN this will be faster than innerHTML as browsers won't invoke their HTML parsers and will instead immediately replace all children of the element with a single #text node.
  }
  tasks.forEach((task) => {
    const content = `<div class="grid-item" data-task-id="${task.id}">
                        <div class="first-line">
                           <div class="info">
                            <input type="checkbox" name="checkbox" class="checkbox" id="checked-btn">
                              <h6>${task.title}</h6>
                              <p>${task.dueDate}</p>
                           </div>
                           <div class="task-controls">
                              <div><img src="../images/icon edit.svg" alt="edit icon" class="edit-icon"></div>
                              <div><img src="../images/icon delete.svg" alt="delete icon" class="delete-icon"></div>
                           </div>
                        </div>
                        <p>${task.description}</p>
                      </div>
`;
    gridContainer.insertAdjacentHTML("beforeend", content);
    //checking isDone value to apply styles accordingly
    const checkbox =
      gridContainer.lastElementChild.querySelector(".checkbox");
    if (task.isDone) {
      checkbox.setAttribute("checked", "checked");
    } else {
      checkbox.removeAttribute("checked");
    }
    checkedElem(gridContainer.lastElementChild, task.isDone);
  });
}

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
