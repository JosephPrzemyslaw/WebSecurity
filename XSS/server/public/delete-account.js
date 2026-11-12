const openButton = document.getElementById("deleteAccountOpen");
const dialog = document.getElementById("deleteAccountDialog");
const cancelButton = document.getElementById("deleteAccountCancel");

if (openButton instanceof HTMLButtonElement && dialog instanceof HTMLDialogElement) {
  openButton.addEventListener("click", () => {
    dialog.showModal();
  });

  if (cancelButton instanceof HTMLButtonElement) {
    cancelButton.addEventListener("click", () => {
      dialog.close();
    });
  }

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
}
