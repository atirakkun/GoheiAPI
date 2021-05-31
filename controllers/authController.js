const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

//Crear JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Enviar JWT como cookie
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.httpOnly = true;
  }
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({ status: "success", token, data: { user } });
};

//Crear nueva cuenta
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

//Iniciar sesión
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //Comprobar que email y password existen
  if (!email || !password) {
    return next(
      new AppError("Por favor introduzca correo electrónico y contraseña", 400)
    );
  }
  //Comprobar que el usuario existe y password es correcta
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError("Correo electrónico o contraseña incorrectos", 401)
    );
  }
  //Enviar token
  createSendToken(user, 200, res);
});

//Proteger rutas de usuarios no logueados
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //Obtener el token y comprobar si existe
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new AppError(
        "¡No ha iniciado sesión! Por favor inicie sesión para obtener acceso",
        401
      )
    );
  }
  //Verificar el token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //Comprobar si el usuario existe
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError("El usuario al que pertenece este token ya no existe", 401)
    );
  }
  //Comprobar si el usuario cambio password despues del token fue creado
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "¡El usuario cambió la contraseña hace poco! Por favor inicie sesión de nuevo",
        401
      )
    );
  }
  //Todo bien
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("No tiene permiso para realizar esa acción", 403)
      );
    }
    next();
  };
};

//Enviar correo con código de reseteo
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Obtener el usuario en base al email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new AppError("No existe un usuario con ese correo electrónico", 404));
  }
  //Generar token aleatorio
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //Enviarlo en un email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `¿Olvido su contraseña? Envíe una petición PATCH con su nueva contraseña y la confirmación a: ${resetURL}.\n¡Si no olvidó su contraseña, por favor ignore este correo!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Su token de reseteo de contraseña (válido por 10 min)",
      message,
    });

    res
      .status(200)
      .json({ status: "success", message: "Token sent to email!" });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

//Cambiar password con el código de reseteo
exports.resetPassword = catchAsync(async (req, res, next) => {
  //Obtener el usuario del token y comprobar que el token no ha expirado
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  //Si existe el usuario, cambiar la password y actualizar la ultima vez que se cambió
  if (!user) {
    next(new AppError("El token es inválido o ha caducado", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();
  //Log in al usuario, enviar jwt
  createSendToken(user, 200, res);
});

//Actualizar password una vez conectado
exports.updatePassword = catchAsync(async (req, res, next) => {
  //Obtener el usuario
  const user = await User.findById(req.user.id).select("+password");
  //Comprobar si la password es correcta
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    next(new AppError("Tu contraseña actual es incorrecta", 401));
  }
  //Actualizar la password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //Enviar JWT
  createSendToken(user, 200, res);
});
