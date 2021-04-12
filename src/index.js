import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: async (reg) => {
    const t1 = Date.now();
    console.log("New update avalaible");
    const cache = await caches.open("v-cache");
    const oldVal = (await (await cache.match("test")).json());
    await cache.put("test", new Response(Number(oldVal)++))
    const shouldUpdate = confirm("Update");
    if(shouldUpdate){
      const registrationWaiting = reg.waiting;
      if (registrationWaiting) {
        registrationWaiting.postMessage({ type: "SKIP_WAITING" });
        registrationWaiting.addEventListener("statechange", (e) => {
          if (e.target?.state === "activated") {
            const t2 = Date.now();
            console.log("Reloading now to get the latest version", t2 - t1);
            
            window.location.reload();
          }
        });
      }
    }else {
      window.localStorage.setItem("ua", "1")
    }
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
