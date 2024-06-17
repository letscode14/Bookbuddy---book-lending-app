export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (emailRegex.test(email)) {
    return true;
  } else {
    return false;
  }
};

export const validatePassword = (password) => {
  const hasCapitalLetter = /[A-Z]/.test(password);
  const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasAlphabet = /[a-zA-Z]/.test(password);

  if (!hasCapitalLetter) {
    return "Uppercase is missing";
  }
  if (!hasSpecialCharacter) {
    return "Special charecter is missing [$%^&]";
  }
  if (!hasNumber) {
    return "Number is missing";
  }

  if (!hasAlphabet) {
    return "Alphabets is missing";
  }

  if (password.length < 8) {
    return "Password must hav 8 character";
  }
  return true;
};
