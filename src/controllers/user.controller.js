import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Users } from "../models/users.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiRespons } from "../utils/ApiRespons.js";
import jwt from "jsonwebtoken";

const generateAccessRefreshToken = async (userID) => {
  try {
    const user = await Users.findById(userID);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while genreting RefreshToken and AccessToken "
    );
  }
};

const signUpUser = asyncHandler(async (req, res) => {
  // ✅ get user details from frontend
  // ✅ validation - not empty
  // ✅ check if user already exists : username, email
  // ✅ check for images, check for avatar
  // ✅ upload them to cloudinary, avatar
  // ✅ create user object - create entry in db
  // ✅ remove password and refresh token field from response
  // ✅ check for user creation
  // ✅ return res

  const { username, password, email, role } = req.body;
  // console.log(email);

  if (
    [username, password, email, role].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await Users.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is requird");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Not Able to uplode avatar");
  }

  const user = await Users.create({
    email,
    role: role.toLowerCase(),
    avatar: avatar.url,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await Users.findById(user._id).select(
    " -password -refreshToken "
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while SignUp the user");
  }

  return res
    .status(200)
    .json(new ApiRespons(200, createdUser, "User registerd Successfully"));
});

const logInUser = asyncHandler(async (req, res) => {
  // ✅ get user details from frontend
  // ✅ validation - not empty
  // ✅ check if user already exists : username, email
  // ✅ passward check
  // ✅ genrate refresh token and access token for user
  // ✅ send cookie

  const { username, email, password } = await req.body;

  if (!username && !email) {
    throw new ApiError(400, "username and emaail is required");
  }

  const user = await Users.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not Found");
  }

  const isPasswordCorret = await user.comparePassword(password);

  if (!isPasswordCorret) {
    throw new ApiError(401, "Invalid Password");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id
  );
  // console.log("Generated Access Token:", accessToken);
  const loggedInUser = await Users.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiRespons(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged In Successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await Users.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiRespons(200, {}, "User logged out Successfully"));
});

const updateAccessToken = asyncHandler(async (req, res) => {
  const incommigRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incommigRefreshToken) {
    throw new ApiError(401, "Unathuorize Requst");
  }

  const decodeRefreshToken = jwt.verify(
    incommigRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  // console.log(decodeRefreshToken);

  const user = await Users.findById(decodeRefreshToken.id);

  if (!user) {
    throw new ApiError(404, "Invalid Refresh Token");
  }

  if (incommigRefreshToken !== user?.refreshToken) {
    throw new ApiError(402, "Invalid Refresh Token");
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  const { accessToken, newRefreshToken } = generateAccessRefreshToken(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiRespons(200, {}, "Access Token Update Successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiRespons(200, req.user, "User fetched successfully"));
});

const adminController = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiRespons(200, req.user._id, "admin dashboard successfully"));
});

export {
  signUpUser,
  logInUser,
  logOutUser,
  updateAccessToken,
  getCurrentUser,
  adminController,
};
