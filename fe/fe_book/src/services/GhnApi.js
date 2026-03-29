import axios from "axios";
import { GHN_CONFIG } from "../config/GhnConfig";

const ghnClient = axios.create({
    baseURL: "https://online-gateway.ghn.vn/shiip/public-api",
    headers: {
        Token: GHN_CONFIG.TOKEN,
        ShopId: GHN_CONFIG.SHOP_ID,
    },
});

export const getProvinces = async () => {
    const res = await ghnClient.get("/master-data/province");
    return res.data;
};

export const getDistricts = async (provinceId) => {
    if (!provinceId) throw new Error("provinceId is undefined");
    const res = await ghnClient.get("/master-data/district", {
        params: { province_id: provinceId },
    });
    return res.data;
};

export const getWards = async (districtId) => {
    if (!districtId) throw new Error("districtId is undefined");
    const res = await ghnClient.get("/master-data/ward", {
        params: { district_id: districtId },
    });
    return res.data;
};

export const calculateShippingFee = async ({ toDistrictId, toWardCode, weight = 10, height = 50, length = 20, width = 20, serviceTypeId = GHN_CONFIG.SHOP.SERVICE_TYPE_ID }) => {
    if (!toDistrictId || !toWardCode) throw new Error("toDistrictId hoặc toWardCode không hợp lệ");

    const res = await axios.get("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee", {
        params: {
            insurance_value: 0,
            coupon: "",
            service_type_id: serviceTypeId,
            from_district_id: GHN_CONFIG.SHOP.FROM_DISTRICT_ID,
            from_ward_code: GHN_CONFIG.SHOP.FROM_WARD_CODE,
            to_district_id: parseInt(toDistrictId),
            to_ward_code: String(toWardCode),
            height,
            length,
            weight,
            width,
        },
        headers: {
            token: GHN_CONFIG.TOKEN,
            shop_id: GHN_CONFIG.SHOP_ID,
        },
    });

    return res.data;
};
export const calculateLeadTime = async ({ toDistrictId, toWardCode, serviceId = 53320 }) => {
    if (!toDistrictId || !toWardCode) throw new Error("toDistrictId hoặc toWardCode không hợp lệ");

    const res = await axios.get("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime", {
        params: {
            from_district_id: GHN_CONFIG.SHOP.FROM_DISTRICT_ID,
            from_ward_code: GHN_CONFIG.SHOP.FROM_WARD_CODE,
            to_district_id: parseInt(toDistrictId),
            to_ward_code: String(toWardCode),
            service_id: serviceId,
        },
        headers: {
            token: GHN_CONFIG.TOKEN,
            shop_id: GHN_CONFIG.SHOP_ID,
        },
    });

    return res.data;
};