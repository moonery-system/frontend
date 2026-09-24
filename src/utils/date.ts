function formatDateTime(dateInput: Date) {
  if (!dateInput) return "Not available";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export { formatDateTime };
