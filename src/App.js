import React, {  useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

function App() {
  const [swReg, setSwReg] = useState();

  const getNewUpdate = () => {
    const regWaiting = swReg?.waiting;
    if (regWaiting) {
      regWaiting.postMessage({ type: "SKIP_WAITING" });
      regWaiting.addEventListener("statechange", (e) => {
        if (e.target?.state === "activated") {
          // const t2 = Date.now();
          // console.log("Reloading now to get the latest version", t2 - t1);
          window.location.reload();
        }
      });
    }
  };

  useEffect(() => {
    (async () => {
      const newVal = process.env.REACT_APP_V;
      const cache = await caches.open("v-cache");
      if (window.localStorage.getItem("ua")) {
        const shouldUpdate = window.confirm("install update?");
        if (shouldUpdate) {
          getNewUpdate();
          await cache?.put("test", new Response(newVal));
          window.localStorage.removeItem("ua");
        } else {
          window.localStorage.setItem("ua", "1");
        }
      } else {
        const oldVal = await (await cache?.match("test"))?.json();
        if (oldVal !== newVal) {
          const shouldUpdate = window.confirm("install update?");
          if (shouldUpdate) {
            getNewUpdate();
            await cache?.put("test", new Response(newVal));
            window.localStorage.removeItem("ua");
          } else {
            window.localStorage.setItem("ua", "1");
          }
        }
      }
    })();

    serviceWorkerRegistration.register({
      onSuccess: (reg) => {
        setSwReg(reg);
        console.log("reg", reg);
      },
      //   // onUpdate: async (reg) => {
      //   //   const t1 = Date.now();
      //   //   console.log("New update avalaible");
      //   //   const cache = await caches.open("v-cache");
      //   //   const oldVal = (await (await cache?.match("test"))?.json());
      //   //   await cache?.put("test", new Response(oldVal ? Number(oldVal) +1 : 1))
      //   //   const shouldUpdate = window.confirm("Update");
      //   //   if(shouldUpdate){
      //   //     const registrationWaiting = reg.waiting;
      //   //     if (registrationWaiting) {
      //   //       registrationWaiting.postMessage({ type: "SKIP_WAITING" });
      //   //       registrationWaiting.addEventListener("statechange", (e) => {
      //   //         if (e.target?.state === "activated") {
      //   //           const t2 = Date.now();
      //   //           console.log("Reloading now to get the latest version", t2 - t1);

      //   //           window.location.reload();
      //   //         }
      //   //       });
      //   //     }
      //   //   }else {
      //   //     window.localStorage.setItem("ua", "1")
      //   //   }
      //   // },
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit 8 <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
