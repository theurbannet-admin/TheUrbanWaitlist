const form = document.getElementById("waitlistForm");
const submitButton = document.getElementById("submitBtn");
const mainContent = document.querySelector(".main-content");
const successMessage = document.getElementById("successMessage");
const formStatus = document.getElementById("formStatus");

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

const setupCheckboxQuestions = () => UrbanFormUtils.setupCheckboxQuestions({ validateOther: true });

setupCheckboxQuestions();


/* Form submission */

/* Prepare form data */

const createSubmissionData = () => UrbanFormUtils.createSubmissionData(form, "customer");

/* Display success screen */

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

/*
 * Waits for a CSS transition to finish, with a timer as a backstop so the
 * swap still happens if the transition never fires (reduced motion, a
 * backgrounded tab, or a browser that skips it).
 */
const afterTransition = (element, fallbackDelay) =>
  UrbanFormUtils.afterTransition(element, fallbackDelay, prefersReducedMotion);

async function showSuccessMessage() {
  /* Fade the form out first so it does not disappear in a single frame */
  mainContent.classList.add("is-leaving");
  await afterTransition(mainContent, 350);

  document.body.classList.add("showing-success");
  mainContent.classList.add("hidden");
  successMessage.classList.remove("hidden");

  successMessage.focus();

  successMessage.scrollIntoView({
    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    block: "center"
  });
}


/* Restore submit button */

function resetSubmitButton() {
  submitButton.disabled = false;
  submitButton.classList.remove("is-submitting");
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
  submitButton.classList.add("is-submitting");
  submitButton.textContent = "Submitting...";
  formStatus.textContent = "Submitting your details...";

  const submissionData = createSubmissionData();

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: submissionData
    });

    formStatus.textContent=
      "Your details have been submitted successfully.";

    await showSuccessMessage();
    form.reset();
  } catch (error) {
    console.error("Customer waitlist submission failed:", error);

    formStatus.textContent =
      "We could not submit your details. Please check your connection and try again.";

    alert(
      "We could not submit your details. Please check your connection and try again."
    );

    resetSubmitButton();
  }
});
