// The index in files : string[] (see minimg.tsx) that we're currently viewing
let index = 0;

window.addEventListener("load", function () {
  const viewer = document.getElementById("viewer");
  viewer.src = files[0];
});

// listen for the the ArrowLeft event
document.addEventListener("keydown", function (event) {
  const keyName = event.key;


  if (keyName === "ArrowLeft" && index > 0) {
    index--;
  }

  if (keyName === "ArrowRight" && index < files.length - 1) {
    index++;
  }

  // update the image we're viewing
  const viewer = document.getElementById("viewer");
  viewer.src = files[index];

  // notify server of the event and current src
  const formData = new FormData();
  formData.append("key", event.key)
  formData.append("src", document.getElementById("viewer").src)
  fetch(window.location.href + "keydown",{ method:"POST", body: formData })
});
