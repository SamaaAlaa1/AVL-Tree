class Node {
  constructor(data, x = 0, y = 0) {
    this.data = data;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = x;
    this.y = y;

    this.element = document.createElement("div");
    this.element.className = "tree-node";
    this.element.innerHTML = `<span>${data}</span>`;
    this.setPosition(x, y);
    document.getElementById("treeContainer").appendChild(this.element);

    this.balanceElement = document.createElement("div");
    this.balanceElement.className = "balance-factor";
    this.element.appendChild(this.balanceElement);

    this.heightElement = document.createElement("div");
    this.heightElement.className = "height-display";
    this.element.appendChild(this.heightElement);

    this.updateDisplay();
  }

  updateDisplay(balance) {
    this.heightElement.textContent = this.height;
    this.balanceElement.textContent = balance !== undefined ? balance : "";
    this._lastBalance = balance;

    if (balance > 1 || balance < -1) {
      this.element.classList.remove("balanced");
      this.element.classList.add("unbalanced");
      this.balanceElement.style.color = "#ff0000";
    } else {
      this.element.classList.remove("unbalanced");
      this.element.classList.add("balanced");
      this.balanceElement.style.color = "#00ff00";
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  animateMove(targetX, targetY, durationMultiplier = 1) {
    const duration = 300 * durationMultiplier;
    const startX = this.x;
    const startY = this.y;
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const newX = startX + deltaX * progress;
      const newY = startY + deltaY * progress;
      this.setPosition(newX, newY);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        updateLines(tree.root);
      }
    };

    requestAnimationFrame(step);
  }

  highlight() {
    this.element.classList.add("highlight");
    setTimeout(() => {
      this.element.classList.remove("highlight");
    }, 500);
  }
}

class AVLTree {
  constructor() {
    this.root = null;
    this.levelGap = 60;
    this.horizontalGap = 40;
    this.animationSpeed = 1;
    this.maxWidth = 0;
  }

  height(node) {
    return node ? node.height : 0;
  }

  getBalance(node) {
    return node ? this.height(node.left) - this.height(node.right) : 0;
  }

  rotateRight(y) {
    logOperation(`Performing Right Rotation at node ${y.data}`);

    let x = y.left;
    let T2 = x.right;

    x.right = y;
    y.left = T2;

    y.height = 1 + Math.max(this.height(y.left), this.height(y.right));
    x.height = 1 + Math.max(this.height(x.left), this.height(x.right));

    y.updateDisplay(this.getBalance(y));
    x.updateDisplay(this.getBalance(x));

    this.reposition(
      this.root,
      this.getTreeCenter(),
      30,
      this.getInitialSpread()
    );

    setTimeout(() => updateLines(this.root), 350);
    return x;
  }

  rotateLeft(x) {
    logOperation(`Performing Left Rotation at node ${x.data}`);

    let y = x.right;
    let T2 = y.left;

    highlightRotationNodes([x, y], () => {
      y.left = x;
      x.right = T2;

      x.height = 1 + Math.max(this.height(x.left), this.height(x.right));
      y.height = 1 + Math.max(this.height(y.left), this.height(y.right));

      x.updateDisplay(this.getBalance(x));
      y.updateDisplay(this.getBalance(y));

      this.reposition(
        this.root,
        this.getTreeCenter(),
        30,
        this.getInitialSpread()
      );
    });
    setTimeout(() => updateLines(this.root), 350);
    return y;
  }

  getTreeCenter() {
    const treeWidth = this.calculateTreeWidth(this.root);
    const container = document.getElementById("treeContainer");
    const containerWidth = container.offsetWidth;

    // If tree is wider than container, center it in the middle of its own width
    if (treeWidth > containerWidth) {
      return treeWidth / 2;
    }
    // Otherwise center in container
    return containerWidth / 2;
  }

  calculateTreeWidth(node) {
    if (!node) return 0;
    // Calculate the maximum x position the tree will occupy
    let minX = Infinity;
    let maxX = -Infinity;

    const traverse = (n, x, level) => {
      if (!n) return;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);

      const spread = this.getInitialSpread() / Math.pow(2, level);
      traverse(n.left, x - spread, level + 1);
      traverse(n.right, x + spread, level + 1);
    };

    traverse(node, 0, 0);

    return maxX - minX + 100; // Add some padding
  }

  getInitialSpread() {
    const container = document.getElementById("treeContainer");
    return Math.min(container.offsetWidth / 3, 300); // Limit maximum spread
  }

  insert(data) {
    if (data === "" || isNaN(data)) return;
    logOperation(`Inserting value: ${data}`);

    this.root = this._insert(this.root, data);
    this.reposition(
      this.root,
      this.getTreeCenter(),
      30,
      this.getInitialSpread()
    );
  }

  _insert(node, data) {
    if (!node) return new Node(data);

    if (data < node.data) {
      node.left = this._insert(node.left, data);
    } else if (data > node.data) {
      node.right = this._insert(node.right, data);
    } else {
      logOperation(`Value ${data} already exists in tree`);
      return node;
    }

    node.height = 1 + Math.max(this.height(node.left), this.height(node.right));
    let balance = this.getBalance(node);
    node.updateDisplay(balance);

    if (balance > 1 && data < node.left.data) {
      return this.rotateRight(node);
    }

    if (balance < -1 && data > node.right.data) {
      return this.rotateLeft(node);
    }

    if (balance > 1 && data > node.left.data) {
      node.left = this.rotateLeft(node.left);
      return this.rotateRight(node);
    }

    if (balance < -1 && data < node.right.data) {
      node.right = this.rotateRight(node.right);
      return this.rotateLeft(node);
    }

    return node;
  }

  delete(data) {
    if (data === "" || isNaN(data)) return;
    logOperation(`Deleting value: ${data}`);

    this.root = this._delete(this.root, data);
    this.reposition(
      this.root,
      this.getTreeCenter(),
      30,
      this.getInitialSpread()
    );
  }

  _delete(root, key) {
    if (!root) {
      logOperation(`Value ${key} not found in tree`);
      return root;
    }

    if (key < root.data) {
      root.left = this._delete(root.left, key);
    } else if (key > root.data) {
      root.right = this._delete(root.right, key);
    } else {
      if (!root.left || !root.right) {
        let temp = root.left || root.right;
        if (!temp) {
          document.getElementById("treeContainer").removeChild(root.element);
          return null;
        } else {
          document.getElementById("treeContainer").removeChild(root.element);
          return temp;
        }
      }

      let temp = this._getMin(root.right);
      root.data = temp.data;
      root.element.querySelector("span").textContent = temp.data;
      root.right = this._delete(root.right, temp.data);
    }

    root.height = 1 + Math.max(this.height(root.left), this.height(root.right));
    let balance = this.getBalance(root);
    root.updateDisplay(balance);

    if (balance > 1 && this.getBalance(root.left) >= 0) {
      return this.rotateRight(root);
    }

    if (balance > 1 && this.getBalance(root.left) < 0) {
      root.left = this.rotateLeft(root.left);
      return this.rotateRight(root);
    }

    if (balance < -1 && this.getBalance(root.right) <= 0) {
      return this.rotateLeft(root);
    }

    if (balance < -1 && this.getBalance(root.right) > 0) {
      root.right = this.rotateRight(root.right);
      return this.rotateLeft(root);
    }

    return root;
  }

  _getMin(node) {
    let current = node;
    while (current.left) current = current.left;
    return current;
  }

  reposition(node, x, y, spread) {
    if (!node) return;
    node.animateMove(x, y, this.animationSpeed);
    this.reposition(node.left, x - spread, y + this.levelGap, spread / 2);
    this.reposition(node.right, x + spread, y + this.levelGap, spread / 2);
  }

  clear() {
    this._clearTree(this.root);
    this.root = null;
    clearLines();
    logOperation("Tree cleared");
  }

  _clearTree(node) {
    if (!node) return;
    this._clearTree(node.left);
    this._clearTree(node.right);
    if (node.element && node.element.parentNode) {
      node.element.parentNode.removeChild(node.element);
    }
  }
}

function drawLine(parentNode, childNode) {
  const svg = document.getElementById("svgContainer");

  const x1 = parentNode.x + parentNode.element.offsetWidth / 2;
  const y1 = parentNode.y + parentNode.element.offsetHeight / 2;
  const x2 = childNode.x + childNode.element.offsetWidth / 2;
  const y2 = childNode.y + childNode.element.offsetHeight / 2;

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke-width", "2");

  const balance = Math.abs(parentNode._lastBalance);
  if (balance > 1) {
    line.setAttribute("stroke", "#ff4a4a");
  } else {
    line.setAttribute("stroke", "#4a8eff");
  }

  svg.appendChild(line);
  return line;
}

function updateLines(node) {
  if (!node) return;

  clearLines();

  function drawConnections(currentNode) {
    if (!currentNode) return;

    if (currentNode.left) {
      drawLine(currentNode, currentNode.left);
      drawConnections(currentNode.left);
    }
    if (currentNode.right) {
      drawLine(currentNode, currentNode.right);
      drawConnections(currentNode.right);
    }
  }

  drawConnections(node);
}

function clearLines() {
  const svg = document.getElementById("svgContainer");
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
}

function highlightRotationNodes(nodes, callback) {
  const lines = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const line = findLineBetweenNodes(nodes[i], nodes[i + 1]);
    if (line) lines.push(line);
  }

  nodes.forEach((node) => {
    node.element.classList.add("rotation-highlight");
  });
  lines.forEach((line) => {
    line.classList.add("highlight");
  });

  setTimeout(() => {
    nodes.forEach((node) => {
      node.element.classList.remove("rotation-highlight");
    });
    lines.forEach((line) => {
      line.classList.remove("highlight");
    });
    if (callback) callback();
  }, 1000);
}

function findLineBetweenNodes(node1, node2) {
  const svg = document.getElementById("svgContainer");
  const lines = svg.querySelectorAll("line");

  const x1 = node1.x + node1.element.offsetWidth / 2;
  const y1 = node1.y + node1.element.offsetHeight / 2;
  const x2 = node2.x + node2.element.offsetWidth / 2;
  const y2 = node2.y + node2.element.offsetHeight / 2;

  for (const line of lines) {
    const lineX1 = parseFloat(line.getAttribute("x1"));
    const lineY1 = parseFloat(line.getAttribute("y1"));
    const lineX2 = parseFloat(line.getAttribute("x2"));
    const lineY2 = parseFloat(line.getAttribute("y2"));

    if (
      (Math.abs(lineX1 - x1) < 1 &&
        Math.abs(lineY1 - y1) < 1 &&
        Math.abs(lineX2 - x2) < 1 &&
        Math.abs(lineY2 - y2) < 1) ||
      (Math.abs(lineX1 - x2) < 1 &&
        Math.abs(lineY1 - y2) < 1 &&
        Math.abs(lineX2 - x1) < 1 &&
        Math.abs(lineY2 - y1) < 1)
    ) {
      return line;
    }
  }
  return null;
}

function logOperation(message) {
  const log = document.getElementById("operationLog");
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.textContent = message;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

const tree = new AVLTree();

document.getElementById("insertBtn").addEventListener("click", () => {
  const value = parseInt(document.getElementById("valueInput").value);
  tree.insert(value);
  document.getElementById("valueInput").value = "";
});

document.getElementById("deleteBtn").addEventListener("click", () => {
  const value = parseInt(document.getElementById("valueInput").value);
  tree.delete(value);
  document.getElementById("valueInput").value = "";
});

document.getElementById("clearBtn").addEventListener("click", () => {
  tree.clear();
});

document.getElementById("valueInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const value = parseInt(document.getElementById("valueInput").value);
    tree.insert(value);
    document.getElementById("valueInput").value = "";
  }
});

window.addEventListener("resize", () => {
  if (tree.root) {
    tree.reposition(
      tree.root,
      tree.getTreeCenter(),
      30,
      tree.getInitialSpread()
    );
  }
});

logOperation("AVL Tree Visualization Ready");
logOperation("Enter a value and click Insert or Delete");
