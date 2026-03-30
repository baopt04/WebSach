// tiền , ngày , text
import dayjs from "dayjs";
export const formatDate = (date) => {
    if (!date) return "";
    return dayjs(date).format("DD/MM/YYYY");
};

// export const formatDate = (date) => {
//   if (!date) return "";
//   const [day, month, year] = date.split("-");
//   return dayjs(`${year}-${month}-${day}`).format("DD/MM/YYYY");
// };