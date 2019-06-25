const keypress = (key) => {
  const event = new KeyboardEvent("keydown", { key: key });
  document.querySelector("#root-1").dispatchEvent(event);
};

const right = () => { keypress("l"); };
const left = () => { keypress("h"); };
const confirm = () => { keypress("e"); };
const back = () => { keypress("q"); };

const startCamera = (video) => {
  video.width = video.width || 320;
  video.height = video.height || video.width * (3 / 4)

  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: {
        facingMode: "user"
      }
    })
    .then(stream => {
      window.localStream = stream;
      video.srcObject = stream
      video.onloadedmetadata = () => {
        video.play()
      }
      return true;
    }).catch(console.error);
}

window.addEventListener("load", () => {
  const button = document.createElement("button");
  document.body.appendChild(button);
  button.id = "gestures";
  button.innerText = "Enable Gestures";
  button.style.zIndex = 9999;
  button.style.position = "fixed";
  button.style.top = "10px";
  button.style.right = "10px";

  document.querySelector("#gestures").addEventListener("click", async () => {
    button.style.display = "none";
    const video = document.createElement("video");
    document.body.appendChild(video);

    video.style.zIndex = 9999;
    video.style.position = "fixed";
    video.style.top = "10px";
    video.style.right = "10px";

    const started = await startCamera(video);
    const net = await posenet.load({
      architecture: 'ResNet50',
      outputStride: 32,
      inputResolution: 257,
      quantBytes: 2
    });

    const detect = () => {
      net.estimateSinglePose(video, { flipHorizontal: true }).then((pose) => {
        const confident = 0.9;
        const proximate = 7;
        const nose = pose.keypoints.find(keypoint => keypoint.part === "nose");
        const rWrist = pose.keypoints.find(keypoint => keypoint.part === "rightWrist");
        const lWrist = pose.keypoints.find(keypoint => keypoint.part === "leftWrist");
        const rShoulder = pose.keypoints.find(keypoint => keypoint.part === "rightShoulder");
        const lShoulder = pose.keypoints.find(keypoint => keypoint.part === "leftShoulder");
        const rEar = pose.keypoints.find(keypoint => keypoint.part === "rightEar");
        const lEar = pose.keypoints.find(keypoint => keypoint.part === "leftEar");

        if (rWrist.score > confident && rEar.score > confident) {
          const wristDist = Math.sqrt((rWrist.position.x - rEar.position.x)^2 + (rWrist.position.y - rEar.position.y)^2);

          if (wristDist < proximate) {
            console.log("ding", "confirm");
            confirm();
          }
        }

        if (rWrist.score > confident && rShoulder.score > confident) {
          rDist = Math.sqrt((rWrist.position.x - rShoulder.position.x)^2 + (rWrist.position.y - rShoulder.position.y)^2);

          if (rDist < proximate) {
            console.log("ding", "pan right");
            right();
          }
        }

        if (lWrist.score > confident && lShoulder.score > confident) {
          lDist = Math.sqrt((lWrist.position.x - lShoulder.position.x)^2 + (lWrist.position.y - lShoulder.position.y)^2);

          if (lDist < proximate) {
            console.log("ding", "pan left");
            left();
          }
        }

        requestAnimationFrame(detect);
      });
    }

    detect();
  }, { once: true });
});
