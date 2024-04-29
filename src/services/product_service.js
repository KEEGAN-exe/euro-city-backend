import { pool } from "../../database.js";

let productSize = 0;

export const getAllProducts = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT p.product_id, p.product_name, DATE_FORMAT(p.create_date, '%Y-%m-%d') as create_date, c.category_name, p.stock, p.price, p.image FROM products p JOIN categories c ON p.category_id = c.category_id WHERE p.state = true"
    );
    if (result) {
      return res.status(200).json(result);
    }
    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { product_name, price, image, category_id } = req.body;
    if (!product_name || !price || !image || !category_id) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }
    const uniqueData = await checkUniqueNameProduct(product_name);
    if (uniqueData) {
      return res
        .status(400)
        .json({ message: "Datos duplicados, prueba con otros datos" });
    }
    const [productGenerated] = await generateProductId();
    const [result] = await pool.query(
      "INSERT INTO products VALUES (?,?,?,?,?,?,?,?)",
      [
        productGenerated.product_id,
        product_name,
        productGenerated.currentDate,
        0,
        price,
        image,
        true,
        category_id,
      ]
    );
    if (result.affectedRows > 0) {
      return res.status(201).json({ message: "Producto creado" });
    }
    return res.status(500).json({ message: "Error al crear al producto" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { product_name, stock, image, price } = req.body;
    if (!(product_name || stock || image || price)) {
      return res.status(400).json({
        message:
          "Se requiere al menos el nombre del producto, stock, imagen o precio",
      });
    }
    const productExist = await checkProductExist(product_id);
    if (!productExist) {
      return res.status(404).json({ message: "El producto no existe" });
    }
    const uniqueData = await checkUniqueNameProduct(product_name);
    if (uniqueData) {
      return res
        .status(400)
        .json({ message: "Ya existe un producto con esta informacion" });
    }
    const [result] = await pool.query(
      "UPDATE products SET product_name = IFNULL(?,product_name), stock = IFNULL(?,stock), image = IFNULL(?,image), price = IFNULL(?,price) WHERE product_id = ?",
      [product_name, stock, image, price, product_id]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Producto actualizado" });
    }
    return res.status(500).json({ message: "Error al actualizar el producto" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    if (!product_id) {
      return res.status(400).json({ message: "ID del producto requerido" });
    }
    const existProduct = await checkProductExist(product_id);
    if (!existProduct) {
      return res.status(404).json({ message: "El producto no existe" });
    }
    const [result] = await pool.query(
      "UPDATE products SET state = false WHERE product_id = ?",
      [product_id]
    );
    if (result.affectedRows > 0) {
      return res.status(202).json({ message: "Producto eliminado" });
    }
    return res.status(500).json({ message: "Error al eliminar el producto" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const findProductById = async (req, res) => {
  try {
    const { product_id } = req.params;
    if (!product_id) {
      return res.status(400).json({ message: "ID del producto requerido" });
    }
    const existProduct = await checkProductExist(product_id);
    if (!existProduct) {
      return res.status(404).json({ message: "El producto no existe" });
    }
    const [result] = await pool.query(
      "SELECT p.product_id, p.product_name, p.create_date, c.category_name, p.stock, p.price, p.image FROM products p JOIN categories c ON p.category_id = c.category_id WHERE p.state = true AND p.product_id = ?",
      [product_id]
    );
    if (result.length > 0) {
      return res.status(202).json(result[0]);
    }
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

const getProductSize = async () => {
  try {
    const [result] = await pool.query("SELECT * FROM products");
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const checkUniqueNameProduct = async (product_name) => {
  try {
    const [data] = await pool.query(
      "SELECT * FROM products WHERE product_name = ? AND state = TRUE",
      [product_name]
    );
    return data.length > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const generateProductId = async () => {
  const data = await getProductSize();
  const date = new Date();
  const currentDate = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
  productSize = Math.max(productSize, data.length) + 1;
  const productId = `P00${
    productSize < 10 && productSize > 0 ? "0" : ""
  }${productSize}`;
  return [{ product_id: productId, currentDate }];
};

const checkProductExist = async (product_id) => {
  try {
    const [data] = await pool.query(
      "SELECT * FROM products WHERE product_id = ? AND state = TRUE",
      [product_id]
    );
    return data.length > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
};
