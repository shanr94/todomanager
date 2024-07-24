//initializing CONSTANTS
const formElm = Array.from(document.querySelector("form").children);
const createBtn = document.getElementById("createBtn");
const resetBtn = document.getElementById("resetBtn");
const msgBox = document.querySelector("#msg");

//INITIALIZING VARIABLES
let title = "";
let desc = "";
let dueDate = "";
let compDetails = false;
let pTaskIDCounter = 1;
let compTaskIDCounter = 1;
let delTaskIDCounter = 1;
let pElmHeight = 0;
let restore = false;
let nearExpiryTimerID;
let attentionTimerID;

//FUNCTION TO HANDLE OVERFLOW OF TASKS FROM TASK CONTAINER DIV
const overflowHandler = (id, elmHeight) => {
  pElmHeight += elmHeight;
  let containerElm = document.getElementById(id);
  let containerHeight = containerElm.offsetHeight;
  containerHeight = containerHeight - 50;
  if (pElmHeight > containerHeight) {
    containerElm.style.overflowY = "scroll";
  } else {
    containerElm.style.overflowY = "hidden";
  }
};

//SET DATE IN DD/MM/YY HH:MM FORMAT
const dateFormat = (date) => {
  const DT = date.getDate().toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const month = (date.getMonth() + 1).toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const year = date.getFullYear().toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const hour = date.getHours().toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const minute = date.getMinutes().toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  return `${DT}/${month}/${year} ${hour}:${minute}`;
};

//CALCULATE DIFFERNCE BETWEEN DATES
const dateDifference = (endDt) => {
  const curDt = new Date();
  const diff = endDt - curDt;
  return Math.floor(diff / (1000 * 60 * 60 * 24) + 1);
};

//CREATE MAP OF TASK ID AS KEY AND DUE DATE AS VALUE
const createTaskDTMap = async (taskArry) => {
  const taskMAP = new Map();
  Array.from(taskArry).forEach((task) => {
    let dateElm = document.querySelector(`#${task.id} .taskContent .dateTime`);
    let DT = dateElm.innerText;
    taskMAP.set(task.id, DT);
  });
  return taskMAP;
};

//START ALERT HANDLER
const expiredAlertHandler = async (taskArry) => {
  taskArry.forEach((id) => {
    document.getElementById(id).style.backgroundColor = "red";
    document.getElementById(id).style.color = "black";
  });
};

const nearExpiryAlertHandler = async (nearExpiryTasks) => {
  clearInterval(nearExpiryTimerID);
  nearExpiryTimerID = setInterval(() => {
    nearExpiryTasks.forEach((id) => {
      document.getElementById(id).classList.toggle("nearExpiry");
    });
  }, 500);
};

const attentionAlertHandler = async (attentionReqTasks) => {
  clearInterval(attentionTimerID);
  attentionTimerID = setInterval(() => {
    attentionReqTasks.forEach((id) => {
      document.getElementById(id).classList.toggle("attentionReq");
    });
  }, 500);
};
//END ALERT HANDLER

//CHECK EXPIRY OF TASKS
const expiryHandler = async () => {
  const expiredTasks = [];
  const nearExpiryTasks = [];
  const attentionReqTasks = [];
  const containerElm = document.getElementById("penContainer");
  if (containerElm.childElementCount > 0) {
    const taskMAP = await createTaskDTMap(containerElm.children);
    for (let [id, dt] of taskMAP) {
      const elm = document.getElementById(id);
      const dateDiff = dateDifference(new Date(dt));
      if (dateDiff < 1) {
        expiredTasks.push(id);
      } else if (dateDiff < 4) {
        nearExpiryTasks.push(id);
      } else if (dateDiff < 6) {
        attentionReqTasks.push(id);
      }
    }
  }
  await expiredAlertHandler(expiredTasks);
  await nearExpiryAlertHandler(nearExpiryTasks);
  await attentionAlertHandler(attentionReqTasks);
};

//REFRESHES THE TASK INDEXES AFTER SORTING
const refreshIndex = async (id) => {
  let count = 1;
  const elm = document.getElementById(id);
  const childCounts = elm.childElementCount;
  if (childCounts > 0) {
    const tasksArry = Array.from(elm.children);
    tasksArry.forEach((task) => {
      task.children[0].innerText = count;
      count++;
    });
  }
  await expiryHandler();
};

//SORTS THE TASKS ACCORDING TO DUE DATE
const reArrangeTasks = async (id) => {
  const container = document.querySelector(`#${id}`);
  const arrangedTask = [];
  if (container.childElementCount > 0 || container.childElementCount != null) {
    const taskElms = container.children;
    const taskDTMap = await createTaskDTMap(taskElms);
    const sortedArry = Array.from(taskDTMap).sort((a, b) => {
      return new Date(a[1]) - new Date(b[1]);
    });
    sortedArry.forEach((item) => {
      let elm = document.getElementById(item[0]);
      arrangedTask.push(elm);
    });

    arrangedTask.forEach((elm) => {
      container.append(elm);
    });
  }
};

//UPDATE DETAILS IN TASK ELEMENT
const updateDetail = async (targetTaskID, srcTaskId) => {
  const tTitleElm = document.querySelector(`#${targetTaskID} .taskTitle`);
  const tDescElm = document.querySelector(`#${targetTaskID} .taskDesc`);
  const tDateElm = document.querySelector(`#${targetTaskID} .dateTime`);

  if (srcTaskId != null) {
    const sTitleElm = document.querySelector(`#${srcTaskId} .taskTitle`);
    const sDescElm = document.querySelector(`#${srcTaskId} .taskDesc`);
    const sDateElm = document.querySelector(`#${srcTaskId} .dateTime`);

    tTitleElm.innerText = sTitleElm.innerText;
    tDescElm.innerText = sDescElm.innerText;

    const srcID = srcTaskId.slice(0, 7);
    if (srcID == "penTask") {
      const tBeforeDate = document.querySelector(
        `#${targetTaskID} .beforeDueDT`
      );
      tBeforeDate.innerText = sDateElm.innerText;
      tDateElm.innerHTML = dateFormat(new Date());
    } else {
      const srcBeforeDate = document.querySelector(
        `#${srcTaskId} .beforeDueDT`
      );
      tDateElm.innerHTML = srcBeforeDate.innerText;
    }
    document.getElementById(srcTaskId).remove();
  } else {
    tTitleElm.innerText = title;
    tDescElm.innerText = desc;
    tDateElm.innerText = dueDate.toString().slice(0, 21);
  }
};

//CREATE NEW TASK
const createTaskHandler = async (containerId) => {
  const initial = containerId.substring(0, 3);
  let taskId = "";

  const containerElm = document.getElementById(containerId);
  let mainDivElm = document.createElement("div");
  containerElm
    .appendChild(mainDivElm)
    .classList.add("tasks", `${initial}Tasks`);

  let countElm = document.createElement("h4");
  countElm.classList.add(`count`);
  mainDivElm.append(countElm);

  let contentElm = document.createElement("div");
  mainDivElm.appendChild(contentElm).classList.add("taskContent");

  let dateElm = document.createElement("p");
  containerId == "penContainer"
    ? (dateElm.innerText = "Due Date: ")
    : containerId === "compContainer"
    ? (dateElm.innerText = "Completed Date: ")
    : (dateElm.innerText = "Deleted Date: ");

  contentElm.appendChild(dateElm).classList.add("bold-text");

  let dateSpanElm = document.createElement("span");
  dateElm.appendChild(dateSpanElm).classList.add("dateTime");

  let titleElm = document.createElement("p");
  titleElm.innerText = "Title: ";
  contentElm.appendChild(titleElm).classList.add("bold-text");

  let titleSpanElm = document.createElement("span");
  titleElm.appendChild(titleSpanElm).classList.add("taskTitle");

  let descElm = document.createElement("p");
  descElm.innerText = "Description: ";
  contentElm.appendChild(descElm).classList.add("bold-text");

  let descSpanElm = document.createElement("span");
  descElm.appendChild(descSpanElm).classList.add("taskDesc");
  let btnContElm = document.createElement("div");
  mainDivElm.appendChild(btnContElm).classList.add("taskBtn");

  if (containerId === "penContainer") {
    taskId = initial + "Task" + pTaskIDCounter;
    let delIcon = document.createElement("i");
    let doneIcon = document.createElement("i");
    delIcon.style.color = "#ff0000";
    doneIcon.style.color = "#00ff7b";
    delIcon.setAttribute("id", "delIcon");
    doneIcon.setAttribute("id", "doneIcon");
    btnContElm
      .appendChild(delIcon)
      .classList.add("fa-solid", "fa-xmark", "fa-lg");
    btnContElm
      .appendChild(doneIcon)
      .classList.add("fa-solid", "fa-check", "fa-lg");
    pTaskIDCounter++;
  } else {
    let undoIcon = document.createElement("i");
    undoIcon.setAttribute("id", "undoIcon");
    btnContElm
      .appendChild(undoIcon)
      .classList.add("fa-solid", "fa-rotate-left", "fa-lg");

    let beforeDueDTElm = document.createElement("p");
    beforeDueDTElm.innerText = "Due Date: ";
    contentElm.appendChild(beforeDueDTElm).classList.add("bold-text");

    let beforeDueDT = document.createElement("span");
    beforeDueDTElm.appendChild(beforeDueDT).classList.add("beforeDueDT");

    if (containerId === "compContainer") {
      taskId = initial + "Task" + compTaskIDCounter;
      compTaskIDCounter++;
    } else {
      taskId = initial + "Task" + delTaskIDCounter;
      delTaskIDCounter++;
    }
  }
  mainDivElm.setAttribute("id", taskId);
  overflowHandler(containerId, mainDivElm.offsetHeight);
  return taskId;
};

//COMPLETED TASK HANDLER
const doneTaskHandler = async (srcTaskId) => {
  let comTaskId = createTaskHandler("compContainer");
  comTaskId.then((res) => {
    updateDetail(res, srcTaskId);
  });
  await refreshIndex("compContainer");
  await refreshIndex("penContainer");
  addEvt();
};

//DELETED TASK HANDLER
const deletetaskHandler = async (srcTaskId) => {
  let delTaskId = createTaskHandler("delContainer");
  delTaskId.then((res) => {
    updateDetail(res, srcTaskId);
  });
  await refreshIndex("delContainer");
  await reArrangeTasks("penContainer");
  await refreshIndex("penContainer");
  addEvt();
};

//RESTORE TASK HANDLER
const restoretaskHandler = async (srcTaskId) => {
  const srcContainerID = document.getElementById(srcTaskId).parentElement.id;
  let penTaskId = createTaskHandler("penContainer");
  penTaskId.then((res) => {
    restore = true;
    updateDetail(res, srcTaskId);
    console.log(document.getElementById(res));
  });
  await reArrangeTasks("penContainer");
  await reArrangeTasks(srcContainerID);
  await refreshIndex("penContainer");
  await refreshIndex(srcContainerID);
  addEvt();
  await expiryHandler();
};

//BUTTON CLICK HANDLER
const btnClickHandler = (e) => {
  const srcTaskId = e.target.parentElement.parentElement.id;
  const classArry = Array.from(e.target.classList);
  classArry.forEach((item) => {
    if (item == "fa-check") {
      doneTaskHandler(srcTaskId);
    } else if (item == "fa-xmark") {
      deletetaskHandler(srcTaskId);
    } else if (item == "fa-rotate-left") {
      restoretaskHandler(srcTaskId);
    }
  });
};

//DISPLAY MESSAGE UPON CLICK OF NEW TASK FORM BUTTONS
const msgHandler = (bg, textCol, text) => {
  msgBox.style.display = "initial";
  msgBox.style.transform = "ScaleY(1)";
  msgBox.style.color = textCol;
  msgBox.style.backgroundColor = bg;
  msgBox.firstElementChild.innerText = text;
  let msgTimerID;
  clearTimeout(msgTimerID);
  msgTimerID = setTimeout(() => {
    resetHandler();
  }, 500);
};

//ADDS EVENT LISTNER TO ALL I TAGS
const addEvt = () => {
  const iBtns = Array.from(document.querySelectorAll("i"));
  iBtns.forEach((i) => {
    i.addEventListener("click", btnClickHandler);
  });
};

//CREATE NEW TASK HANDLER
const newTaskHandler = async () => {
  const taskId = await createTaskHandler("penContainer");
  await updateDetail(taskId, null);
  await reArrangeTasks("penContainer");
  await refreshIndex("penContainer");
  msgHandler("green", "white", "Task added successfully.");
  addEvt();
};

//RESET HANDLER
const resetHandler = () => {
  document.querySelector("#title").value = "";
  document.querySelector("#taskDesc").value = "";
  document.querySelector("#dueDate-Time").value = "";
  title = "";
  desc = "";
  dueDate = "";
  compDetails = false;
  msgBox.style.display = "none";
  msgBox.children[0].innerText = "";
  resetBtn.classList.add("disabled");
};

//FORM ELEMENT BUTTON CLICK HANDLER
const clickHandler = (evt) => {
  evt.preventDefault();
  if (evt.target.id == "createBtn") {
    if (compDetails) {
      newTaskHandler();
    } else {
      msgHandler(
        "black",
        "red",
        "Incomplete Details! Enter details in all fields."
      );
    }
  } else {
    resetHandler();
  }
};

//ACTION HANDLER UPON FORM INPUT
const inputActionHandler = (title, desc, dueDate) => {
  if (title != "" || desc != "" || dueDate != "") {
    resetBtn.classList.remove("disabled");
    if (title != "" && desc != "" && dueDate != "") {
      createBtn.style.opacity = 1;
      compDetails = true;
    } else {
      createBtn.style.opacity = 0.5;
      compDetails = false;
    }
  } else {
    resetBtn.classList.add("disabled");
  }
};

//FORM INPUT HANDLER
const inputHandler = (e) => {
  if (e.target.id === "title") {
    title = e.target.value;
  } else if (e.target.id === "taskDesc") {
    desc = e.target.value;
  } else if (e.target.id === "dueDate-Time") {
    const DT = new Date(e.target.value);
    const daysDiff = dateDifference(DT);
    if (daysDiff > 0) {
      dueDate = DT;
    }
  }
  inputActionHandler(title, desc, dueDate);
};

//DEBOUNCING
const debounce = (func, wait) => {
  let timerId;
  return (e) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func(e);
    }, wait);
  };
};

const debouncingHandler = debounce(inputHandler, 100);

//ADD EVENT LISTNERS
formElm.forEach((elm) => {
  elm.addEventListener("change", debouncingHandler);
});
createBtn.addEventListener("click", clickHandler);
resetBtn.addEventListener("click", clickHandler);
