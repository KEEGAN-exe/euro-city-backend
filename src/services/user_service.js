import { pool } from "../../database.js";
import { encryptPassword } from "../passwordEncripter.js";

let userAccountsSize = 0;

export const getUser = async (req, res) => {
  const [result] = await pool.query(
    "SELECT u.user_id, u.username, u.password, d.first_name, d.last_name, d.email, d.dni, d.phone_number, d.address, DATE_FORMAT(d.birthdate, '%Y-%m-%d') as birthdate FROM users u JOIN users_details d ON u.user_detail_id = d.user_detail_id WHERE u.state = TRUE"
  );
  res.status(200).json(result);
};

export const createUser = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    dni,
    phone_number,
    address,
    birthdate,
    password,
  } = req.body;
  const data = await getUserSize();
  userAccountsSize = Math.max(userAccountsSize, data.length) + 1;
  const user_detail_id = `UD00${
    userAccountsSize < 10 && userAccountsSize > 0 ? "0" : ""
  }${userAccountsSize}`;
  const username =
    first_name.substring(0, 3) +
    last_name.substring(last_name.length - 2) +
    birthdate.substring(0, 2);
  const hashPassword = await encryptPassword(password);
  const [result] = await pool.query(
    "INSERT INTO users_details VALUES (?,?,?,?,?,?,?,?,?)",
    [
      user_detail_id,
      first_name,
      last_name,
      email,
      dni,
      phone_number,
      address,
      birthdate,
      true,
    ]
  );
  if (result.affectedRows > 0) {
    const user_id = `U00${
      userAccountsSize < 10 && userAccountsSize > 0 ? "0" : ""
    }${userAccountsSize}`;
    const [result] = await pool.query(
      "INSERT INTO users VALUES (?,?,?,?,?,?)",
      [
        user_id,
        username.toLowerCase(),
        hashPassword,
        false,
        true,
        user_detail_id,
      ]
    );
    if (result.affectedRows) {
      return res.status(200).json({ message: "Usuario creado" });
    }
  }
  return res.status(500);
};

export const updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { first_name, last_name, email, phone_number, address } = req.body;
  const new_user_id = user_id.substring(user_id.length - 2);
  const [checkPhoneNumber] = await pool.query(
    "SELECT * FROM users_details WHERE phone_number = ?",
    [phone_number]
  );
  if (checkPhoneNumber.length > 0) {
    return res
      .status(404)
      .json({ message: "Ya hay alguien registrado con este numero" });
  }
  const [result] = await pool.query(
    "UPDATE users_details SET first_name = IFNULL(?,first_name), last_name = IFNULL(?,last_name), email = IFNULL(?,email), phone_number = IFNULL(?,phone_number), address = IFNULL(?,address) WHERE user_detail_id = ?",
    [first_name, last_name, email, phone_number, address, `UD00${new_user_id}`]
  );
  if (result.affectedRows > 0) {
    return res.status(200).json({ message: "Usuario actualizado" });
  }
};

export const deleteUserById = async (req, res) => {
  let { user_id } = req.params;
  user_id = user_id.substring(user_id.length - 2);
  const [result] = await pool.query(
    "UPDATE users SET state = ? WHERE user_id = ?",
    [false, `U00${user_id}`]
  );
  if (result.affectedRows > 0) {
    const [result] = await pool.query(
      "UPDATE users_details SET state = ? WHERE user_detail_id = ?",
      [false, `UD00${user_id}`]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Usuario eliminado" });
    }
  }
  return res.status(500);
};

const getUserSize = async (req, res) => {
  const [result] = await pool.query("SELECT * FROM users");
  console.log(result.length);
  return result;
};
