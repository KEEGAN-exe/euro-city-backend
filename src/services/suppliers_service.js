import { pool } from "../../database.js";

let supplierSize = 0;

export const getAllSuppliers = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT supplier_id, supplier_name, address, phone_number, email FROM suppliers WHERE state = TRUE"
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

export const createSupplier = async (req, res) => {
  try {
    const { supplier_name, address, phone_number, email } = req.body;
    if (!supplier_name || !address || !phone_number || !email) {
      return res.status(400).json({
        message:
          "El nombre, direccion, numero de telefono y correo son requeridos",
      });
    }
    const uniqueData = await checkUniqueData(
      supplier_name,
      address,
      phone_number,
      email
    );
    if (uniqueData) {
      return res.status(400).json({
        message: "Los datos deben ser unicos",
      });
    }
    const supplier_id = await generateSupplierId();
    const [result] = await pool.query(
      "INSERT INTO suppliers VALUES (?,?,?,?,?,?)",
      [supplier_id, supplier_name, address, phone_number, email, true]
    );
    if (result.affectedRows > 0) {
      return res.status(201).json({ message: "Proveedor agregado" });
    }
    return res.status(500).json({ message: "Error al crear al proveedor" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { supplier_id } = req.params;
    const { supplier_name, address, phone_number, email } = req.body;
    if (!supplier_id) {
      return res.status(400).json({ message: "ID del proveedor requerido" });
    }
    const uniqueData = await checkUniqueData(
      supplier_name,
      address,
      phone_number,
      email
    );
    if (uniqueData) {
      return res.status(400).json({
        message: "Los datos deben ser unicos",
      });
    }
    const supplierExist = await checkExistSupplier(supplier_id);
    if (!supplierExist) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    const [result] = await pool.query(
      "UPDATE suppliers SET supplier_name = IFNULL(?,supplier_name), address = IFNULL(?,address), phone_number = IFNULL(?,phone_number), email = IFNULL(?,email) WHERE supplier_id = ?",
      [supplier_name, address, phone_number, email, supplier_id]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ meessage: "Proveedor actualizado" });
    }
    return res
      .status(500)
      .json({ message: "Error al actualizar al proveedor" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { supplier_id } = req.params;
    if (!supplier_id) {
      return res.status(400).json({ message: "ID del proveedor requerido" });
    }
    const supplierExist = await checkExistSupplier(supplier_id);
    if (!supplierExist) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    const [result] = await pool.query(
      "UPDATE suppliers SET state = FALSE WHERE supplier_id = ?",
      [supplier_id]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Proveedor eliminado" });
    }
    return res.status(500).json({ message: "Error al eliminar al proveedor" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const findSupplierById = async (req, res) => {
  try {
    const { supplier_id } = req.params;
    if (!supplier_id) {
      return res.status(400).json({ message: "ID del proveedor requerido" });
    }
    const supplierExist = await checkExistSupplier(supplier_id);
    if (!supplierExist) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    const [result] = await pool.query(
      "SELECT supplier_id, supplier_name, address, phone_number, email FROM suppliers WHERE supplier_id = ? AND state = TRUE",
      [supplier_id]
    );
    if (result) {
      return res.status(200).json(result[0]);
    }
    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

const getSupplierSize = async () => {
  const [result] = await pool.query("SELECT * FROM suppliers");
  return result;
};

const generateSupplierId = async () => {
  const data = await getSupplierSize();
  supplierSize = Math.max(supplierSize, data.length) + 1;
  const supplier_id = `SP00${
    supplierSize < 10 && supplierSize > 0 ? "0" : ""
  }${supplierSize}`;
  return supplier_id;
};

const checkUniqueData = async (supplier_name, address, phone_number, email) => {
  try {
    const [data] = await pool.query(
      "SELECT * FROM suppliers WHERE supplier_name = ? OR address = ? OR phone_number = ? OR email = ? AND state = TRUE",
      [supplier_name, address, phone_number, email]
    );
    return data.length > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const checkExistSupplier = async (supplier_id) => {
  try {
    const [data] = await pool.query(
      "SELECT * FROM suppliers WHERE supplier_id = ? AND state = TRUE",
      [supplier_id]
    );
    return data.length > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
};
