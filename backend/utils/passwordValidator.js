const AppError = require('./appError');

const passwordRegex = {
  minLength: /.{12,}/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
};

const validatePassword = (password) => {
  const errors = [];

  if (!passwordRegex.minLength.test(password)) {
    errors.push('Le mot de passe doit contenir au moins 12 caractères');
  }

  if (!passwordRegex.uppercase.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }

  if (!passwordRegex.lowercase.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }

  if (!passwordRegex.number.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  if (!passwordRegex.symbol.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()_+-=[]{};\':"|,.<>/?)');
  }

  if (errors.length > 0) {
    throw new AppError(errors.join('. '), 400);
  }

  return true;
};

const checkPasswordStrength = (password) => {
  let strength = 0;
  const checks = {
    length: password.length >= 12,
    extraLength: password.length >= 16,
    uppercase: passwordRegex.uppercase.test(password),
    lowercase: passwordRegex.lowercase.test(password),
    number: passwordRegex.number.test(password),
    symbol: passwordRegex.symbol.test(password)
  };

  Object.values(checks).forEach(check => {
    if (check) strength++;
  });

  if (strength <= 3) return 'weak';
  if (strength <= 5) return 'medium';
  return 'strong';
};

module.exports = {
  validatePassword,
  checkPasswordStrength
};