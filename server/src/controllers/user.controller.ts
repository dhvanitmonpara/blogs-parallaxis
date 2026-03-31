import { Response } from "express"
import prisma from "@/db/index.js"
import bcrypt from "bcryptjs"
import { ApiError } from "@/lib/ApiError"
import generateAccessToken from "@/lib/generateAccessToken"

const options = {
  httpOnly: true,
  secure: true
}

const sanitizeUser = (user) => ({
  ...user,
  password: undefined,
  refreshToken: undefined,
})

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })

    if (!user) {
      throw new ApiError(404, "User does not exists")
    }
    const accessToken = generateAccessToken(user.id, user.email)
    const refreshToken = generateAccessToken(user.id, user.email)

    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        refreshToken
      }
    })

    return { accessToken, refreshToken }
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token")
  }
}

const registerUser = async (req, res: Response) => {

  try {
    const { fullName, email, username, password } = req.body

    if (
      [fullName, email, username, password].some(field => field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required")
    }

    const existedUser = await prisma.user.findFirst({
      where: {
        email
      }
    })

    if (existedUser) {
      throw new ApiError(409, "User with email or username already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      }
    })

    if (!user) {
      throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res
      .status(201)
      .json({ user: sanitizeUser(user), message: "User registered successfully" })
  } catch (error) {
    console.log(error)
    throw new ApiError(500, "Something went wrong while registering the user")
  }
}

const loginUser = async (req, res: Response) => {

  try {
    const { username, email, password } = req.body

    if (!username && !email) {
      throw new ApiError(400, "Username or Email is required")
    }

    if (password === "") {
      throw new ApiError(400, "Password is required")
    }

    const user = await prisma.user.findFirst({
      where: { email }
    })

    if (!user) {
      throw new ApiError(404, "User does not exists")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id)

    const loggedInUser = await prisma.user.findUnique({
      where: {
        id: user.id
      }
    })

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        {
          user: sanitizeUser(loggedInUser),
          accessToken,
          refreshToken
        }
      )
  } catch (error) {
    throw new ApiError(500, "Something went wrong while logging in the user")
  }
}

const logoutUser = async (req, res: Response) => {

  try {
    res.clearCookie("accessToken", options)
    res.clearCookie("refreshToken", options)

    await prisma.user.update({
      where: {
        id: req.user.id
      },
      data: {
        refreshToken: null
      }
    })

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "User logged Out" })
  } catch (error) {
    throw new ApiError(500, "Something went wrong while logging out the user")
  }
}

export {
  registerUser,
  loginUser,
  logoutUser,
}
