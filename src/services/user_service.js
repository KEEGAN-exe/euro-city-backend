import { pool } from "../../database.js";
import { encryptPassword } from "../passwordEncripter.js";

let userDetailAccountsSize = 0;
let userAccountSize = 0;

export const getUser = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT u.user_id, u.username, u.password, d.first_name, d.last_name, d.email, d.dni, d.phone_number, d.address, DATE_FORMAT(d.birthdate, '%Y-%m-%d') as birthdate FROM users u JOIN users_details d ON u.user_detail_id = d.user_detail_id WHERE u.state = TRUE"
    );
    if (result) {
      return res.status(200).json(result);
    }
    return res.status(204).send();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Error intenro del servidor", error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
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
    if (
      !first_name ||
      !last_name ||
      !email ||
      !dni ||
      !phone_number ||
      !address ||
      !birthdate ||
      !password
    ) {
      return res.status(400).json({
        message:
          "El nombre, apellido, correo, dni, numero de telefono, direccion, fecha de nacimiento y contraseña son requeridos",
      });
    }
    const uniqueData = await checkUniqueUser(email, dni, phone_number);
    if (uniqueData) {
      return res
        .status(400)
        .json({ message: "Datos duplicados, prueba con otros datos" });
    }

    const user_detail_id = await generateUserDetailId();
    const username = await generateUserName(first_name, last_name, birthdate);
    if (!username) {
      return res
        .status(500)
        .json({ message: "Hubo un error al crear el nombre de usuario" });
    }
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
      const user_id = await generateUserId();
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
    return res.status(500).json({ message: "Error al crear al usuario" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log(user_id);
    const { first_name, last_name, email, phone_number, address } = req.body;

    if (!(first_name || last_name || email || phone_number || address)) {
      return res.status(400).json({
        message:
          "Se requiere al menos el nombre, apellido, correo, número de teléfono o dirección",
      });
    }

    const [userData] = await findLocalUserById(user_id);
    if (userData.length === 0) {
      return res.status(404).json({ message: "El usuario no existe" });
    }
    const uniqueData = await checkUniqueUpdateUser(
      email,
      address,
      phone_number
    );
    if (uniqueData) {
      return res.status(400).json({ message: "Los datos deben ser unicos" });
    }
    const [result] = await pool.query(
      "UPDATE users_details SET first_name = IFNULL(?,first_name), last_name = IFNULL(?,last_name), email = IFNULL(?,email), phone_number = IFNULL(?,phone_number), address = IFNULL(?,address) WHERE user_detail_id = ?",
      [
        first_name,
        last_name,
        email,
        phone_number,
        address,
        userData.user_detail_id,
      ]
    );
    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Usuario actualizado" });
    }
    return res.status(500).json({ message: "Error al actualizar el usuario" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

export const findUserById = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({ message: "ID del usuario requerido" });
    }
    const userExist = await checkExistUser(user_id);
    if (!userExist) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const [result] = await pool.query(
      "SELECT u.user_id, u.username, u.password, d.first_name, d.last_name, d.email, d.dni, d.phone_number, d.address, DATE_FORMAT(d.birthdate, '%Y-%m-%d') as birthdate FROM users u JOIN users_details d ON u.user_detail_id = d.user_detail_id WHERE u.user_id = ? AND u.state = TRUE",
      [user_id]
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

export const deleteUserById = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(404).json({ message: "ID del usuario requerido" });
    }
    const [userData] = await findLocalUserById(user_id);
    if (userData.length === 0) {
      return res.status(404).json({ message: "El usuario no existe" });
    }
    const [result] = await pool.query(
      "UPDATE users SET state = ? WHERE user_id = ?",
      [false, user_id]
    );
    if (result.affectedRows > 0) {
      const [result] = await pool.query(
        "UPDATE users_details SET state = ? WHERE user_detail_id = ?",
        [false, userData.user_detail_id]
      );
      if (result.affectedRows > 0) {
        return res.status(200).json({ message: "Usuario eliminado" });
      }
    }
    return res.status(500).json({ message: "Error al eliminar el usuario" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

const findLocalUserById = async (user_id) => {
  try {
    const [result] = await pool.query(
      "SELECT u.user_id, u.username, u.password, d.first_name, d.last_name, d.email, d.dni, d.phone_number, d.address, DATE_FORMAT(d.birthdate, '%Y-%m-%d') as birthdate, u.user_detail_id FROM users u JOIN users_details d ON u.user_detail_id = d.user_detail_id WHERE u.user_id = ? AND u.state = TRUE",
      [user_id]
    );
    if (result.length > 0) {
      return result;
    }
    return [];
  } catch (error) {
    console.log(error);
    return false;
  }
};

const getUserDetailSize = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM users_details");
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getUserSize = async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM users");
    return result;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const generateUserDetailId = async () => {
  const data = await getUserDetailSize();
  userDetailAccountsSize = Math.max(userDetailAccountsSize, data.length) + 1;
  const user_detail_id = `UD00${
    userDetailAccountsSize < 10 && userDetailAccountsSize > 0 ? "0" : ""
  }${userDetailAccountsSize}`;
  return user_detail_id;
};

const generateUserId = async () => {
  const data = await getUserSize();
  userAccountSize = Math.max(userAccountSize, data.length) + 1;
  const user_id = `U00${
    userAccountSize < 10 && userAccountSize > 0 ? "0" : ""
  }${userAccountSize}`;
  return user_id;
};

const generateUserName = async (first_name, last_name, birthdate) => {
  try {
    let username =
      first_name.substring(0, 3) +
      last_name.substring(last_name.length - 2) +
      birthdate.substring(0, 2);

    const [data] = await pool.query(
      "SELECT * FROM users WHERE username = ? and STATE = true",
      [username]
    );

    while (data.length > 0) {
      username += Math.floor(Math.random() * 10);
      [data] = await pool.query(
        "SELECT * FROM users WHERE username = ? and STATE = true",
        [username]
      );
    }

    return username;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const checkUniqueUser = async (email, dni, phone_number) => {
  try {
    const [data] = await pool.query(
      "SELECT * FROM users_details WHERE email = ? || dni = ? || phone_number = ? AND state = TRUE",
      [email, dni, phone_number]
    );
    return data.length > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const checkExistUser = async (user_id) => {
  try {
    const [existUser] = await pool.query(
      "SELECT * FROM users WHERE user_id = ? AND state = TRUE",
      [user_id]
    );
    if (existUser.length > 0) {
      const [existUserDetail] = await pool.query(
        "SELECT * FROM users_details WHERE user_detail_id = ? AND state = TRUE",
        [existUser[0].user_detail_id]
      );
      return existUserDetail.length > 0;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const checkUniqueUpdateUser = async (email, address, phone_number) => {
  try {
    const [data] = await pool.query(
      "SELECT * FROM users_details WHERE email = ? || address = ? || phone_number = ? AND state = TRUE",
      [email, address, phone_number]
    );
    return data.length > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
};
