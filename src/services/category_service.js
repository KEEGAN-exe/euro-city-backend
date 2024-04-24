import { pool } from "../../database.js";

let categorySize = 0;

export const getAllCategories = async (req, res) => {
  const [result] = await pool.query(
    "SELECT category_id, category_name FROM categories WHERE state = TRUE"
  );
  res.status(200).json(result);
};

export const createCategory = async (req, res) => {
  const { category_name } = req.body;
  const data = await getCategorySize();
  categorySize = Math.max(categorySize, data.length) + 1;
  const category_id = `C00${
    categorySize < 10 && categorySize > 0 ? "0" : ""
  }${categorySize}`;
  const [result] = await pool.query("INSERT INTO categories VALUES (?,?,?)", [
    category_id,
    category_name,
    true,
  ]);
  if (result.affectedRows > 0) {
    return res.status(200).json({ message: "Categoria registrada" });
  }
  return res.status(500);
};

export const updateCategory = async (req, res) => {
  const { category_id } = req.params;
  const { category_name } = req.body;
  const [checkExistCategory] = await pool.query(
    "SELECT * FROM categories WHERE category_id = ? AND state = TRUE",
    [category_id]
  );
  if (checkExistCategory.length > 0) {
    const [resul] = await pool.query(
      "UPDATE categories SET category_name = IFNULL(?,category_name) WHERE category_id = ?",
      [category_name, category_id]
    );

    if (resul.affectedRows > 0) {
      return res.status(200).json({ message: "Categoria actualizada" });
    }
  }
};

export const deleteCategory = async (req, res) => {
  const { category_id } = req.params;
  const [checkExistCategory] = await pool.query(
    "SELECT * FROM categories WHERE category_id = ? AND state = TRUE",
    [category_id]
  );
  if (checkExistCategory.length > 0) {
    const [resul] = await pool.query(
      "UPDATE categories SET state = FALSE WHERE category_id = ?",
      [category_id]
    );

    if (resul.affectedRows > 0) {
      return res.status(200).json({ message: "Categoria eliminada" });
    }
  }
};

export const findCategoryById = async (req, res) => {
  const { category_id } = req.params;
  const [checkExistCategory] = await pool.query(
    "SELECT * FROM categories WHERE category_id = ? AND state = TRUE",
    [category_id]
  );
  if (checkExistCategory.length > 0) {
    const [result] = await pool.query(
      "SELECT category_id, category_name FROM categories WHERE category_id = ? AND state = TRUE",
      [category_id]
    );
    return res.status(200).json(result[0]);
  }
};

const getCategorySize = async () => {
  const [result] = await pool.query("SELECT * FROM categories");
  return result;
};
