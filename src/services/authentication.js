import { pool } from "../../database.js";
import bcrypt from "bcrypt";

export const checkAccount = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userExist = await checkExistUser(username);
    if (userExist.length > 0) {
      const confirmation = await bcrypt.compare(password, userExist[0].password);
      if (confirmation) {
        const user_detail_id = userExist[0].user_detail_id;
        const [userDetailData] = await pool.query(
          "SELECT * FROM users_details WHERE user_detail_id = ?",
          [user_detail_id]
        );

        return res.status(200).json({
          message: "Inicio de sesion exitoso",
          username: userExist[0].username,
          email: userDetailData[0].email,
          credential: userExist[0].credential,
          name: userDetailData[0].first_name,
          last_name: userDetailData[0].last_name,
        });
      }
    }
    return res.status(401).json({ message: "Credenciales incorrectas" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

const checkExistUser = async (username) => {
  try {
    const [result] = await pool.query(
      "SELECT * FROM users WHERE username = ? AND state = TRUE",
      [username]
    );
    return result.length > 0 ? result : [];
  } catch (error) {
    console.log(error);
    return [];
  }
};
