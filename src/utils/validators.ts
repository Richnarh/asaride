import { IsEmail, IsNotEmpty, Length, Matches, MinLength } from 'class-validator';

export class UserValidator {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  emailAddress: string | undefined;

  @IsNotEmpty({ message: 'Name is required' })
  fullName?: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^(?:(?:\+233)|0)(?:[2357]\d{8}|[23][2-9]\d{7})$/, { message: 'Invalid phone number format' })
  phoneNumber?: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '1. Password must contain at least one uppercase letter, 2. Password must contain at least one lowercase letter,  3. Password must contain at least one number, 4. Password must contain at least one special character',
  })
  password?: string;
}

export class VerifyOtpValidator {
  @IsNotEmpty({ message: 'User ID is required' })
  userId?: string;

  @IsNotEmpty({ message: 'OTP code is required' })
  @Length(6, 6, { message: 'OTP code must be 6 digits' })
  code?: string;
}

export class LoginUserValidator {
  @IsEmail({}, { message: 'Invalid email format' })
  emailAddress?: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^(?:(?:\+233)|0)(?:[2357]\d{8}|[23][2-9]\d{7})$/, { message: 'Invalid phone number format' })
  phoneNumber?: string;
}

export class RefreshTokenValidator {
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken?: string;
}

export class Js {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private static readonly PHONE_REGEX = /^(?:(?:\+233)|0)(?:[2357]\d{8}|[23][2-9]\d{7})$/;
  private static readonly MAX_EMAIL_LENGTH = 254; // Standard max email length (RFC 5321)

  static isValidPhone = (phoneNumber: string): { isValid: boolean; message?: string } => {
    const phone = phoneNumber.trim();
    if (!Js.PHONE_REGEX.test(phone)) {
      return { isValid: false, message: 'Invalid phone number format' };
    }
    return { isValid: true };
  }

  static isValidEmail = (email: string): { isValid: boolean; message?: string } => {
    const emailAddress = email.trim();
    if (emailAddress.length > Js.MAX_EMAIL_LENGTH) {
      return { isValid: false, message: 'Email length exceeds maximum limit' };
    }
    if (!Js.EMAIL_REGEX.test(emailAddress)) {
      return { isValid: false, message: 'Invalid email format' };
    }

    return { isValid: true };
  }
}
