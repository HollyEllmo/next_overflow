"use server";

import User from "@/databae/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/databae/question.model";

export async function getUserById(params: any) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    await connectToDatabase();

    const { clerkId } = params;

    // Сначала находим пользователя по clerkId
    const user = await User.findOne({ clerkId });
    if (!user) {
      throw new Error("User not found");
    }

    // Теперь, когда у нас есть пользователь, мы можем получить его _id
    const userId = user._id;

    // Далее удаляем вопросы, связанные с пользователем
    await Question.deleteMany({ author: userId });

    // TODO: удаление ответов, комментариев и других связанных данных

    // И, наконец, удаляем самого пользователя
    const deletedUser = await User.findByIdAndDelete(userId);

    // Вызываем revalidatePath, если это необходимо
    // revalidatePath(path);

    return deletedUser;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
