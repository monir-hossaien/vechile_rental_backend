import { Request } from "express";
import { pool } from "../../config/db";
import bcrypt from "bcrypt";
import { generateToken } from "../../helpers/jwt";

// signup
export const signUp = async (req: Request) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase()],
    );

    if (existingUser.rows.length > 0) {
      return {
        statusCode: 400,
        message: "User with this email already exists",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, email.toLowerCase(), hashedPassword, phone, role || "customer"],
    );

    if (newUser.rows.length > 0) {
      return {
        success: true,
        message: "User registered successfully",
        data: {
          id: newUser.rows[0].id,
          name: newUser.rows[0].name,
          email: newUser.rows[0].email,
          phone: newUser.rows[0].phone,
          role: newUser.rows[0].role,
        },
      };
    } else {
      return {
        success: false,
        statusCode: 400,
        message: "Failed to register user",
      };
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    };
  }
};

// signin
export const signIn = async (req: Request) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (user.rows.length === 0) {
      return {
        statusCode: 404,
        message: "User not found",
      };
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      user.rows[0].password,
    );
    if (!isPasswordValid) {
      return {
        statusCode: 401,
        message: "Invalid credentials",
      };
    }

    // generate token
    const tokenPayload = {
      id: user.rows[0].id as number,
      email: user.rows[0].email as string,
      role: user.rows[0].role as string,
    };

    const token = generateToken(tokenPayload);

    return {
      success: true,
      message: "Login successful",
      data: {
        token: token,
        user: {
          id: user.rows[0].id,
          name: user.rows[0].name,
          email: user.rows[0].email,
          phone: user.rows[0].phone,
          role: user.rows[0].role,
        },
      },
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    };
  }
};
