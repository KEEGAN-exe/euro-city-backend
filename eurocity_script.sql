CREATE DATABASE IF NOT EXISTS eurocity;
USE eurocity;

CREATE TABLE users_details (
	user_detail_id VARCHAR(255) PRIMARY KEY NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    dni VARCHAR(8) NOT NULL UNIQUE,
    phone_number VARCHAR(9) NOT NULL UNIQUE,
    address VARCHAR(100) NOT NULL,
    birthdate DATE NOT NULL,
    state BOOLEAN NOT NULL
);

CREATE TABLE users (
	user_id VARCHAR(255) PRIMARY KEY NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    credential BOOLEAN NOT NULL,
    state BOOLEAN NOT NULL,
    user_detail_id VARCHAR(255) NOT NULL UNIQUE,
    FOREIGN KEY (user_detail_id) REFERENCES users_details(user_detail_id)
);

CREATE TABLE categories (
	category_id VARCHAR(255) PRIMARY KEY NOT NULL,
    category_name VARCHAR(50) NOT NULL,
    state BOOLEAN NOT NULL
);

CREATE TABLE suppliers (
	supplier_id VARCHAR(255) PRIMARY KEY NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    address VARCHAR(100) NOT NULL,
    phone_number VARCHAR(9) NOT NULL,
    email VARCHAR(100) NOT NULL,
    state BOOLEAN NOT NULL
);

CREATE TABLE products (
    product_id VARCHAR(255) PRIMARY KEY NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    create_date DATE NOT NULL,
    stock INT NOT NULL,
    price DOUBLE NOT NULL,
    image VARCHAR(255),
    state BOOLEAN NOT NULL,
    category_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE receipts_details (
	receipt_details_id VARCHAR(255) PRIMARY KEY NOT NULL,
	product_id VARCHAR(255) NOT NULL,
    supplier_id VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    amount FLOAT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

CREATE TABLE receipts (
	receipt_id VARCHAR(255) PRIMARY KEY NOT NULL,
    create_date DATE NOT NULL,
    total_amount FLOAT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    receipt_details_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (receipt_details_id) REFERENCES receipts_details(receipt_details_id)
);

/* ============================================================================== */
/* 									CONSULTAS									  */
/* ============================================================================== */

SELECT * FROM users;
SELECT * FROM users_details;


















