import { pool } from "../../database.js";
import bcrypt from "bcrypt";

export const checkAccount = async (req, res) => {
  const { username, password } = req.body;
  const [checkUser] = await pool.query(
    `SELECT * FROM users WHERE username = ?`,
    [username]
  );

  if (checkUser.length > 0) {
    const user = checkUser[0];
    const confirmation = await bcrypt.compare(password, user.password);
    if (confirmation) {
      const user_detail_id = user.user_detail_id;
      const [user_detail] = await pool.query(
        "SELECT * FROM users_details WHERE user_detail_id = ?",
        [user_detail_id]
      );

      return res.status(200).json({
        message: "Inicio de sesion exitoso",
        username: user.username,
        email: user_detail[0].email,
        credential: user.credential,
        name: user_detail[0].first_name,
        last_name: user_detail[0].last_name,
      });
    }
  }
  return res.status(401).json({ message: "Credenciales incorrectas" });
};
