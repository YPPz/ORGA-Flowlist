import { createContext, useContext } from "react";

const CategoryContext = createContext(null);

export const useCategories = () => useContext(CategoryContext);

export default CategoryContext;
