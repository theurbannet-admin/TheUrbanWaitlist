// Server-side validation. The client already enforces these rules via
// setCustomValidity()/checkValidity(), but the endpoint is public (the
// client-side JS that calls it is readable by anyone), so every rule here
// has to be re-checked — the client's HTML5 validation is not a security
// boundary, just a UX nicety.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value) {
  return isNonEmptyString(value) && EMAIL_PATTERN.test(value.trim());
}

// Checkbox groups arrive from the client already joined into one
// comma-separated string (see createSubmissionData() in customer.js /
// business.js). Counting commas is an approximation of the selected count,
// but it matches how the client itself builds and later would redisplay
// the value, and is enough for defense-in-depth given the client already
// enforces the real min/max via data-min/data-max.
function selectionCount(value) {
  if (!isNonEmptyString(value)) {
    return 0;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function checkGroup(details, field, { min, max }, errors) {
  const count = selectionCount(details[field]);

  if (count < min) {
    errors.push(`${field} needs at least ${min} selection(s).`);
  } else if (count > max) {
    errors.push(`${field} allows at most ${max} selection(s).`);
  }
}

export function validateCustomerSubmission(body) {
  const errors = [];

  const name = typeof body.full_name === "string" ? body.full_name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (name.length < 2) {
    errors.push("full_name must be at least 2 characters.");
  }

  if (!isValidEmail(email)) {
    errors.push("email must be a valid email address.");
  }

  if (!isNonEmptyString(body.postcode)) {
    errors.push("postcode is required.");
  }

  if (!isNonEmptyString(body.age_range)) {
    errors.push("age_range is required.");
  }

  checkGroup(body, "service_interests", { min: 1, max: 3 }, errors);
  checkGroup(body, "discovery_method", { min: 1, max: 3 }, errors);
  checkGroup(body, "found_urbannet", { min: 1, max: 3 }, errors);
  checkGroup(body, "provider_priorities", { min: 1, max: 5 }, errors);

  if (errors.length > 0) {
    return { valid: false, message: errors.join(" ") };
  }

  const {
    form_type: _formType,
    submission_id: _submissionId,
    full_name: _fullName,
    email: _email,
    postcode: _postcode,
    ...rest
  } = body;

  return {
    valid: true,
    name,
    email,
    details: { postcode: body.postcode.trim(), ...rest },
  };
}

export function validateBusinessSubmission(body) {
  const errors = [];

  const name = typeof body.business_name === "string" ? body.business_name.trim() : "";
  const email = typeof body.business_email === "string" ? body.business_email.trim() : "";

  if (name.length < 2 || name.length > 80) {
    errors.push("business_name must be between 2 and 80 characters.");
  }

  if (!isValidEmail(email)) {
    errors.push("business_email must be a valid email address.");
  }

  if (!isNonEmptyString(body.postcode)) {
    errors.push("postcode is required.");
  }

  if (!isNonEmptyString(body.primary_category)) {
    errors.push("primary_category is required.");
  }

  if (body.primary_category === "other" && !isNonEmptyString(body.other_category)) {
    errors.push("other_category is required when primary_category is 'other'.");
  }

  const portfolioFields = [
    "tiktokLink",
    "instagramLink",
    "twitterLink",
    "facebookLink",
    "linkedInLink",
    "youtubeLink",
    "otherLink",
  ];

  if (!portfolioFields.some((field) => isNonEmptyString(body[field]))) {
    errors.push("at least one portfolio or social media link is required.");
  }

  checkGroup(body, "service_categories", { min: 1, max: 4 }, errors);
  checkGroup(body, "booking_method", { min: 1, max: 3 }, errors);
  checkGroup(body, "found_urbannet", { min: 1, max: 3 }, errors);

  if (errors.length > 0) {
    return { valid: false, message: errors.join(" ") };
  }

  const {
    form_type: _formType,
    submission_id: _submissionId,
    business_name: _businessName,
    business_email: _businessEmail,
    postcode: _postcode,
    ...rest
  } = body;

  return {
    valid: true,
    name,
    email,
    details: { postcode: body.postcode.trim(), ...rest },
  };
}
