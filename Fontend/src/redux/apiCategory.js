import {
    getCategoryStart,
    getCategorySuccess,
    getCategoryFailed,
    createCategoryStart,
    createCategorySuccess,
    createCategoryFailed,
    updateCategoryStart,
    updateCategorySuccess,
    updateCategoryFailed,
    deleteCategoryStart,
    deleteCategorySuccess,
    deleteCategoryFailed,
} from "./categorySlice";

export const getCategory = async (accessToken, dispatch, axiosJWT) => {
    dispatch(getCategoryStart());
    try {
        const res = await axiosJWT.get("http://localhost:8000/v1/categorys", {
            headers: { token: `Bearer ${accessToken}` },
        });
        dispatch(getCategorySuccess(res.data));
        return res.data;
    } catch (err) {
        dispatch(getCategoryFailed());
        console.error("Lỗi khi tải danh mục:", err);
        throw err;
    }
};

export const createCategory = async (dispatch, categoryData, accessToken, axiosJWT) => {
    dispatch(createCategoryStart());
    try {
        const res = await axiosJWT.post("http://localhost:8000/v1/categorys", categoryData, {
            headers: { token: `Bearer ${accessToken}` },
        });
        dispatch(createCategorySuccess(res.data));
        return res.data;
    } catch (err) {
        dispatch(createCategoryFailed());
        console.error("Lỗi khi tạo danh mục:", err);
        throw err;
    }
};

export const updateCategory = async (categoryId, updatedData, accessToken, dispatch, axiosJWT) => {
    dispatch(updateCategoryStart());
    try {
        const res = await axiosJWT.put(`http://localhost:8000/v1/categorys/${categoryId}`, updatedData, {
            headers: { token: `Bearer ${accessToken}` },
        });
        dispatch(updateCategorySuccess(res.data));
        return res.data;
    } catch (err) {
        dispatch(updateCategoryFailed());
        console.error("Lỗi khi cập nhật danh mục:", err);
        throw err;
    }
};

export const deleteCategory = async (categoryId, accessToken, dispatch, axiosJWT) => {
    dispatch(deleteCategoryStart());
    try {
        await axiosJWT.delete(`http://localhost:8000/v1/categorys/${categoryId}`, {
            headers: { token: `Bearer ${accessToken}` },
        });
        dispatch(deleteCategorySuccess(categoryId));
    } catch (err) {
        dispatch(deleteCategoryFailed());
        console.error("Lỗi khi xóa danh mục:", err);
        throw err;
    }
};