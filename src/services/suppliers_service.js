import { pool } from "../../database.js";

let supplierSize = 0;

export const getAllSuppliers = async (req, res) => {
  const [result] = await pool.query(
    "SELECT supplier_id, supplier_name, address, phone_number, email FROM suppliers WHERE state = TRUE"
  );
  return res.status(200).json(result);
};

export const createSupplier = async (req, res) => {
  const { supplier_name, address, phone_number, email } = req.body;
  const data = await getSupplierSize();
  supplierSize = Math.max(supplierSize, data.length) + 1;
  const supplierId = `SP00${
    supplierSize < 10 && supplierSize > 0 ? "0" : ""
  }${supplierSize}`;
  const [result] = await pool.query(
    "INSERT INTO suppliers VALUES (?,?,?,?,?,?)",
    [supplierId, supplier_name, address, phone_number, email, true]
  );
  if (result.affectedRows) {
    return res.status(200).json({ message: "Proveedor agregado" });
  }
};

export const updateSupplier = async (req, res) => {
  const { supplier_id } = req.params;
  const { supplier_name, address, phone_number, email } = req.body;
  const checkExistSupplier = await pool.query(
    "SELECT * FROM suppliers WHERE supplier_id = ? AND state = TRUE",
    [supplier_id]
  );
  if (checkExistSupplier) {
    const [result] = await pool.query(
      "UPDATE suppliers SET supplier_name = IFNULL(?,supplier_name), address = IFNULL(?,address), phone_number = IFNULL(?,phone_number), email = IFNULL(?,email) WHERE supplier_id = ?",
      [supplier_name, address, phone_number, email, supplier_id]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ meessage: "Proveedor actualizado" });
    }
  }
};

export const deleteSupplier = async (req, res) => {
  const { supplier_id } = req.params;
  const checkExistSupplier = await pool.query(
    "SELECT * FROM suppliers WHERE supplier_id = ? AND state = TRUE",
    [supplier_id]
  );
  if (checkExistSupplier) {
    const [result] = await pool.query(
      "UPDATE suppliers SET state = FALSE WHERE supplier_id = ?",
      [supplier_id]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Proveedor eliminado" });
    }
  }
  return res.status(500).json({ message: "Error en el servidor" });
};

export const findSupplierById = async (req, res) => {
  const { supplier_id } = req.params;
  const [checkExistSupplier] = await pool.query(
    "SELECT * FROM suppliers WHERE supplier_id = ? AND state = TRUE",
    [supplier_id]
  );
  if (checkExistSupplier) {
    const [result] = await pool.query(
      "SELECT supplier_id, supplier_name, address, phone_number, email FROM suppliers WHERE supplier_id = ? AND state = TRUE",
      [supplier_id]
    );
    return res.status(200).json(result[0]);
  }
};

const getSupplierSize = async () => {
  const [result] = await pool.query("SELECT * FROM suppliers");
  return result;
};
