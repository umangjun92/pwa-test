import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const callUpdate = async (newVer, regWaiting) => {
  getNewUpdate(regWaiting);
  const cache = await caches.open("v-cache");
  await cache?.put("test", new Response(newVer));
  window.localStorage.removeItem("ua");
};

const getNewUpdate = async (regWaiting) => {
  console.log("installing new update");
  console.log("regWaititn", regWaiting);
  if (regWaiting) {
    regWaiting.postMessage({ type: "SKIP_WAITING" });
    regWaiting.addEventListener("statechange", (e) => {
      if (e.target?.state === "activated") {
        // const t2 = Date.now();
        // console.log("Reloading now to get the latest version", t2 - t1);
        console.log("update installed");

        // window.location.reload();
      }
    });
  }
};

function App() {
  const [latestVer, setLatestVer] = useState();
  const [waitingSW, setWaitingSW] = useState();
  const [updateReady, setUpdateReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const t1 = Date.now();
    serviceWorkerRegistration.register({
      // onSuccess: (reg) => {
      //   setSwReg(reg);
      //   console.log("reg", reg);
      //   const t2 = Date.now();
      //   console.log("time to success", t2 -t1)
      // },
      onUpdate: (reg) => {
        setWaitingSW(reg.waiting);
      },
      onWaiting: (reg) => {
        console.log("on waiting", reg);
        setWaitingSW(reg.waiting);
      },
    });
  }, []);

  useEffect(() => {
    // if(swReg){
    (async () => {
      const newVer = (
        await (await fetch("https://sh-dev.vahak.in/v1/vr/gt?k=test")).json()
      ).data.version;

      // const newVal = process.env.REACT_APP_V;
      console.log("new ver", newVer);
      setLatestVer(newVer);
      if (window.localStorage.getItem("ua")) {
        const shouldUpdate = window.confirm("install update?");
        if (shouldUpdate) {
          setTimeout(() => {
            setIsUpdating(false);
          },10000)
          setIsUpdating(true);
        }
        // callUpdate(newVer, waitingSW)
      } else {
        const cache = await caches.open("v-cache");
        const oldVal = await (await cache?.match("test"))?.json();
        console.log("old ver", oldVal);
        if (String(oldVal) !== String(newVer)) {
          const shouldUpdate = window.confirm("install update?");
          if (shouldUpdate) {
            setTimeout(() => {
              setIsUpdating(false);
            },10000)
            setIsUpdating(true);
          } else {
            window.localStorage.setItem("ua", "1");
          }
          // callUpdate(newVer,waitingSW)
        }
      }
    })();
    // }
  }, []);

  useEffect(() => {
    console.log("waitingSW", waitingSW);
    if (isUpdating && waitingSW) {
      callUpdate(latestVer, waitingSW);
    }
  }, [isUpdating, waitingSW]);

  return (
    <div className="App">
      <header className="App-header">
        {isUpdating ? (
          <h1>Checking for Updates</h1>
        ) : (
          <>
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit 40 <code>src/App.js</code> and save to reload.
            </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
