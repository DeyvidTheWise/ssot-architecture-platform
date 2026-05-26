import bcrypt from "bcrypt";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { signJwt } from "../../utils/jwt";

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const SALT_ROUNDS = 10;

export const authService = {
  async register(input: RegisterInput): Promise<{ token: string; user: { id: string; email: string; firstName: string; lastName: string; role: "ADMIN" | "ARCHITECT" | "DEVELOPER" | "VIEWER" } }> {
    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      throw new AppError("Email is already registered", "CONFLICT", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName
      }
    });

    const token = signJwt({ sub: user.id, role: user.role, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  },

  async login(input: LoginInput): Promise<{ token: string; user: { id: string; email: string; firstName: string; lastName: string; role: "ADMIN" | "ARCHITECT" | "DEVELOPER" | "VIEWER" } }> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
      throw new AppError("Invalid email or password", "UNAUTHORIZED", 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", "UNAUTHORIZED", 401);
    }

    const token = signJwt({ sub: user.id, role: user.role, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    };
  }
};