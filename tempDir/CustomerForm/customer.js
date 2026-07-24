const form = document.getElementById("waitlistForm");
const submitButton = document.getElementById("submitBtn");
const mainContent = document.querySelector(".main-content");
const successMessage = document.getElementById("successMessage");

const backButton = document.getElementById("backToRoleSelection");
const fullNameInput = document.getElementById("full-name");
const emailInput = document.getElementById("email");
const postcodeInput = document.getElementById("postcode");

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyLzcA1-lVa3OTawov1OS7U16qbYYRg6K03X8UOG8Ez2gf9FsbhLhVNl1iVOGwjVBi4fg/exec";

  /* Back button */

backButton.addEventListener("click", () => {
  window.location.href = "../RoleSelection/roles.html";
});


/* Full name */

function validateFullName() {
  const name = fullNameInput.value.trim();

  fullNameInput.setCustomValidity(
    name.length < 2
      ? "Please enter your full name."
      : ""
  );
}

fullNameInput.addEventListener("input", validateFullName);


/* Email */

function validateEmail() {
  emailInput.setCustomValidity("");

  if (!emailInput.value.trim()) {
    emailInput.setCustomValidity(
      "Please enter your email address."
    );
  } else if (emailInput.validity.typeMismatch) {
    emailInput.setCustomValidity(
      "Please enter a valid email address."
    );
  }
}

emailInput.addEventListener("input", () => {
  emailInput.setCustomValidity("");
});

emailInput.addEventListener("blur", () => {
  emailInput.value = emailInput.value.trim();
  validateEmail();
});


/* UK postcode formatting */

postcodeInput.addEventListener("blur", () => {
  const postcode = postcodeInput.value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  postcodeInput.value =
    postcode.length > 3
      ? `${postcode.slice(0, -3)} ${postcode.slice(-3)}`
      : postcode;
});


/* Checkbox questions */

function setupCheckboxQuestions() {
  const questions =
    document.querySelectorAll(".checkbox-question");

  questions.forEach((question) => {
    const checkboxes = [
      ...question.querySelectorAll('input[type="checkbox"]')
    ];

    if (!checkboxes.length) {
      return;
    }

    const minimumSelections =
      Number(question.dataset.min || 0);

    const maximumSelections =
      Number(question.dataset.max || checkboxes.length);

    const validationTarget = checkboxes[0];

    const otherCheckbox =
      question.querySelector(".other-option");

    const otherGroup =
      question.querySelector(".other-input-group");

    const otherInput =
      otherGroup?.querySelector("input");

    function updateQuestion() {
      const selectedCount =
        checkboxes.filter((checkbox) => checkbox.checked).length;

      validationTarget.setCustomValidity(
        selectedCount < minimumSelections
          ? "Please select at least one option."
          : ""
      );

      if (!otherCheckbox || !otherGroup || !otherInput) {
        return;
      }

      const otherSelected = otherCheckbox.checked;

      otherGroup.classList.toggle(
        "hidden",
        !otherSelected
      );

      otherInput.required = otherSelected;

      if (!otherSelected) {
        otherInput.value = "";
        otherInput.setCustomValidity("");
      } else {
        otherInput.setCustomValidity(
          otherInput.value.trim()
            ? ""
            : "Please provide an answer."
        );
      }
    }

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const selectedCount =
          checkboxes.filter(
            (option) => option.checked
          ).length;

        if (selectedCount > maximumSelections) {
          checkbox.checked = false;

          alert(
            `Please select up to ${maximumSelections} options.`
          );
        }

        updateQuestion();
      });
    });

    otherInput?.addEventListener("input", updateQuestion);

    updateQuestion();
  });
}

setupCheckboxQuestions();


/* Form submission */

/* Prepare form data */

function createSubmissionData() {
  const formData = new FormData(form);
  const submissionData = new URLSearchParams();

  submissionData.append("form_type", "customer");

  const groupedFields = new Map();

  for (const [name, value] of formData.entries()) {
    const cleanedValue = String(value).trim();

    /*
     * Converts names such as certifications[]
     * into certifications if brackets are ever used.
     */
    const normalisedName = name.endsWith("[]")
      ? name.slice(0, -2)
      : name;

    if (!groupedFields.has(normalisedName)) {
      groupedFields.set(normalisedName, []);
    }

    if (cleanedValue) {
      groupedFields.get(normalisedName).push(cleanedValue);
    }
  }

  for (const [name, values] of groupedFields.entries()) {
    submissionData.append(name, values.join(", "));
  }

  return submissionData;
}


/* Display success screen */

function showSuccessMessage() {
  document.body.classList.add("showing-success");
  mainContent.classList.add("hidden");
  successMessage.classList.remove("hidden");

  successMessage.focus();

  successMessage.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}


/* Restore submit button */

function resetSubmitButton() {
  submitButton.disabled = false;
  submitButton.textContent = "Join the Waitlist";
}


/* Form submission */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  validateFullName();
  validateEmail();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  const submissionData = createSubmissionData();

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: submissionData
    });

    form.reset();

    showSuccessMessage();
  } catch (error) {
    console.error("Customer waitlist submission failed:", error);

    alert(
      "We could not submit your details. Please check your connection and try again."
    );

    resetSubmitButton();
  }
});