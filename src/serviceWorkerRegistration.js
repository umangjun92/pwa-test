// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(config) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            "This web app is being served cache-first by a service " +
              "worker. To learn more, visit https://cra.link/PWA"
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

const getNewUpdate = async (regWaiting) => {
  // const x = await caches.delete(`workbox-precache-v2-${window.location.origin}/`);
  // console.log("cahced dele", x)
  // window.location.reload(true);
  console.log("installing new update");
  // const reg = (await navigator.serviceWorker.ready);
  // const regWaiting = reg.waiting || reg.active || reg.installing;
  // // const regWaiting = swReg?.waiting;
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

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      if (registration.waiting) {
        (async () => {
          const newVal = (
            await (
              await fetch("https://sh-dev.vahak.in/v1/vr/gt?k=test")
            ).json()
          ).data.version;

          // const newVal = process.env.REACT_APP_V;
          console.log("new ver", newVal);
          const cache = await caches.open("v-cache");
          if (window.localStorage.getItem("ua")) {
            const shouldUpdate = window.confirm("install update?");
            if (shouldUpdate) {
              getNewUpdate(swReg);
              await cache?.put("test", new Response(newVal));
              window.localStorage.removeItem("ua");
            } else {
              window.localStorage.setItem("ua", "1");
            }
          } else {
            const oldVal = await (await cache?.match("test"))?.json();
            console.log("old ver", oldVal);
            if (String(oldVal) !== String(newVal)) {
              const shouldUpdate = window.confirm("install update?");
              if (shouldUpdate) {
                getNewUpdate(swReg);
                await cache?.put("test", new Response(newVal));
                window.localStorage.removeItem("ua");
              } else {
                window.localStorage.setItem("ua", "1");
              }
            }
          }
        })();
      }

      if (navigator.vendor === "Apple Computer, Inc.") {
        console.log("Safari!!!!");
        if (registration.waiting) {
          if (config && config.onUpdate) {
            config.onUpdate(registration);
          }
        }
      }
      const t1 = Date.now();
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        const t2 = Date.now();
        // console.log("time 1", t2 -t1)
        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              const t3 = Date.now();
              // console.log("time 2", t3 -t2);
              console.log(
                "New content is available and will be used when all " +
                  "tabs for this page are closed. See https://cra.link/PWA."
              );

              // Execute callback
              if (config && config.onUpdate) {
                const t4 = Date.now();
                // console.log("time 3", t4 -t3)
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log("Content is cached for offline use.");

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error("Error during service worker registration:", error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { "Service-Worker": "script" },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    });
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
