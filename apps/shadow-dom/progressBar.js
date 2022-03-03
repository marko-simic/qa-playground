class ProgressBar extends HTMLElement {
  static css = `
        :host {
          width: 390px;
          height: 150px;

          flex-direction: column;
        }

        .container {
          display: block;
            width: 380px;
            height: 30px;
            background: #b2becd;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 4vh;
        }

        .fill {
          width: 10%;
          height: 100%;
          background: var(--fill-color, #f0db4f);
          transition: width 6s;

        }


        button {
          width: 130px;
          height: 40px;
          background: var(--nav-bg);
          margin: 0.25em 0.25em 0.25em 0;
          color: var(--text-color);
          font-size: 0.625em;
          border: 2px solid transparent;
          padding: 1em 2em;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-body);
          text-transform: uppercase;
          font-weight: 700;
          border-radius: 3px;
          vertical-align: bottom;
          cursor: pointer;
        }

        button:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
        }

        .btn-green-outline {
          background: var(--background);
          border: 2px solid var(--green);
          transition: background 0.4s ease;
        }
        
        .btn-green-outline:hover {
          box-shadow: var(--card-shadow);
          background: var(--green);
          color: #fff;
          transition: background 0.4s ease;
        }
    `;

  static get observedAttributes() {
    return ["percent"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    const container = document.createElement("div");
    const fill = document.createElement("div");
    container.append(fill);
    const wrapper = document.createElement("div");
    const btn = document.createElement("button");
    btn.innerHTML = "Boost 🚀";

    wrapper.append(btn);

    style.innerHTML = ProgressBar.css;
    container.classList.add("container");
    fill.classList.add("fill");
    btn.classList.add("btn-green-outline");

    this.shadowRoot.append(style, container, wrapper);
    this.shadowRoot.sty;
    btn.onclick = function () {
      fill.style.width = `95%`;

      boost();
    };
  }

  get percent() {
    const value = this.getAttribute("percent");

    if (isNaN(value)) {
      return 0;
    }

    if (value < 0) {
      return 0;
    }

    if (value > 100) {
      return 100;
    }

    return Number(value);
  }

  set percent(value) {
    this.setAttribute("percent", value);
  }

  attributeChangedCallback(name) {
    if (name === "percent") {
      this.shadowRoot.querySelector(".fill").style.width = `${this.percent}%`;
    }
  }
}

customElements.define("progress-bar", ProgressBar);
