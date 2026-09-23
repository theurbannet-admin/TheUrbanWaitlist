(() => {
  function setupCheckboxQuestions({ selector = ".checkbox-question", validateOther = false } = {}) {
    document.querySelectorAll(selector).forEach((question) => {
      const checkboxes = [...question.querySelectorAll('input[type="checkbox"]')];
      if (!checkboxes.length) return;

      const minimum = Number(question.dataset.min || 0);
      const maximum = Number(question.dataset.max || checkboxes.length);
      const validationTarget = checkboxes[0];
      const otherCheckbox = question.querySelector(".other-option");
      const otherGroup = question.querySelector(".other-input-group");
      const otherInput = otherGroup?.querySelector("input");

      const update = () => {
        const selected = checkboxes.filter((checkbox) => checkbox.checked).length;
        validationTarget.setCustomValidity(selected < minimum ? "Please select at least one option." : "");

        if (!otherCheckbox || !otherGroup || !otherInput) return;
        const otherSelected = otherCheckbox.checked;
        otherGroup.classList.toggle("hidden", !otherSelected);
        otherInput.required = otherSelected;
        if (!otherSelected) {
          otherInput.value = "";
          otherInput.setCustomValidity("");
        } else if (validateOther) {
          otherInput.setCustomValidity(otherInput.value.trim() ? "" : "Please provide an answer.");
        }
      };

      checkboxes.forEach((checkbox) => checkbox.addEventListener("change", () => {
        if (checkboxes.filter((option) => option.checked).length > maximum) {
          checkbox.checked = false;
          alert(`Please select up to ${maximum} options.`);
        }
        update();
      }));
      otherInput?.addEventListener("input", update);
      update();
    });
  }

  function createSubmissionData(form, formType) {
    const grouped = new Map();
    const data = new URLSearchParams();
    data.append("form_type", formType);
    for (const [name, value] of new FormData(form).entries()) {
      const key = name.endsWith("[]") ? name.slice(0, -2) : name;
      const cleaned = String(value).trim();
      if (!grouped.has(key)) grouped.set(key, []);
      if (cleaned) grouped.get(key).push(cleaned);
    }
    for (const [name, values] of grouped) data.append(name, values.join(", "));
    return data;
  }

  function afterTransition(element, fallbackDelay, prefersReducedMotion) {
    return new Promise((resolve) => {
      if (prefersReducedMotion.matches) return resolve();
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        element.removeEventListener("transitionend", finish);
        resolve();
      };
      element.addEventListener("transitionend", finish);
      setTimeout(finish, fallbackDelay);
    });
  }

  window.UrbanFormUtils = { setupCheckboxQuestions, createSubmissionData, afterTransition };
})();
