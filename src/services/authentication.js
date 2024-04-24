import { pool } from "../../database.js";
import bcrypt from "bcrypt";

export const checkAccount = async (req, res) => {
  const { username, password } = req.body;
  const [result] = await pool.query(`SELECT * FROM users WHERE username = ?`, [
    username,
  ]);

  const user = result[0];
  const confirmation = await bcrypt.compare(password, user.password);

  if (confirmation) {
    return res.status(200).json({ message: "Inicio de sesion exitoso" });
  } else {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }
};
