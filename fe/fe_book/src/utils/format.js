import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const formats = [
  "DD-MM-YYYY HH:mm:ss",
  "DD-MM-YYYY",
  "DD/MM/YYYY HH:mm:ss",
  "DD/MM/YYYY",
  "YYYY-MM-DD HH:mm:ss",
  "YYYY-MM-DD",
  "YYYY-MM-DDTHH:mm:ss.SSSZ",
  "YYYY-MM-DDTHH:mm:ss"
];

const parseDateString = (date) => {
  if (!date) return null;
  if (typeof date === "string") {
    const parsed = dayjs(date, formats);
    if (parsed.isValid()) {
      return parsed;
    }
  }
  return dayjs(date);
};

export const formatDate = (date) => {
  if (!date) return "";
  const p = parseDateString(date);
  if (!p || !p.isValid()) return "Invalid Date";
  return p.format("DD/MM/YYYY");
};

export const formatDateTime = (date) => {
  if (!date) return "";
  const p = parseDateString(date);
  if (!p || !p.isValid()) return "Invalid Date";
  return p.format("DD/MM/YYYY HH:mm");
};
