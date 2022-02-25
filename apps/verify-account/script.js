const codes = document.querySelectorAll(".code");

codes[0].focus();

codes.forEach((code, idx) => {
  code.addEventListener("keydown", (e) => {
    if (e.key >= 0 && e.key <= 9) {
      codes[idx].value = "";
      setTimeout(() => codes[idx == 5 ? 5 : idx + 1].focus(), 10);
    } else if (e.key === "Backspace") {
      setTimeout(() => codes[idx == 0 ? 0 : idx - 1].focus(), 10);
    }
  });
});

document.querySelectorAll(".code").forEach((item) => {
  item.addEventListener("keyup", (event) => {
    verifyCode();
  });
});

function verifyCode() {
  for (let index = 0; index < codes.length; index++) {
    if (codes[index].value != 9) {
      return false;
    }
  }
  success();
  return true;
}

function success() {
  codes.forEach((item) => {
    item.style.display = "none";
  });

  document.getElementById("msg").style.display = "none";
  document.getElementById("title").style.display = "none";

  const message = document.querySelector(".info");
  message.innerHTML = "Success";
  message.classList.add("success");
}
