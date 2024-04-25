import { pool } from "../../database.js";

let productSize = 0;

export const getAllProducts = async (req, res) => {
  const [result] = await pool.query(
    "SELECT p.product_id, p.product_name, p.create_date, c.category_name, p.stock, p.price, p.image FROM products p JOIN categories c ON p.category_id = c.category_id WHERE p.state = true"
  );
  res.status(200).json(result);
};

export const createProduct = async (req, res) => {
  const { product_name, price, image, category_id } = req.body;
  const data = await getProductSize();
  const date = new Date();
  const currentDate = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
  productSize = Math.max(productSize, data.length) + 1;
  const productId = `P00${
    productSize < 10 && productSize > 0 ? "0" : ""
  }${productSize}`;
  const [result] = await pool.query(
    "INSERT INTO products VALUES (?,?,?,?,?,?,?,?)",
    [productId, product_name, currentDate, 0, price, image, true, category_id]
  );
  if (result.affectedRows) {
    return res.status(202).json({ message: "Producto creado" });
  }
  return res.status(500);
};

export const updateProduct = async (req, res) => {
  const { product_id } = req.params;
  const { product_name, stock, image, price } = req.body;
  const [checckExistProduct] = await pool.query(
    "SELECT * FROM products WHERE product_id = ? AND state = TRUE",
    [product_id]
  );
  if (checckExistProduct.length > 0) {
    const [result] = await pool.query(
      "UPDATE products SET product_name = IFNULL(?,product_name), stock = IFNULL(?,stock), image = IFNULL(?,image), price = IFNULL(?,price) WHERE product_id = ?",
      [product_name, stock, image, price, product_id]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Producto actualizado" });
    }

    return res.status(500);
  }
};

export const deleteProduct = async (req, res) => {
  const { product_id } = req.params;
  const [checckExistProduct] = await pool.query(
    "SELECT * FROM products WHERE product_id = ? AND state = TRUE",
    [product_id]
  );
  if (checckExistProduct.length > 0) {
    const [result] = await pool.query(
      "UPDATE products SET state = false WHERE product_id = ?",
      [product_id]
    );
    if (result.affectedRows > 0) {
      return res.status(202).json({ message: "Producto eliminado" });
    }
  }
  return res.status(500);
};

export const findProductById = async (req, res) => {
  const { product_id } = req.params;
  const [checckExistProduct] = await pool.query(
    "SELECT * FROM products WHERE product_id = ? AND state = TRUE",
    [product_id]
  );
  if (checckExistProduct.length > 0) {
    const [result] = await pool.query(
      "SELECT p.product_id, p.product_name, p.create_date, c.category_name, p.stock, p.price, p.image FROM products p JOIN categories c ON p.category_id = c.category_id WHERE p.state = true",
      [product_id]
    );
    return res.status(202).json(result[0]);
  }
  return res.status(500);
};

const getProductSize = async (req, res) => {
  const [result] = await pool.query("SELECT * FROM products");
  return result;
};
