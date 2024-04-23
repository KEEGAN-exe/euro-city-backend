import { pool } from "../../database.js";

let productSize = 0;

export const getAllProducts = async (req, res) => {
  const [result] = await pool.query(
    "SELECT product_id, product_name, create_date, stock, price, image FROM products WHERE state = true"
  );
  res.status(200).json(result);
};

export const createProduct = async (req, res) => {
  const { product_name, price, image } = req.body;
  const data = await getProductSize();
  const date = new Date();
  const currentDate = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
  if (productSize < data.length) productSize = data.length;
  productSize++;
  const productId = `P000${productSize}`;
  const [result] = await pool.query(
    "INSERT INTO products VALUES (?,?,?,?,?,?,?)",
    [productId, product_name, currentDate, 0, price, image, true]
  );
  if (result.affectedRows) {
    return res.status(202).json({ message: "XD" });
  }
  return res.status(500);
};

export const deleteProduct = async (req, res) => {
  const { product_id, credential } = req.body;
  if (credential) {
    const [result] = await pool.query(
      "UPDATE products SET state = false WHERE product_id = ?",
      [product_id]
    );
    if (result.affectedRows) {
      return res.status(202).json({ message: "Producto eliminado" });
    }
  }
  return res.status(500);
};

export const getProductSize = async (req, res) => {
  const [result] = await pool.query("SELECT * FROM products");
  return result;
};
