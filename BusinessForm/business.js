const form = document.getElementById("waitlistForm");
const submitButton = document.getElementById("submitBtn");
const mainContent = document.querySelector(".main-content");
const successMessage = document.getElementById("successMessage");
const postcodeInput = document.getElementById("postcode");
const formStatus = document.getElementById("formStatus");


const backButton = document.getElementById("backToRoleSelection");

const addCertificationButton =
  document.getElementById("add-certification");

const certificationList =
  document.getElementById("certification-list");

const primaryCategory =
  document.getElementById("primary-category");

const otherCategoryGroup =
  document.getElementById("otherCategoryGroup");

const otherCategoryInput =
  document.getElementById("otherCategory");

const businessNameInput =
  document.getElementById("business-name");

const businessEmailInput =
  document.getElementById("business-email");

const portfolioLinks =
  document.querySelectorAll(".portfolio-link");


/* Back button */

backButton.addEventListener("click", () => {
  window.location.href = "../RoleSelection/roles.html";
});


/* Certifications */

addCertificationButton.addEventListener("click", () => {
  const certificationItem = document.createElement("div");

  certificationItem.className = "certification-item";

  certificationItem.innerHTML = `
    <input
      type="text"
      name="certifications[]"
      placeholder="e.g. Certified Makeup Artist"
      maxlength="100"
    >

    <button type="button" class="remove-certification">
      Remove
    </button>
  `;

  certificationList.appendChild(certificationItem);
});

certificationList.addEventListener("click", (event) => {
  const removeButton =
    event.target.closest(".remove-certification");

  if (!removeButton) {
    return;
  }

  const certificationItems =
    certificationList.querySelectorAll(".certification-item");

  if (certificationItems.length > 1) {
    removeButton.closest(".certification-item").remove();
  }
});


/* Main service: Other */

function updateOtherCategory() {
  const otherSelected = primaryCategory.value === "other";

  otherCategoryGroup.classList.toggle(
    "hidden",
    !otherSelected
  );

  otherCategoryInput.required = otherSelected;

  if (!otherSelected) {
    otherCategoryInput.value = "";
  }
}

primaryCategory.addEventListener(
  "change",
  updateOtherCategory
);

updateOtherCategory();


/* Checkbox questions */

const setupCheckboxQuestions = () => UrbanFormUtils.setupCheckboxQuestions({ validateOther: false });

setupCheckboxQuestions();

// Form Input Validation
function validateBusinessName() {
  const businessName = businessNameInput.value.trim();

  let errorMessage = "";

  if (!businessName) {
    errorMessage = "Please enter your business name.";
  } else if (businessName.length < 2) {
    errorMessage =
      "Business name must be at least 2 characters.";
  } else if (businessName.length > 80) {
    errorMessage =
      "Business name must be 80 characters or fewer.";
  }

  businessNameInput.setCustomValidity(errorMessage);

  return !errorMessage;
}

businessNameInput.addEventListener(
  "input",
  validateBusinessName
);

function validateBusinessEmail() {
  businessEmailInput.setCustomValidity("");

  const email = businessEmailInput.value.trim();

  if (!email) {
    businessEmailInput.setCustomValidity(
      "Please enter your business email."
    );
  } else if (businessEmailInput.validity.typeMismatch) {
    businessEmailInput.setCustomValidity(
      "Please enter a valid email address."
    );
  }

  return businessEmailInput.checkValidity();
}

businessEmailInput.addEventListener("input", () => {
  businessEmailInput.setCustomValidity("");
});

businessEmailInput.addEventListener("blur", () => {
  businessEmailInput.value =
    businessEmailInput.value.trim();

  validateBusinessEmail();
});

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

otherCategoryInput.addEventListener("input", () => {
  const isEmpty = !otherCategoryInput.value.trim();

  otherCategoryInput.setCustomValidity(
    primaryCategory.value === "other" && isEmpty
      ? "Please specify your main service."
      : ""
  );
});


function validatePortfolioLinks() {
  const hasLink = [...portfolioLinks].some(
    (input) => input.value.trim()
  );

  portfolioLinks[0].setCustomValidity(
    hasLink
      ? ""
      : "Please provide at least one portfolio or social media link."
  );
}

portfolioLinks.forEach((input) => {
  input.addEventListener("input", validatePortfolioLinks);
});

validatePortfolioLinks();

/* Form submission */

/* Google Apps Script web app URL */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyLzcA1-lVa3OTawov1OS7U16qbYYRg6K03X8UOG8Ez2gf9FsbhLhVNl1iVOGwjVBi4fg/exec";


/* Prepare form data */

const createSubmissionData = () => UrbanFormUtils.createSubmissionData(form, "business");

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

  validateBusinessName();
  validateBusinessEmail();
  validatePortfolioLinks();

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

    formStatus.textContent =
    "Your details have been submitted successfully.";

    /*
     * Restore dynamic form sections after resetting.
     */
    updateOtherCategory();
    setupCheckboxQuestions();
    validatePortfolioLinks();

    await showSuccessMessage();
    form.reset();
  } catch (error) {
    console.error("Waitlist submission failed:", error);

    formStatus.textContent =
    "We could not submit your details. Please check your connection and try again.";
	  
    alert(
      "We could not submit your details. Please check your connection and try again."
    );

    resetSubmitButton();
  }
});
