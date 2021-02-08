import { ref, onMounted, h } from "vue";
import Hls from "hls.js";

export function debounce(fn, timeout) {
  let t;
  return function () {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, arguments), timeout);
  };
}

const hlsReloadFrequency = 1000;

export const useHls = (src) => {
  const retryDelay = 3000;

  const videoRef = ref(null);

  const status = ref("nodata");
  const width = ref(null);
  const height = ref(null);

  onMounted(() => {
    videoRef.value.addEventListener("loadedmetadata", (e, e2) => {
      console.log("loadedmetadata");
    });

    videoRef.value.addEventListener("loadeddata", (e) => {
      status.value = "loading";
      if (videoRef.value) {
        width.value = videoRef.value.videoWidth;
        height.value = videoRef.value.videoHeight;
      }
    });

    videoRef.value.addEventListener("playing", (e) => {
      status.value = "playing";
    });

    videoRef.value.addEventListener("emptied", (e) => {
      status.value = "nodata";
    });

    videoRef.value.addEventListener("ended", (e) => {
      status.value = "nodata";
    });

    if (videoRef.value.canPlayType("application/vnd.apple.mpegURL")) {
      console.log("SAFARI");

      videoRef.value.src = src;

      let timeout = null;
      timeout = setInterval(() => {
        console.log("interval");
        videoRef.value.src = src;
      }, 1000);

      videoRef.value.addEventListener("loadeddata", (e) => {
        console.log("clearing timeout");
        if (timeout) {
          clearTimeout(timeout);
        }
      });

      videoRef.value.addEventListener("waiting", (e) => {
        status.value = "loading";
        timeout = setInterval(() => {
          console.log("waiting interval");
          videoRef.value.src = src;
        }, hlsReloadFrequency);
      });
    } else {
      if (Hls.isSupported()) {
        console.log("CHROME");
        const hls = new Hls({
          manifestLoadingRetryDelay: hlsReloadFrequency,
          manifestLoadingMaxRetry: Infinity,
          xhrSetup: function (xhr) {
            xhr.addEventListener("error", (e) => {
              console.log("xhr error");
              hls.loadSource(src);
              hls.startLoad();
              videoRef.value.play();
            });
          },
        });

        hls.attachMedia(videoRef.value);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(src);
          hls.startLoad();
        });
        hls.on(Hls.Events.ERROR, function (e, data) {
          console.log("hlserror");
          console.log(data);
          hls.recoverMediaError();
          if (data.type !== Hls.ErrorTypes.MEDIA_ERROR) {
            hls.startLoad();
          } else {
            hls.recoverMediaError();
          }
        });
      }
    }
  });

  return { videoRef, status, width, height };
};