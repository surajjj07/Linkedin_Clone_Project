import jwt from "jsonwebtoken";

// function for generating token using jwt (Json Web Token)
const genToken = async (userId) => {
  try {
    let token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

export default genToken;
