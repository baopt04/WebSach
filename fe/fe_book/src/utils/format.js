// tiền , ngày , text
import dayjs from "dayjs";
export const formatDate = (date) => {
    if (!date) return "";
    return dayjs(date).format("DD/MM/YYYY");
};