let activeEffect = null;

class Signal {
  constructor(initialValue) {
    this._value = initialValue;
    this.subscribers = new Set();
  }

  get value() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
    return this._value;
  }

  set value(newValue) {
    if (this._value !== newValue) {
      this._value = newValue;
      this.subscribers.forEach((effect) => effect());
    }
  }
}

function effect(fn) {
  const execute = () => {
    activeEffect = execute;
    fn();
    activeEffect = null;
  };
  execute();
}

function mount(component, targetElement) {
  // 1. Run the component function to get its template string and reactive setup
  const { template, setup } = component();

  // 2. Turn the template string into real DOM nodes
  const templateEl = document.createElement("template");
  templateEl.innerHTML = template.trim();
  const domNode = templateEl.content.cloneNode(true);

  // 3. Keep a reference before appending so we can query it
  // (or query targetElement right after appending)
  targetElement.appendChild(domNode);

  // 4. Run the component's reactive setup (where effects & event listeners are wired)
  if (setup) {
    setup(targetElement);
  }
}

// TESTS

// Define a reusable component
function CounterComponent() {
  const count = new Signal(0);

  return {
    template: `
      <div>
        <p>Count: <span id="val">0</span></p>
        <button id="inc">Add</button>
      </div>
    `,
    setup: (root) => {
      const valSpan = root.querySelector("#val");
      const incBtn = root.querySelector("#inc");

      // Wire up reactivity
      effect(() => {
        valSpan.textContent = count.value;
      });

      // Wire up user interaction
      incBtn.addEventListener("click", () => {
        count.value++;
      });
    },
  };
}

// Mount it to the app container in your HTML
mount(CounterComponent, document.getElementById("app"));
