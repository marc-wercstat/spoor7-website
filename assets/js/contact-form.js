(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = form.querySelector(".form-status");
  var submitBtn = form.querySelector("button[type=submit]");
  var msg = {
    sending: form.dataset.msgSending || "Versturen…",
    success: form.dataset.msgSuccess || "Bedankt! We nemen zo snel mogelijk contact op.",
    error: form.dataset.msgError || "Er ging iets mis. Probeer het later opnieuw.",
    network: form.dataset.msgNetwork || "Netwerkfout. Probeer het later opnieuw.",
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("pending", msg.sending);
    submitBtn.disabled = true;

    var fd = new FormData(form);
    fetch(form.action, {
      method: "POST",
      body: fd,
      headers: { "Accept": "application/json" },
    })
      .then(function (resp) {
        return resp.json().then(function (data) { return { ok: resp.ok, data: data }; });
      })
      .then(function (res) {
        if (res.ok && res.data && res.data.ok) {
          form.reset();
          setStatus("success", msg.success);
        } else {
          setStatus("error", (res.data && res.data.error) || msg.error);
        }
      })
      .catch(function () {
        setStatus("error", msg.network);
      })
      .then(function () {
        submitBtn.disabled = false;
      });
  });

  function setStatus(kind, text) {
    status.textContent = text;
    status.className = "form-status is-" + kind;
  }
})();
