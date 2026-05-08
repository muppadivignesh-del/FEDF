// ---------- Direct DOM Update ----------
function updateDirectDOM() {
  const app = document.getElementById("app");

  console.time("Direct DOM");

  // Clear and rebuild DOM
  app.innerHTML = "";

  for (let i = 0; i < 1000; i++) {
    const div = document.createElement("div");
    div.textContent = "Item " + i;
    app.appendChild(div);
  }

  console.timeEnd("Direct DOM");
}


// ---------- Virtual DOM Simulation ----------
let virtualDOM = [];

function createVirtualDOM(count) {
  const vdom = [];
  for (let i = 0; i < count; i++) {
    vdom.push({ type: "div", content: "Item " + i });
  }
  return vdom;
}

function renderVirtualDOM(vdom) {
  const app = document.getElementById("app");

  const fragment = document.createDocumentFragment();

  vdom.forEach(node => {
    const el = document.createElement(node.type);
    el.textContent = node.content;
    fragment.appendChild(el);
  });

  app.innerHTML = "";
  app.appendChild(fragment);
}

function diff(oldVDOM, newVDOM) {
  let changes = [];

  for (let i = 0; i < newVDOM.length; i++) {
    if (!oldVDOM[i] || oldVDOM[i].content !== newVDOM[i].content) {
      changes.push({ index: i, node: newVDOM[i] });
    }
  }

  return changes;
}

function applyChanges(changes) {
  const app = document.getElementById("app");

  changes.forEach(change => {
    let child = app.children[change.index];

    if (child) {
      child.textContent = change.node.content;
    } else {
      const el = document.createElement(change.node.type);
      el.textContent = change.node.content;
      app.appendChild(el);
    }
  });
}

function updateVirtualDOM() {
  console.time("Virtual DOM");

  const newVDOM = createVirtualDOM(1000);

  const changes = diff(virtualDOM, newVDOM);

  applyChanges(changes);

  virtualDOM = newVDOM;

  console.timeEnd("Virtual DOM");
}