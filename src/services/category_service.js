import { pool } from "../../database.js";
let categorySize = 0;

export const getAllCategories = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT category_id, category_name FROM categories WHERE state = TRUE"
    );
    if (result) {
      return res.status(200).json(result);
    }
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name) {
      return res
        .status(400)
        .json({ message: "Nombre de la categoria requerido" });
    }
    const uniqueData = await checkUniqueCategory(category_name);
    if (uniqueData) {
      return res
        .status(400)
        .json({ message: "El nombre de la categoria debe ser unico" });
    }
    const category_id = await generateCategoryId();
    const [result] = await pool.query("INSERT INTO categories VALUES (?,?,?)", [
      category_id,
      category_name,
      true,
    ]);
    if (result.affectedRows > 0) {
      return res.status(201).json({ message: "Categoria registrada" });
    }
    return res.status(500).json({ message: "Error al crear categoría" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const { category_name } = req.body;
    if (!category_name) {
      return res.status(400).json({
        message: "Nombre de la categoria requerido",
      });
    }
    const categoryExists = await checkExistCategory(category_id);
    if (!categoryExists) {
      return res.status(404).json({ message: "Categoria no encontrada" });
    }
    const uniqueData = await checkUniqueCategory(category_name);
    if (uniqueData) {
      return res
        .status(400)
        .json({ message: "El nombre de la categoria debe ser unico" });
    }
    const [result] = await pool.query(
      "UPDATE categories SET category_name = IFNULL(?,category_name) WHERE category_id = ?",
      [category_name, category_id]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Categoria actualizada" });
    }
    return res
      .status(500)
      .json({ message: "Error al actualizar la categoría" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    if (!category_id) {
      return res.status(400).json({
        message: "ID de la categoria requerido",
      });
    }
    const categoryExists = await checkExistCategory(category_id);
    if (!categoryExists) {
      return res.status(404).json({ message: "Categoria no encontrada" });
    }
    const [resul] = await pool.query(
      "UPDATE categories SET state = FALSE WHERE category_id = ?",
      [category_id]
    );
    if (resul.affectedRows > 0) {
      return res.status(200).json({ message: "Categoria eliminada" });
    }
    return res.status(500).json({ message: "Error al eliminar la categoría" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const findCategoryById = async (req, res) => {
  try {
    const { category_id } = req.params;
    if (!category_id) {
      return res.status(400).json({
        message: "ID de la categoria requerido",
      });
    }
    const categoryExists = await checkExistCategory(category_id);
    if (!categoryExists) {
      return res.status(404).json({ message: "Categoria no encontrada" });
    }
    const [result] = await pool.query(
      "SELECT category_id, category_name FROM categories WHERE category_id = ? AND state = TRUE",
      [category_id]
    );
    if (result) {
      return res.status(200).json(result[0]);
    }
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

const getCategorySize = async () => {
  const [result] = await pool.query("SELECT * FROM categories");
  return result;
};

const checkExistCategory = async (category_id) => {
  try {
    const [existingCategory] = await pool.query(
      "SELECT * FROM categories WHERE category_id = ? AND state = TRUE",
      [category_id]
    );
    return existingCategory.length > 0;
  } catch (error) {
    console.error("Error al verificar la existencia de la categoría:", error);
    return false;
  }
};

const generateCategoryId = async () => {
  const data = await getCategorySize();
  categorySize = Math.max(categorySize, data.length) + 1;
  const category_id = `C00${
    categorySize < 10 && categorySize > 0 ? "0" : ""
  }${categorySize}`;
  return category_id;
};

const checkUniqueCategory = async (category_name) => {
  const [data] = await pool.query(
    "SELECT * FROM categories WHERE category_name = ? AND state = TRUE",
    [category_name]
  );
  return data.length > 0;
};
