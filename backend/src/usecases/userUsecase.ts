import User from "../entity/userEntity";
import { Response, Request } from "express";
import IUserRepository from "./interface/IUserRepository";
import SendEmail from "../framework/services/SendEmail";
import JwtTokenService from "../framework/services/JwtToken";
import Cloudinary from "../framework/services/Cloudinary";

interface ResponseType {
  _id?: string;
  result?: User | {};
  status?: boolean;
  statusCode: number;
  message?: string;
  activationToken?: string;
  accessToken?: string;
  refreshToken?: string;
  authToken?: string;
}

class UserUseCase {
  private iUserRepository: IUserRepository;
  private sendEmail: SendEmail;
  private JwtToken: JwtTokenService;
  private Cloudinary: Cloudinary;

  constructor(
    iuserRepository: IUserRepository,
    sendEmail: SendEmail,
    jwtToken: JwtTokenService,
    cloudinary: Cloudinary
  ) {
    this.iUserRepository = iuserRepository;
    this.sendEmail = sendEmail;
    this.JwtToken = jwtToken;
    this.Cloudinary = cloudinary;
  }

  async registrationUser(user: User): Promise<ResponseType> {
    try {
      const email = user.email;
      const isEmailExists = await this.iUserRepository.findByEmail(email);

      if (isEmailExists) {
        return {
          status: false,
          message: "Account already exists",
          statusCode: 409,
        };
      }

      const subject = "Please provide this code for your registration";
      const code = Math.floor(100000 + Math.random() * 9000).toString();
      const sendEmail = await this.sendEmail.sendEmail({
        email,
        subject,
        code,
      });
      const token = await this.JwtToken.SignUpActivationToken(user, code);
      if (sendEmail) {
        return {
          status: true,
          statusCode: 200,
          message: "Otp has send to your email ",
          activationToken: token,
        };
      }

      return {
        status: true,
        statusCode: 200,
      };
    } catch (error) {
      console.log(error);
      return {
        status: false,
        statusCode: 500,
        message: "Internal server Error",
      };
    }
  }

  async checkUsername(username: string): Promise<ResponseType> {
    try {
      const isValid = await this.iUserRepository.checkUsernameValid(username);
      if (isValid) {
        return {
          statusCode: 422,
          message: "Username is not valid",
        };
      }

      return {
        statusCode: 200,
        message: "Username is valid",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internal server Error",
      };
    }
  }
  async activateUser(token: string, otp: string): Promise<ResponseType> {
    try {
      const data = await this.JwtToken.verifyOtpToken(token, otp);
      if ("user" in data) {
        const result = (await this.iUserRepository.createUser(data.user)) as {
          email: string;
          _id: string;
          role: string;
        };

        if (!result) {
          return {
            statusCode: 500,
            message: "error in creating the user",
          };
        } else {
          const { _id, role } = result;
          const accessToken = await this.JwtToken.SignInAccessToken({
            id: _id,
            role: role,
          });
          const refreshToken = await this.JwtToken.SignInRefreshToken({
            id: _id,
            role: role,
          });

          return {
            statusCode: 200,
            message: "User registered SuccessFully",
            ...result,
            accessToken,
            refreshToken,
          };
        }
      } else {
        return {
          statusCode: 401,
          ...data,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        status: false,
        statusCode: 500,
        message: "Internal server Error",
      };
    }
  }
  async resendOtp(token: string): Promise<ResponseType> {
    try {
      const otp = "resend";
      const result = await this.JwtToken.verifyOtpToken(token, otp);

      if ("user" in result) {
        const code = Math.floor(100000 + Math.random() * 9000).toString();
        const email = result.user.email;
        const subject = "Please provide the new code for the registration";

        const sendEmail = await this.sendEmail.sendEmail({
          email,
          subject,
          code,
        });
        const user = result.user;

        const token = await this.JwtToken.SignUpActivationToken(user, code);
        if (sendEmail) {
          return {
            statusCode: 200,
            message: "Otp has resend to the email",
            activationToken: token,
          };
        }
      }
      return {
        statusCode: 401,
        ...result,
      };
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        message: "Internal server Error",
      };
    }
  }
  async googleAuth(user: User): Promise<ResponseType> {
    try {
      const email = user.email;

      const emailExists = await this.iUserRepository.findByEmail(email);

      if (emailExists) {
        if (emailExists.isBlocked) {
          return {
            statusCode: 401,
            status: false,
            message: "User Blocked contect admin",
          };
        }
        const accessToken = await this.JwtToken.SignInAccessToken({
          id: emailExists._id as string,
          role: emailExists.role as string,
        });
        const refreshToken = await this.JwtToken.SignInRefreshToken({
          id: emailExists._id as string,
          role: emailExists.role as string,
        });

        const { _id, name, userName, email } = emailExists as User;
        return {
          statusCode: 200,
          message: "User logged In",
          result: {
            _id,
            name,
            userName,
            email,
          },
          accessToken,
          refreshToken,
        };
      } else {
        const savedUser = await this.iUserRepository.googleSignup(user);
        if (!savedUser) {
          return {
            statusCode: 500,
            status: false,
            message: "Error in creating user",
          };
        }
        const { _id, email } = savedUser;
        const token = await this.JwtToken.SignInAccessToken({
          id: savedUser._id as string,
          role: savedUser.role as string,
        });
        const refreshToken = await this.JwtToken.SignInRefreshToken({
          id: savedUser._id as string,
          role: savedUser.role as string,
        });
        return {
          statusCode: 201,
          status: true,
          message: "User registered Successfully",
          accessToken: token,
          refreshToken,
          result: {
            _id,
            email,
          },
        };
      }
    } catch (error) {
      console.log(error);
      return {
        status: false,
        statusCode: 500,
        message: "Internal server Error",
      };
    }
  }
  async loginUser(user: User): Promise<ResponseType> {
    try {
      const { password, email } = user;
      const emailExists = await this.iUserRepository.findByEmail(user.email);
      if (emailExists) {
        if (emailExists.isBlocked) {
          return {
            statusCode: 401,
            status: false,
            message: "User Blocked contect admin",
          };
        }
        const isValid = await this.iUserRepository.loginUser(
          emailExists.password,
          password
        );
        if (isValid) {
          const accessToken = await this.JwtToken.SignInAccessToken({
            id: emailExists._id,
            role: emailExists.role,
          });

          const refreshToken = await this.JwtToken.SignInRefreshToken({
            id: emailExists._id,
            role: emailExists.role,
          });
          return {
            statusCode: 200,
            accessToken,
            refreshToken,
            message: "User logged success fully",
            _id: emailExists._id,
          };
        } else {
          return {
            statusCode: 401,
            message: "Invalid Credentials",
          };
        }
      }
      return {
        statusCode: 401,
        message: "User dont exist",
      };
    } catch (error) {
      console.log(error);

      return {
        statusCode: 500,
        status: false,
        message: "Internal server error",
      };
    }
  }

  async loginWithOtp(user: User): Promise<ResponseType> {
    try {
      const email = user.email;
      const emailExists = await this.iUserRepository.findByEmail(user.email);

      if (!emailExists) {
        return {
          statusCode: 401,
          message: "Email provided is not registered",
        };
      }
      if (emailExists.isBlocked) {
        return {
          statusCode: 401,
          message: "User Blocked contect admin",
        };
      }

      const subject = "Please provide this code for your Login";
      const code = Math.floor(100000 + Math.random() * 9000).toString();
      const sendEmail = await this.sendEmail.sendEmail({
        email,
        subject,
        code,
      });

      const token = await this.JwtToken.SignUpActivationToken(user, code);
      if (!sendEmail) {
        return {
          statusCode: 500,
          message: "Internal Server error",
        };
      }
      return {
        statusCode: 200,
        accessToken: token,
        message: "Otp Has sent to the email",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internal Server error",
      };
    }
  }

  async submitOtp(token: string, code: string): Promise<ResponseType> {
    try {
      const data = await this.JwtToken.verifyOtpToken(token, code);

      if ("user" in data) {
        const email = data.user.email;
        const emailExists = (await this.iUserRepository.findByEmail(
          email
        )) as User;
        if (emailExists) {
          const refreshToken = await this.JwtToken.SignInRefreshToken({
            id: emailExists._id as string,
            role: emailExists.role as string,
          });

          const accessToken = await this.JwtToken.SignInAccessToken({
            id: emailExists._id as string,
            role: emailExists.role as string,
          });

          return {
            statusCode: 200,
            accessToken,
            refreshToken,
            _id: emailExists._id,
          };
        }
      }
      return {
        statusCode: 401,
        ...data,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: "Internal server error",
      };
    }
  }

  //create post
  async createPost(req: Request): Promise<ResponseType> {
    try {
      const { files } = req;
      const { description } = req.body;
      const { id } = req.params;
      const file = files.images;

      const cloudRes = await this.Cloudinary.cloudinaryUpload(file);

      if (Array.isArray(cloudRes)) {
        const imageUrlArray = cloudRes.map((document) => ({
          publicId: document.public_id,
          secure_url: document.secure_url,
        }));

        const post = await this.iUserRepository.addPost(
          id,
          description,
          imageUrlArray as []
        );

        if (post) {
          return {
            statusCode: 201,
            message: "Post added sucessfully",
          };
        }
        return {
          statusCode: 409,
          message: "unexpected error occured",
        };
      } else {
        const imageUrlArray = [
          {
            publicId: cloudRes.public_id,
            secure_url: cloudRes.secure_url,
          },
        ];
        const post = await this.iUserRepository.addPost(
          id,
          description,
          imageUrlArray as []
        );
        if (post) {
          return {
            statusCode: 201,
            message: "Post added sucessfully",
          };
        }
      }

      return {
        statusCode: 409,
        message: "unexpected error occured",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internal server error",
      };
    }
  }

  async getPost(userId: string): Promise<ResponseType> {
    try {
      const data = await this.iUserRepository.getPost(userId);
      if (data) {
        return {
          statusCode: 200,
          result: data,
        };
      }
      return {
        statusCode: 409,
        message: "unexpected error occured",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internal server error",
      };
    }
  }
  async getUser(userId: string): Promise<ResponseType> {
    try {
      const user = await this.iUserRepository.getUser(userId);
      if (user) {
        return {
          statusCode: 200,
          result: user,
        };
      }
      return {
        statusCode: 409,
        message: "unexpected error occured",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internak server error",
      };
    }
  }

  async suggestUsers(req: Request): Promise<ResponseType> {
    try {
      const user = await this.iUserRepository.getSuggestion(req);
      if (user) {
        return {
          statusCode: 200,
          result: user,
        };
      }
      return {
        statusCode: 409,
        message: "unexpected error occured",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internak server error",
      };
    }
  }

  async followUser(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.followUser(req);
      if (result) {
        return {
          statusCode: 200,
          message: "Follower User success fully",
        };
      }
      return {
        statusCode: 409,
        message: "unexpected error occured",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internal sever error",
      };
    }
  }
  async unFollowUser(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.unFollowUser(req);
      if (result) {
        return {
          statusCode: 200,
          message: "unfollowed User success fully",
        };
      }
      return {
        statusCode: 409,
        message: "unexpected error occured",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internal sever error",
      };
    }
  }
  async getPostData(id: string): Promise<ResponseType> {
    try {
      const response = await this.iUserRepository.fetchPostData(id);

      if (response) {
        return {
          statusCode: 200,
          message: "post fetched sucessfully",
          result: response,
        };
      }

      return {
        statusCode: 409,
        message: "unexpected error occured",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "internal server error",
      };
    }
  }

  async likePost(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.likePost(req);
      if (result) {
        return { statusCode: 200, message: "Liked the post" };
      }

      return {
        statusCode: 409,
        message: "unexpected error occured",
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: "Internal  sever error",
      };
    }
  }

  async UnLikePost(req: Request): Promise<ResponseType> {
    try {
      const result = await this.iUserRepository.unlikePost(req);
      if (result) {
        return { statusCode: 200, message: "uniLiked the post" };
      }
      return {
        statusCode: 409,
        message: "unexpected error occured",
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: "Internal  sever error",
      };
    }
  }

  async verifyEditEmail(req: Request): Promise<ResponseType> {
    try {
      const { email } = req.body;

      const emailExist = await this.iUserRepository.findByEmail(email);
      if (emailExist) {
        return {
          statusCode: 409,
          message: "This email aready exixt please try another one",
        };
      }

      const subject = "Please provide this code for your verification";
      const code = Math.floor(100000 + Math.random() * 9000).toString();
      const sendEmail = await this.sendEmail.sendEmail({
        email,
        subject,
        code,
      });
      const token = await this.JwtToken.SignUpActivationToken(
        { email: email } as User,
        code
      );
      if (sendEmail) {
        return {
          status: true,
          statusCode: 200,
          message: "Otp has send to your email ",
          activationToken: token,
        };
      }
      return {
        statusCode: 409,
        message: "unexpected error occured",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "internal server error",
      };
    }
  }
  async verifyEmailEditOtp(token: string, otp: string): Promise<ResponseType> {
    try {
      const data = await this.JwtToken.verifyOtpToken(token, otp);
      if ("user" in data) {
        return {
          statusCode: 200,
          message: "Email success fully verified",
        };
      }

      return {
        statusCode: 401,
        ...data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "internal server error",
      };
    }
  }
  async editUserDetails(req: Request): Promise<ResponseType> {
    try {
      console.log(req.body);
      const { files } = req;
      const file = files.newProfile;
      if (file) {
        const cloudRes = await this.Cloudinary.cloudinaryUpload(file);
        console.log();

        const result = await this.iUserRepository.updateUserDetails(
          req,
          cloudRes
        );
        if (result) {
          return {
            statusCode: 200,
            message: "User details updated successfully",
          };
        }
        return {
          statusCode: 409,
          message: "unexpected error occured",
        };
      } else {
        const result = await this.iUserRepository.updateUserDetails(req, {});
        if (result) {
          return {
            statusCode: 200,
            message: "User details updated successfully",
          };
        }
      }

      return {
        statusCode: 409,
        message: "unexpected error occured",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internal server error",
      };
    }
  }
  async getPostDetails(req: Request): Promise<ResponseType> {
    try {
      const post = await this.iUserRepository.getPostDetails(req);

      if (post) {
        return {
          statusCode: 200,
          result: post,
        };
      }
      return {
        statusCode: 409,
        message: "unexpected error occured",
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internal server error",
      };
    }
  }

  async addComment(req: Request): Promise<ResponseType> {
    try {
      const comment = await this.iUserRepository.addComment(req);

      if (comment) {
        return {
          statusCode: 200,
          message: "added the comment",
          result: comment,
        };
      } else {
        return {
          statusCode: 409,
          message: "unexpected error occured",
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: "Internal server error",
      };
    }
  }
}

export default UserUseCase;
